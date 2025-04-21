import { Document, Model, Types } from "mongoose";

export interface IOrderItem extends Document {
  productId: Types.ObjectId;
  orderId: Types.ObjectId;
  quantity: number;

  unitPrice(): number;
  subtotal(): number;
}

export interface IOrderItemModel extends Model<IOrderItem> {
  findByProductId(productId: string): Promise<IOrderItem[]>;
  expenseProductQuantity(productId: string, quantity: number): Promise<void>;
}
