import pino from 'pino';
import { randomUUID } from 'crypto';
import type { Request, Response, NextFunction } from 'express';

export const logger = pino({ level: process.env.LOG_LEVEL || 'info' });

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const id = req.headers['x-request-id']?.toString() || randomUUID();
  (req as any).requestId = id;
  res.setHeader('x-request-id', id);
  const start = Date.now();
  res.on('finish', () => {
    logger.info({
      req: { id, method: req.method, url: req.originalUrl },
      res: { status: res.statusCode },
      ms: Date.now() - start,
    }, 'request');
  });
  next();
}

