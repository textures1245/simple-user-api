import type { IProduct } from "./IProduct";

export interface IProductInventoryService {
  createProduct(
    name: string,
    description: string,
    price: number,
    stackQuanity: number
  ): Promise<void>;
  updateProduct(productId: string, prod: Partial<IProduct>): Promise<void>;
}
