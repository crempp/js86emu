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

    Error.captureStackTrace(this, FeatureNotImplementedException);
  }
}

export class InvalidDeviceException extends Error {
  constructor(...params) {
    super(...params);

    // a workaround to make `instanceof` work in ES5
    this.constructor = InvalidAddressModeException;
    this.__proto__   = InvalidAddressModeException.prototype;

    Error.captureStackTrace(this, FeatureNotImplementedException);
  }
}

