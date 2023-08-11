export type Ok<T, _> = {_tag: 'Ok', value: T};
export const Ok = <T, _>(value: T) => <Ok<T, _>>{value, _tag: 'Ok'};
export type Err<_, E> = {_tag: 'Err', reason: E};
export const Err = <_, E>(reason: E) => <Err<_, E>>{reason, _tag: 'Err'};
export type Result<T, E> = Ok<T, E> | Err<T, E>;
export const isOk = <T, E>(r: Result<T, E>): r is Ok<T, E> => r._tag === 'Ok';
export const isErr = <T, E>(r: Result<T, E>): r is Err<T, E> => r._tag === 'Err';

export const thenOk = <T, E, S>(result: Result<T, E>, ok: (t: T) => S): Result<S, E> => isOk(result) ? Ok(ok(result.value)) : result;

export const awaitThenOk = async <T, E, S>(result: Result<T, E>, ok: (t: T) => Promise<Result<S, E>>): Promise<Result<S, E>> => isOk(result) ? ok(result.value) : result;

export const unwrap = <T, _>(result: Result<T, _>): T => {
  if(isOk(result)) { return result.value; }
  throw result.reason;
};

export const expect = <_, E>(result: Result<_, E>): void => {
  if(isErr(result)) throw result.reason;
}

export type Id = number & { __id__: void }
export const toId = (value: string): Id => Number.parseInt(value, 10) as Id;
