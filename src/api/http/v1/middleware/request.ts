import { Request, Response, NextFunction } from "express";
import { Logger } from "pino";

export class RequestMiddleware {
  constructor(private readonly _logger: Logger) {}

  public requestInfo(req: Request, res: Response, next: NextFunction) {
    const { method, url, hostname, ip } = req;
    const { statusCode } = res;

    this._logger.info(
      `${method}: ${url} ${statusCode} - hostname: ${hostname} - ip: ${ip}`
    );
    next();
  }
}
