import { TYPES } from "@/types";
import {
  controller,
  httpGet,
  httpPost,
  httpPatch,
  request,
  response,
  httpDelete,
} from "inversify-express-utils";
import { inject } from "inversify";
import type { Request, Response } from "express";

import type { Logger } from "pino";
import { msg, ok } from "../processor/resp";
import { ProductInventoryService } from "@/application/features/product-inventory/product-inventory-service";
import { IProduct } from "@/interface/IProduct";

@controller("/api/v1/product")
export class ProductInventoryController {
  constructor(
    @inject(TYPES.Logger) private readonly _logger: Logger,
    @inject(TYPES.ProductInventoryService)
    private readonly _productInventoryService: ProductInventoryService
  ) {}

  @httpGet("")
  async getAllProducts(@request() _req: Request, @response() resp: Response) {
    const products = await this._productInventoryService.repository.getAll();
    this._logger.info(`get all products request ${JSON.stringify(products)}`);
    return resp.status(200).json(ok("Products fetched successfully", products));
  }

  @httpGet("/:id")
  async getProductById(@request() req: Request, @response() resp: Response) {
    const { id } = req.params;
    const product = await this._productInventoryService.repository.getById(id);
    if (!product) {
      return resp.status(404).json(msg("Product not found", "404"));
    }
    this._logger.info(`get product by id request ${JSON.stringify(product)}`);
    return resp.status(200).json(ok("Product fetched successfully", product));
  }

  @httpPost("")
  async createProduct(@request() req: Request, @response() resp: Response) {
    const { name, description, price, stackQuanity, imageUrl } = req.body;

    this._logger.info(
      `received create product request: ${JSON.stringify({
        name,
        description,
        price,
        stackQuanity,
        imageUrl
      })}`
    );

    const cmdRes = await this._productInventoryService.createProduct(
      name,
      description,
      price,
      stackQuanity,
      imageUrl
    );

    return resp.status(201).json(ok("Product created successfully", cmdRes));
  }

  @httpPatch("/:id")
  async updateProduct(@request() req: Request, @response() resp: Response) {
    const { id } = req.params;
    const {
      name,
      description,
      price,
      stackQuanity,
      imageUrl,
    }: Partial<IProduct> = req.body;

    this._logger.info(
      `received update product request: ${JSON.stringify({
        id,
        productUpdates: { name, description, price, stackQuanity, imageUrl },
      })}`
    );

    const cmdRes = await this._productInventoryService.updateProduct(id, {
      name,
      description,
      price,
      stackQuanity,
      imageUrl,
    });

    return resp.status(200).json(ok("Product updated successfully", cmdRes));
  }

  @httpDelete("/:id")
  async deleteProduct(@request() req: Request, @response() resp: Response) {
    const { id } = req.params;

    this._logger.info(
      `received delete product request: ${JSON.stringify({ id })}`
    );

    const cmdRes = await this._productInventoryService.repository.delete(id);

    return resp.status(200).json(ok("Product deleted successfully", cmdRes));
  }
}
