export class CPUConfigException extends Error {
  constructor(...params) {
    super(...params);
    Error.captureStackTrace(this, CPUConfigException);
  }
}
