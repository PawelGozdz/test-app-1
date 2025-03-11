export interface IMetadata {
  correlationId?: string;
}

export interface ITCPRequest<T> {
  data: T;
  _metadata: IMetadata;
}

export interface IResponse<T = any> {
  statusCode: number;
  path: string;
  timestamp: string;
  message?: string[];
  data?: T;
}
