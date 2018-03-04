/**
 * Create the instruction function
 *
 * @param op
 * @param dst
 * @param src
 * @return {function(): *}
 */
export function inst (op, dst, src) {
  return () => op(dst, src);
};
