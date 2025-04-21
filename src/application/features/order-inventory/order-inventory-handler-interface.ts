import { IOrderItem } from "@/interface/IOrderItem";
import { Document } from "mongoose";
import { Order } from "@/domain/order";

export interface IOrderInventoryHandler {
  createOrderWithItems(customerId: string, items: IOrderItem[]): Promise<void>;
  getOrderWithItems(orderId: string): Promise<(Document & Order)[]>;
}
