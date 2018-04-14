export class CPUConfigException extends Error {
  constructor(...params) {
    super(...params);
    Error.captureStackTrace(this, CPUConfigException);
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
