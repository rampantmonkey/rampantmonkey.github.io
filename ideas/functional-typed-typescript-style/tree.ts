export type Tree<A> = {
  body: A;
  children: Array<Tree<A>>;
};

export const Tree = <A>(body: A, children: Array<Tree<A>> = []): Tree<A> => <Tree<A>>{body, children};

export const mapTree = <A, B>(a: Tree<A>, m: (a: A)=>B): Tree<B> =>
  <Tree<B>>{
    body: m(a.body),
    children: a.children.map(c => mapTree(c, m)),
  };

export const findTree = <A>(a: Tree<A>, eq: (a: A)=>boolean): A | null => {
  if(eq(a.body)) { return a.body; }
  for(let i=0; i < a.children.length; ++i) {
    let f = findTree(a.children[i], eq);
    if(f) { return f; }
  }
  return null;
};

export const findParent = <A>(a: Tree<A>, eq: (a: A)=>boolean): A | null => {
  for(let i=0; i < a.children.length; ++i) {
    if(eq(a.children[i].body)) {
      return a.body;
    }
    let f = findParent(a.children[i], eq);
    if(f) { return f; }
  }
  return null;
};

export const firstChild = <A>(a: Tree<A>, eq: (a: A)=>boolean): A | null => {
  if(eq(a.body) && a.children.length > 0) { return a.children[0].body; }
  for(let i=0; i < a.children.length; ++i) {
    let f = firstChild(a.children[i], eq);
    if(f) { return f; }
  }
  return null;
};

export const nextSibling = <A>(a: Tree<A>, eq: (a: A)=>boolean): A | null => {
  for(let i=0; i < a.children.length; ++i) {
    if(i < a.children.length - 1 && eq(a.children[i].body)) { return a.children[i+1].body; }
    let f = nextSibling(a.children[i], eq);
    if(f) { return f; }
  }
  return null;
};

export const prevSibling = <A>(a: Tree<A>, eq: (a: A)=>boolean): A | null => {
  for(let i=0; i < a.children.length; ++i) {
    if(i > 0 && eq(a.children[i].body)) { return a.children[i-1].body; }
    let f = prevSibling(a.children[i], eq);
    if(f) { return f; }
  }
  return null;
};

export const removeChild = <A>(a: Tree<A>, eq: (a: A)=>boolean): Tree<A> | null => {
  let newChildren: Array<Tree<A>> = [];
  if(eq(a.body)) { return null; }

  for(let i=0; i < a.children.length; ++i) {
    let newChild = removeChild(a.children[i], eq);
    if(newChild) { newChildren.push(newChild); }
  }

  return <Tree<A>>{
    body: a.body,
    children: newChildren,
  };
};

export const addChild = <A>(a: Tree<A>, child: A, eq: (a: A)=>boolean): Tree<A> | null => {
  if(eq(a.body)) {
    let childTree = <Tree<A>>{body: child, children: []}
    a.children.push(childTree);
    return childTree;
  }

  for(let i=0; i < a.children.length; ++i) {
    let childTree = addChild(a.children[i], child, eq);
    if(childTree) { return childTree; }
  }

  return null;
};

export const addSibling = <A>(a: Tree<A>, sibling: A, eq: (a: A)=>boolean): Tree<A> | null => {
  let idx = a.children.findIndex(a => eq(a.body));
  if(idx >= 0) {
    let siblingTree = <Tree<A>>{body: sibling, children: []};
    a.children.splice(idx+1, 0, siblingTree);
    return siblingTree;
  }

  for(let i=0; i < a.children.length; ++i) {
    let siblingTree = addSibling(a.children[i], sibling, eq);
    if(siblingTree) { return siblingTree; }
  }

  return null;
};

export const swapChildren = <A>(a: Tree<A>, eq1: (a: A)=>boolean, eq2: (a: A)=>boolean): void => {
  let idx1 = a.children.findIndex(a => eq1(a.body));
  let idx2 = a.children.findIndex(a => eq2(a.body));
  if(idx1 >=0 && idx2 >= 0) {
    let tmp = a.children[idx1];
    a.children[idx1] = a.children[idx2];
    a.children[idx2] = tmp;
  }
  for(let i=0; i < a.children.length; ++i) {
    swapChildren(a.children[i], eq1, eq2);
  }
};
