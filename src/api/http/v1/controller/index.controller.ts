import { TYPES } from "@/types";
import { inject } from "inversify";
import { controller, httpGet } from "inversify-express-utils";
import { Logger } from "pino";
import { msg } from "../processor/resp";
import type { Request, Response } from "express";

@controller("/api/v1")
export class IndexController {
  constructor(@inject(TYPES.Logger) private readonly _logger: Logger) {}

  @httpGet("/hp")
  async hp(_req: Request, resp: Response) {
    return resp.status(200).json(msg("Orders fetched successfully", "000"));
  }
}
