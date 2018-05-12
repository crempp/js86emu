export class SystemConfigException extends Error {
  constructor(...params) {
    super(...params);
    Error.captureStackTrace(this, SystemConfigException);
  }
}

export class ValueOverflowException extends Error {
  constructor(...params) {
    super(...params);
    Error.captureStackTrace(this, ValueOverflowException);
  }
}

export class ValueUnderflowException extends Error {
  constructor(...params) {
    super(...params);
    Error.captureStackTrace(this, ValueOverflowException);
  }
}

export class FeatureNotImplementedException extends Error {
  constructor(...params) {
    super(...params);
    Error.captureStackTrace(this, FeatureNotImplementedException);
  }
}

export class InvalidAddressModeException extends Error {
  constructor(...params) {
    super(...params);
    Error.captureStackTrace(this, FeatureNotImplementedException);
  }
}
