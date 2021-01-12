export default class IO {
  constructor (system) {
    this.system = system;

    this.ports = new Uint8Array(0x3FF);

    // Initialize ports with null (nothing attached)
    for (let i = 0; i < this.ports.length; i++) {
      this.register(i, 'rw', this.nullPort)
    }
  }

  register (port, rw, cb) {
    this.ports[port] = cb()
  }

  unRegister(port) {
    this.ports[port] = this.nullPort
  }

  nullPort () {
    return {
      read: () => {
        return 0xff;
      },
      write: (value) => {

      }
    }
  }
}
