/** Round to one decimal (`rn`). */
export const rn = (x: number): number => Math.round(x * 10) / 10;

/** Signed number with one decimal: "+1.5", "-0.3", "0" (`sg`). */
export const sg = (x: number): string => (x > 0 ? '+' : '') + rn(x);

/** Parse a user-entered number accepting a comma as the decimal separator. */
export const parseNum = (s: string): number => parseFloat(String(s).replace(',', '.'));
