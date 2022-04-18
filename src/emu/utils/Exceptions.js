export class SystemConfigException extends Error {
  constructor(...params) {
    super(...params);

    // a workaround to make `instanceof` work in ES5
    this.constructor = SystemConfigException;
    this.__proto__   = SystemConfigException.prototype;

    Error.captureStackTrace(this, SystemConfigException);
  }
}

export class ValueOverflowException extends Error {
  constructor(...params) {
    super(...params);

    // a workaround to make `instanceof` work in ES5
    this.constructor = ValueOverflowException;
    this.__proto__   = ValueOverflowException.prototype;

    Error.captureStackTrace(this, ValueOverflowException);
  }
}

export class ValueUnderflowException extends Error {
  constructor(...params) {
    super(...params);

    // a workaround to make `instanceof` work in ES5
    this.constructor = ValueUnderflowException;
    this.__proto__   = ValueUnderflowException.prototype;

    Error.captureStackTrace(this, ValueOverflowException);
  }
}

export class FeatureNotImplementedException extends Error {
  constructor(...params) {
    super(...params);

    // a workaround to make `instanceof` work in ES5
    this.constructor = FeatureNotImplementedException;
    this.__proto__   = FeatureNotImplementedException.prototype;

    Error.captureStackTrace(this, FeatureNotImplementedException);
  }
}

export class InvalidAddressModeException extends Error {
  constructor(...params) {
    super(...params);

    // a workaround to make `instanceof` work in ES5
    this.constructor = InvalidAddressModeException;
    this.__proto__   = InvalidAddressModeException.prototype;

    Error.captureStackTrace(this, InvalidAddressModeException);
  }
}

export class InvalidDeviceException extends Error {
  constructor(...params) {
    super(...params);

    // a workaround to make `instanceof` work in ES5
    this.constructor = InvalidAddressModeException;
    this.__proto__   = InvalidAddressModeException.prototype;

    Error.captureStackTrace(this, InvalidAddressModeException);
  }
}

// This stands in for an error interrupt until interrupts are implemented
export class PortAccessException extends Error {
  constructor(...params) {
    super(...params);

    // a workaround to make `instanceof` work in ES5
    this.constructor = PortAccessException;
    this.__proto__   = PortAccessException.prototype;

    Error.captureStackTrace(this, PortAccessException);
  }
}

// This stands in for an error interrupt until interrupts are implemented
export class TemporaryInterruptException extends Error {
  constructor(...params) {
    super(...params);

    // a workaround to make `instanceof` work in ES5
    this.constructor = TemporaryInterruptException;
    this.__proto__   = TemporaryInterruptException.prototype;

    Error.captureStackTrace(this, TemporaryInterruptException);
  }
}

