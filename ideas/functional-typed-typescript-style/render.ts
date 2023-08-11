import { Id } from '../../../prelude';
import { isReview, isSection, isPrompt, isTemplate, isText, isMultipleChoice, Tree } from './';

export const renderSexpr = (t: Tree, prefix: string = ''): string => {
  let result = '';

  if(isTemplate(t.body)) {
    result += t.children.map(c => renderSexpr(c, prefix)).join('\n')
  }

  if(isSection(t.body)) {
    result += `${prefix}(section\n`;
    result += t.children.map(c => renderSexpr(c, prefix + '  ')).join('\n')
    result += ')';
  }

  if(isPrompt(t.body)) {
    result += `${prefix}(prompt ${t.body.text})`;
  }

  if(isReview(t.body)) {
    result += `${prefix}(review\n`;
    result += t.children.map(c => renderSexpr(c, prefix)).join('\n');
    result += ')';
  }

  return result;
};

export const debugRenderASCII = (t: Tree, prefix: string = ''): string => {
  let result = '';

  if(isTemplate(t.body)) {
    result += `${prefix}- template\n`;
    result += t.children.map(c => debugRenderASCII(c, prefix + '  |')).join('\n');
  }

  if(isSection(t.body)) {
    result += `${prefix}- section\n`;
    result += t.children.map(c => debugRenderASCII(c, prefix + '  |')).join('\n');
  }

  if(isPrompt(t.body)) {
    if(isText(t.body.type)) {
      result += `${prefix}- prompt (${t.body.text})`;
    }

    if(isMultipleChoice(t.body.type)) {
      result += `${prefix}- prompt (${t.body.text} multiple-choice(${t.body.type.choices.map(c => `"${c}"`).join(' ')}))`;
    }
  }

  if(isReview(t.body)) {
    result += `${prefix}- review\n`;
    result += t.children.map(c => debugRenderASCII(c, prefix + '  |')).join('\n');
  }

  return result;
};

export type FlattenedTasks = {
  nodes: Array<{prompt: string}>,
  links: Array<{parent: Id, child: Id}>,
};

const TaskNode = (prompt: string='') => { return {prompt} };
const TaskLink = (parent: Id, child: Id) => { return {parent, child} };
const FlattenedTasks = () => <FlattenedTasks>{nodes: [], links: []};

const appendChild = (a: FlattenedTasks, b: FlattenedTasks): FlattenedTasks => {
  let newChildId = a.nodes.length as Id;
  a.links.push(TaskLink(0 as Id, newChildId));
  a.nodes = a.nodes.concat(b.nodes);
  b.links.forEach(l => a.links.push(TaskLink((l.parent + newChildId) as Id, (l.child + newChildId) as Id)));
  return a;
};

export const renderTasks = (t: Tree): FlattenedTasks => {
  let result = FlattenedTasks();

  if(isTemplate(t.body)) {
    result.nodes.push(TaskNode());
    t.children.forEach(c => appendChild(result, renderTasks(c)));
  }

  if(isSection(t.body)) {
    result.nodes.push(TaskNode());
    t.children.forEach(c => appendChild(result, renderTasks(c)));
  }

  if(isPrompt(t.body)) {
    result.nodes.push(TaskNode(t.body.text));
  }

  if(isReview(t.body)) {
    result.nodes.push(TaskNode());
    t.children.forEach(c => appendChild(result, renderTasks(c)));
  }

  return result;
};
