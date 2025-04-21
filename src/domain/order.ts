import { DomainEvent } from "@/core/Event";
import type { IOrder } from "@/interface/IOrder";
import { model, Schema, Types } from "mongoose";

export class Order extends DomainEvent implements IOrder {
  type: string = "order";
  aggregateName: string = "orders";

  orderDate: Date;
  user: Types.ObjectId;
  items: Types.ObjectId[];

  constructor(
    aggregateId: string,
    userId: string,
    orderDate?: Date,
    items: Types.ObjectId[] = []
  ) {
    super(aggregateId);

    this.user = new Types.ObjectId(userId);

    this.orderDate = orderDate || new Date();
    this.items = items;
  }
}

const OrderSchema = new Schema<Order>(
  {
    type: { type: String, default: "order", required: true },
    aggregateName: { type: String, default: "orders", required: true },
    aggregateId: { type: String, required: true },

    items: [{ type: Schema.Types.ObjectId, ref: "OrderItem" }],
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    orderDate: { type: Date, default: Date.now },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

OrderSchema.virtual("price_total").get(function () {
  // Check if productId is populated and has price
  if (this.populated("items") && this.items && typeof this.items === "object") {
    // Type assertion to tell TypeScript that items is an array of OrderItem
    const orderItems = this.items as unknown as {
      price: number;
      quantity: number;
      subtotal: number;
    }[];
    return orderItems.reduce((total, item) => total + item.subtotal, 0);
  }
  return 0; // Default if not populated
});

OrderSchema.loadClass(Order);

const OrderModel = model<Order>("Order", OrderSchema);
export default OrderModel;
