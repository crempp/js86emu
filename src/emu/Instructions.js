/**
 * Create the instruction function. This function must be bound to an instance
 * of the Operation class.
 *
 * @param {function} op Operation to execute
 * @param {function} dst Destination addressing mode
 * @param {function} src Source addressing mode
 * @return {function(): *} Prepared instruction function to be used in CPU cycle
 */
export function inst (op, dst, src) {
  op = op.bind(this);
  return function() {
    this.inst = op.name; //.replace("bound ", "");
    this.dst = dst ? dst.name : "";
    this.src = src ? src.name : "";

    return op(dst, src);
  }
};
