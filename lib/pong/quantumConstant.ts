const PLANCK_CONSTANT = 6.626e-34; // Planck's constant
export const HBAR = PLANCK_CONSTANT / (2 * Math.PI);
export const SIGMA_0 = 12; // initial uncertainty
export const SIGMA_MAX = 90; // maximum uncertainty
export const TIME_SCALE = 1.5e5; // used to convert frame into time value that makes the formula work

export function gaussianRandom(): number {
  let u, v, s;
  do {
    u = Math.random() * 2 - 1;
    v = Math.random() * 2 - 1;
    s = u * u + v * v;
  } while (s >= 1 || s === 0);
  const multiplier = Math.sqrt((-2 * Math.log(s)) / s);
  return u * multiplier;
}
