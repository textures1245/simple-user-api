import { Types } from "mongoose";

export interface IOrder {
  orderDate: Date;
  user: Types.ObjectId;
  items: Types.ObjectId[];
}
