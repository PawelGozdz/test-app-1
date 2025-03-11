export enum MongoDBErrorCode {
  DuplicateKey = 11000,
  Unauthorized = 13,
  IndexNotFound = 27,
  NetworkTimeout = 89,
  WriteConflict = 112,
  LockTimeout = 24,
  ExceededTimeLimit = 50,
  CursorNotFound = 43,
  NamespaceNotFound = 26,
  UserNotFound = 11,
  CommandNotFound = 59,
  HostUnreachable = 6,
  HostNotFound = 7,
  UnknownError = 8,
  FailedToParse = 9,
  //...
}
