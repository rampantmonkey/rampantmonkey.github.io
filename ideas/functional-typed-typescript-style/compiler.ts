import {Tree} from '../tree';
import {thenOk, Err, isErr, Ok, isOk, Result as R} from '../../../prelude';
import {Compilation, NodeBody, Template, Section, Prompt, Review, Text, MultipleChoice} from './';
type Template = Tree<NodeBody>;

export type CompilationResult = R<Template, Compilation>;

import {Value, Context, Error, Result, str, regex, seq, any, many, optional, optionalDefault, map} from './combinator';

const openParen = regex(/\s*\(\s*/g, '(');
const closeParen = regex(/\s*\)\s*/g, ')');
const quotedString = map(regex(/"(?:[^"\\]|\\.)+"/g, 'quoted string'), (match) => match.replace(/^"(.*)"$/, '$1'));

const listQuotedString = map(seq<any>([quotedString, optional(many(seq<any>([regex(/\s+/g, 'whitespace'), quotedString])))])
                            ,([qs, rest]) => rest ? [qs, ...rest.map(([_, r]: [any, string]) => r)] : [qs]
                            );

const parse = (text: string): Result<Template> => {
  let result = template({text, index: 0});
  if(isOk(result) && result.value.ctx.index !== text.length) {
    return Err(Error(result.value.ctx, `Template contains trailing characters: ${text.substr(result.value.ctx.index)}`));
  }
  return result;
};

export const compile = (text: string): CompilationResult => {
  let result = parse(text);
  if(isOk(result)) {
    return Ok(result.value.value);
  }

  if(isErr(result)) {
    return Err(Compilation(result));
  }

  throw "Unreachable";
}

const prompt = any([map(seq<any>([openParen, str('prompt'), closeParen])
                       ,([_lparen, _label, _rparen]) => Tree(Prompt('', Text()))
                       )
                   ,map(seq<any>([openParen, regex(/prompt\s+/g, 'prompt'), quotedString, closeParen])
                       ,([_lparen, _label, body, _rparen]) => Tree(Prompt(body, Text()))
                       )
                   ,map(seq<any>([openParen, regex(/prompt\s+/g, 'prompt'), quotedString, openParen, regex(/multiple-choice\s+/g, 'multiple-choice'), listQuotedString, closeParen, closeParen])
                       ,([_lparen, _label, body, _lparen2, _label2, choices, _rparen, _rparen2]) => Tree(Prompt(body, MultipleChoice(choices)))
                       )
                   ]);

function section(ctx: Context): Result<Tree<NodeBody>> {
  return any([map(seq<any>([openParen, str('section'), closeParen])
                 ,([_lparen, _label, _rparen]) => Tree(Section())
                 )
             ,map(seq<any>([openParen, regex(/section\s+/g, 'section'), many(any([section, prompt, review])), closeParen])
                 ,([_lparen, _label, children, _rparen]) => Tree(Section(), children)
                 )
             ])(ctx);
}

function review(ctx: Context): Result<Tree<NodeBody>> {
 return map(seq<any>([openParen, regex(/review\s+/g, 'review'), many(any([section, prompt, review])), closeParen])
           ,([_lparen, _label, children, _rparen]) => Tree(Review(), children)
           )(ctx);
}

const templateChild = any([section, prompt, review]);
const templateChildren = many(templateChild);

const template = any([map(seq<any>([openParen, optional(templateChildren), closeParen])
                         ,([_lparen, children, _rparen]) => Tree(Template(), children?? [])
                         )
                     ,map(templateChildren
                         ,(children) => Tree(Template(), children)
                         )
                     ]);
