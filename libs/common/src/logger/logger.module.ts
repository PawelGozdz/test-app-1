import { DynamicModule, Module, RequestMethod } from '@nestjs/common';
import { Params, LoggerModule as PinoLoggerModule } from 'nestjs-pino';
import { merge } from 'lodash';

export const predefinedOptions: Params = {
  pinoHttp: {
    base: null,
    autoLogging: false,
    formatters: {
      level: (label) => {
        return { level: label.toUpperCase() };
      },
      log: (object) => {
        if (Object.keys(object).length === 0) return;
        const { context, err, ...rest } = object;

        const res: {
          _context: string;
          props?: Record<string, any>;
          err?: { message: string; stack: unknown } | unknown;
        } = {
          _context: context as string,
          props: Object.keys(rest).length > 0 ? rest : undefined,
        };

        if (typeof err === 'object' && err !== null) {
          res.err = {
            ...(err as object),
            message: err?.['message'],
            stack: err?.['stack'],
          };
        } else {
          res.err = err;
        }

        return res;
      },
    },
    timestamp() {
      return `,"time":"${new Date().toISOString()}"`;
    },
    level: process.env.LOG_LEVEL ?? 'info',
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'yyyy-mm-dd HH:MM:ss',
        levelFirst: true,
        ignore: 'hostname,pid,res,req,responseTime',
        formatMessage: '{context.name}',
      },
    },
  },
  exclude: [{ method: RequestMethod.ALL, path: 'health' }],
};

const loggerConfig = predefinedOptions;

export interface AppLoggerAsyncOptions {
  imports?: any[];
  useFactory: (...args: any[]) => Promise<Partial<Params>> | Partial<Params>;
  inject?: any[];
  optionsAtClearState?: boolean;
}

@Module({})
export class AppLoggerModule {
  static forRoot(
    options?: Partial<Params>,
    optionsAtClearState: boolean = false,
  ): DynamicModule {
    const opts = optionsAtClearState ? options : merge(loggerConfig, options);

    return {
      module: AppLoggerModule,
      imports: [PinoLoggerModule.forRoot(opts)],
    };
  }

  static forRootAsync(asyncOptions: AppLoggerAsyncOptions): DynamicModule {
    const { optionsAtClearState = false } = asyncOptions;

    return {
      module: AppLoggerModule,
      imports: [
        PinoLoggerModule.forRootAsync({
          imports: asyncOptions.imports || [],
          inject: asyncOptions.inject || [],
          useFactory: async (...args: any[]) => {
            const customOptions = await asyncOptions.useFactory(...args);
            return optionsAtClearState ? customOptions : merge(loggerConfig, customOptions);
          },
        }),
      ],
    };
  }
}