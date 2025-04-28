import { Product } from "@/domain/product";
import type { IProduct } from "./IProduct";
import { Document } from "mongoose";

export interface IProductInventoryService {
  createProduct(
    name: string,
    description: string,
    price: number,
    stackQuanity: number,
    imageUrl: string
  ): Promise<Document & Product>;
  updateProduct(productId: string, prod: Partial<IProduct>): Promise<void>;
}
