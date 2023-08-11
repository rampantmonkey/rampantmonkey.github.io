import { isOk, isErr, Ok, Err, Result as R } from '../../../prelude';

export type Context = Readonly<{
  text: string;
  index: number;
}>;

export type Error = Readonly<{
  expected: string;
  ctx: Context;
}>;

export type Value<T> = Readonly<{
  value: T,
  ctx: Context;
}>;

export const Context = (text: string, index: number): Context => <Context>{text, index};
export const Error = (ctx: Context, expected: string): Error => <Error>{expected, ctx};
const Value = <T>(ctx: Context, value: T): Value<T> => <Value<T>>{value, ctx};

export type Result<T> = R<Value<T>, Error>;

type Parser<T> = (ctx: Context) => Result<T>

export const str = (match: string): Parser<string> => {
  return (ctx: Context): Result<string> => {
    const end = ctx.index + match.length;
    if(ctx.text.substring(ctx.index, end) === match) {
      return Ok(Value({ ...ctx, index: end }, match));
    } else {
      return Err(Error(ctx, match));
    }
  };
};

export const regex = (re: RegExp, expected: string): Parser<string> => {
  return ctx => {
    re.lastIndex = ctx.index;
    const res = re.exec(ctx.text);
    if(res && res.index === ctx.index) {
      return Ok(Value({ ...ctx, index: ctx.index + res[0].length }, res[0]));
    } else {
      return Err(Error(ctx, expected));
    }
  };
};

export const seq = <T>(ps: Array<Parser<T>>): Parser<Array<T>> => {
  return (ctx: Context): Result<Array<T>> => {
    let values: Array<T> = [];
    let next = ctx;
    for (const p of ps) {
      const result = p(ctx);
      if(isErr(result)) return result;
      values.push(result.value.value);
      ctx = result.value.ctx;
    }
    return Ok(Value(ctx, values));
  };
};

export const any = <T>(ps: Array<Parser<T>>): Parser<T> => {
  return ctx => {
    let furthest: Result<T> | null = null;
    for (const p of ps) {
      const res = p(ctx);
      if(isOk(res)) { return res; }
      if(!furthest || furthest.reason.ctx.index < res.reason.ctx.index) { furthest = res; }
    }
    return furthest!;
  };
};

export const many = <T>(p: Parser<T>): Parser<Array<T>> => {
  return ctx => {
    let values: Array<T> = [];
    let next = ctx;
    for(;;) {
      const result = p(next);
      if(isErr(result)) {
        if(values.length === 0) { return result; }
        else { break; }
      }
      values.push(result.value.value);
      next = result.value.ctx;
    }

    return Ok(Value(next, values));
  };
};

export const optional = <T>(p: Parser<T>): Parser<T | null> => any([p, ctx => Ok(Value(ctx, null))]);

export const optionalDefault = <T>(p: Parser<T>, d: T): Parser<T> => any([p, ctx => Ok(Value(ctx, d))]);

export const map = <A, B>(p: Parser<A>, f:(a:A)=>B): Parser<B> => (ctx: Context) => {
  const r = p(ctx);
  return isOk(r) ? Ok(Value(r.value.ctx, f(r.value.value))) : r;
};
