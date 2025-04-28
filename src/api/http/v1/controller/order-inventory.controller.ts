import { TYPES } from "@/types";
import {
  controller,
  httpGet,
  httpPost,
  request,
  response,
  httpDelete,
} from "inversify-express-utils";
import { inject } from "inversify";
import type { Request, Response } from "express";

import type { Logger } from "pino";
import { msg, ok } from "../processor/resp";

import { OrderInventoryService } from "../../../../application/features/order-inventory/order-inventory-service";
import { IOrderItem } from "@/interface/IOrderItem";
import authMiddleware from "../middleware/authorization";

@controller("/api/v1/order")
export class OrderInventoryController {
  constructor(
    @inject(TYPES.Logger) private readonly _logger: Logger,
    @inject(TYPES.OrderInventoryService)
    private readonly _orderInventory: OrderInventoryService
  ) {}

  @httpGet("", authMiddleware)
  async getAllOrdersWithItem(
    @request() _req: Request,
    @response() resp: Response
  ) {
    const orders = await this._orderInventory.repository.getAll();
    this._logger.info(`getting all orders request`);
    return resp.status(200).json(ok("Orders fetched successfully", orders));
  }

  @httpGet("/:id", authMiddleware)
  async getProductById(@request() req: Request, @response() resp: Response) {
    const { id } = req.params;
    const product = await this._orderInventory.getOrderWithItems(id);
    if (!product) {
      return resp.status(404).json(msg("Product not found", "404"));
    }
    this._logger.info(`get product by id request ${JSON.stringify(product)}`);
    return resp.status(200).json(ok("Product fetched successfully", product));
  }

  @httpPost("", authMiddleware)
  async createOrderWithItems(
    @request() req: Request,
    @response() resp: Response
  ) {
    const { userId, items }: { userId: string; items: IOrderItem[] } = req.body;

    this._logger.info(
      `received create product request: ${JSON.stringify({
        userId,
        items,
      })}`
    );

    const cmdRes = await this._orderInventory
      .createOrderWithItems(userId, items)
      .catch((err) => {
        this._logger.error(`Error creating order: ${err.message}`);
        return resp.status(500).json(msg(err.message, "500"));
      });

    return resp.status(201).json(ok("Product created successfully", cmdRes));
  }

  @httpDelete("", authMiddleware)
  async deleteAllOrders(@request() _req: Request, @response() resp: Response) {
    this._logger.info(`received delete all orders request`);

    const cmdRes = await this._orderInventory.repository.deleteAllOrders();

    return resp.status(200).json(ok("All orders deleted successfully", cmdRes));
  }

  @httpDelete("/:id", authMiddleware)
  async deleteOrder(@request() req: Request, @response() resp: Response) {
    const { id } = req.params;

    this._logger.info(
      `received delete order request: ${JSON.stringify({
        id,
      })}`
    );

    const cmdRes = await this._orderInventory.repository.deleted(id);

    return resp.status(200).json(ok("Order deleted successfully", cmdRes));
  }
}
