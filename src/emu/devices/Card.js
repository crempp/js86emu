import Device from "./Device";

/**
 * A Card is an I/O device which inherits from Device so it supports port-based
 * I/O. It also supports memory-mapped I/O and has full access to the ISA bus.
 */
export default class Card extends Device{
  constructor(config, system) {
    super(config, system);
  }
}