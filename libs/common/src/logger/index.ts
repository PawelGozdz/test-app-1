export * from './logger.module';
export * from './req-res-logging.middleware';

export const excludedRoutes = [{ method: 5, path: '/health' }];
