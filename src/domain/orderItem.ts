import type { IOrderItem, IOrderItemModel } from "@/interface/IOrderItem";
import mongoose, { Schema, Types } from "mongoose";
import { model } from "mongoose";

export interface IOrderItemProps extends IOrderItem {
  product: Types.ObjectId;
  order: Types.ObjectId;
}

const OrderItemSchema = new Schema<IOrderItemProps, IOrderItemModel>(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    orderId: { type: Schema.Types.ObjectId, ref: "Order" },
    quantity: { type: Number, required: true },
  },

  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

OrderItemSchema.methods["unitPrice"] = async function (): Promise<number> {
  if (this["populated"]("product")) {
    // if it populated then return exist value
    return this["product"].price;
  }

  await this["populated"]("product");
  return this["product"].price;
};

OrderItemSchema.virtual("subtotal").get(function () {
  // Check if productId is populated and has price
  if (
    this.populated("productId") &&
    this.productId &&
    typeof this.productId === "object"
  ) {
    // Type assertion to tell TypeScript that productId is a Product
    const product = this.productId as unknown as { price: number };
    return product.price * this.quantity;
  }
  return 0; // Default if not populated
});

OrderItemSchema.statics["findByProductId"] = async function (
  productId: string
): Promise<IOrderItem[]> {
  return this.find({ productId });
};

OrderItemSchema.statics["expenseProductQuantity"] = async function (
  productId: string,
  quantity: number
): Promise<void> {
  const product = await mongoose.model("Product").findById(productId);

  if (!product) {
    throw new Error(`Product with ID ${productId} not found`);
  }

  // Check if enough stock is available
  if (product.stackQuanity < quantity) {
    throw new Error(
      `Not enough stock for product ${product.name}. Available: ${product.stackQuanity}, Requested: ${quantity}`
    );
  }

  // Update the product's stock quantity by subtracting the ordered quantity
  product.stackQuanity -= quantity;

  // Save the updated product
  await product.save();
};

export const OrderItemModel = model<IOrderItemProps, IOrderItemModel>(
  "OrderItem",
  OrderItemSchema
);
