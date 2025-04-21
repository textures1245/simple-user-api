import { inject, injectable } from "inversify";
import { TYPES } from "@/types";
import { Inventory } from "../../../domain/inventory";
import { Product } from "../../../domain/product";
import { type Logger } from "pino";
import { Document } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import type { IProductInventoryService } from "@/interface/IProductInventoryService";
import type { IProduct } from "@/interface/IProduct";

@injectable()
export class ProductInventoryService implements IProductInventoryService {
  public readonly repository: {
    getById: (id: string) => Promise<(Document & Product) | null>;
    getAll: () => Promise<(Document & Product)[]>;
    delete: (id: string) => Promise<void>;
  };

  constructor(
    @inject(TYPES.Logger) private readonly _logger: Logger,
    @inject(TYPES.ProductModel)
    private readonly _productModel: Inventory<Document & Product>
  ) {
    this.repository = {
      getById: (id: string) => this._productModel.getById(id),
      delete: (id: string) => this._productModel.delete(id),
      getAll: () => this._productModel.getAll(),
    };
  }

  async createProduct(
    name: string,
    description: string,
    price: number,
    stackQuanity: number
  ): Promise<void> {
    this._logger.info(`Creating product: ${name}`);

    const aggregateId = uuidv4(); // Generate a unique ID

    // Create a Product domain object
    const product = new Product(
      aggregateId,
      name,
      description,
      price,
      stackQuanity
    );

    await this._productModel.create(product as Document & Product);

    return;
  }

  async updateProduct(id: string, prod: Partial<IProduct>): Promise<void> {
    try {
      await this._productModel.update(id, prod as Partial<Document & Product>);
    } catch (error) {
      this._logger.error(`Failed to update product ${id}: ${error}`);
      throw error;
    }
  }
}
