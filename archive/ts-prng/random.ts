export type Rng = {
  seed: Array<string>;
  random: () => number;
};

export const Rng = (seed: string, ...extraSeed: Array<string>): Rng => {
  const args = [seed, ...extraSeed];

  let mash = Mash();
  let s0 = mash(' ');
  let s1 = mash(' ');
  let s2 = mash(' ');
  let c = 1;

  for (let i = 0; i < args.length; ++i) {
    s0 -= mash(args[i]);
    if (s0 < 0) { s0 += 1; }
    s1 -= mash(args[i]);
    if (s1 < 0) { s1 += 1; }
    s2 -= mash(args[i]);
    if (s2 < 0) { s2 += 1; }
  }

  return <Rng>{
    seed: args,
    random: () => {
      let t = 2091639 * s0 + c * 2.3283064365386963e-10; // 2^-32
      s0 = s1;
      s1 = s2;
      return s2 = t - (c = t | 0);
    },
  }
};

export const shuffleInPlace = <T>(r: Rng, a: Array<T>): void => {
  for (let i = a.length - 1; i > 0; --i) {
    const j = Math.floor(r.random() * i);
    const tmp = a[i];
    a[i] = a[j];
    a[j] = tmp;
  }
};

export const select = <T>(r: Rng, a: Array<T>): T => a[uint32(r) % a.length];
export const selectIndex = <_>(r: Rng, a: Array<T>): number => uint32(r) % a.length;

export const str = (() => {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz ';
  return (r: Rng, min: number, max: number): string => {
    let result = '';
    let l = range(r, min, max);
    for(let i = 0; i < l; ++i) {
      result += charset.charAt(Math.floor(r.random() * charset.length));
    }
    return result;
  }
})();

export const range = (r: Rng, min: number, max: number): number => min + r.random() * (max - min);
export const uint32 = (r: Rng): number => r.random() * 0x100000000; // 2^32
export const fract53 = (r: Rng): number => r.random() + (r.random() * 0x200000 | 0) * 1.1102230246251565e-16; // 2^-53

const Mash = (): ((data: string) => number) => {
  var n = 0xefc8249d;

  return ((data: string): number => {
    for (var i = 0; i < data.length; i++) {
      n += data.charCodeAt(i);
      var h = 0.02519603282416938 * n;
      n = h >>> 0;
      h -= n;
      h *= n;
      n = h >>> 0;
      h -= n;
      n += h * 0x100000000; // 2^32
    }
    return (n >>> 0) * 2.3283064365386963e-10; // 2^-32
  });
};
