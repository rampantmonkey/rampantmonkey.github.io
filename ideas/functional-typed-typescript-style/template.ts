import { Ok, Err, Id, isOk, isErr, Result } from '../../../prelude';
import { Tree as Tree_ } from '../tree';

export { compile } from './compiler';

export { renderSexpr, debugRenderASCII, renderTasks, FlattenedTasks } from './render';

export type Compilation = { _tag: 'Compilation'; underlying: any};
export const Compilation = (underlying: any) => <Compilation>{ _tag: 'Compilation', underlying };

type Text = { _tag: 'Text' };
type MultipleChoice = {
  _tag: 'MultipleChoice';
  choices: Array<string>;
};

export const Text = (): PromptType => <Text>{_tag: 'Text'};
export const MultipleChoice = (choices: Array<string>): PromptType => <MultipleChoice>{_tag: 'MultipleChoice', choices};

export const isText = (pt: PromptType): pt is Text => pt._tag === 'Text';
export const isMultipleChoice = (pt: PromptType): pt is MultipleChoice => pt._tag === 'MultipleChoice';

export type PromptType = Text | MultipleChoice;

type Review = {
  _tag: 'Review';
};

type Prompt = {
  _tag: 'Prompt';
  text: string;
  type: PromptType;
};

type Section = {
  _tag: 'Section';
};

type Template = {
  _tag: 'Template';
};

export const Review = (): NodeBody => <Review>{_tag: 'Review'};
export const Prompt = (text: string, type: PromptType): NodeBody => <Prompt>{_tag: 'Prompt', text, type};
export const Section = (): NodeBody => <Section>{_tag: 'Section'};
export const Template = (): NodeBody => <Template>{_tag: 'Template'};

export const isReview = (nb: NodeBody): nb is Review => nb._tag === 'Review';
export const isPrompt = (nb: NodeBody): nb is Prompt => nb._tag === 'Prompt';
export const isSection = (nb: NodeBody): nb is Section => nb._tag === 'Section';
export const isTemplate = (nb: NodeBody): nb is Template => nb._tag === 'Template';

export type NodeBody = Review | Prompt | Section | Template;

export type Tree = Tree_<NodeBody>;
