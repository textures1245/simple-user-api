import { Schema, model } from "mongoose";
import { DomainEvent } from "@/core/Event";
import type { IProduct } from "@/interface/IProduct";

// Define a Product class that extends DomainEvent
export class Product extends DomainEvent implements IProduct {
  type: string = "product";
  aggregateName: string = "products";

  name: string;
  description: string;
  price: number;

  stackQuanity: number;

  constructor(
    aggregateId: string,
    name: string,
    description: string,
    price: number,
    stackQuanity: number,
    imageUrl: string = "https://i0.wp.com/vat.or.th/wp-content/uploads/2021/03/placeholder.png?ssl=1"
  ) {
    super(aggregateId);
    this.name = name;
    this.description = description;
    this.price = price;

    this.stackQuanity = stackQuanity;
    this.imageUrl = imageUrl;
  }
  imageUrl: string;
}

const ProductSchema = new Schema<Product>(
  {
    // DomainEvent fields
    type: { type: String, default: "product", required: true },
    aggregateName: { type: String, default: "products", required: true },
    aggregateId: { type: String, required: true },

    // Product-specific fields

    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    stackQuanity: { type: Number, required: true },
    imageUrl: { type: String, required: true },
  },
  { timestamps: true }
);

ProductSchema.loadClass(Product);

// Create and export the model
export const ProductModel = model<Product>("Product", ProductSchema);
