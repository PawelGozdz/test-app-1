import { DomainErrorType } from "./error.enum";

export interface IMicroserviceException {
  message: string;
  name: string;
  code?: string;
  domain?: DomainErrorType;
  data?: Record<string, any>;
  timestamp: Date;
}
