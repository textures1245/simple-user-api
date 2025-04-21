import { IOrderItem } from "@/interface/IOrderItem";
import { IOrderInventoryHandler } from "./order-inventory-handler-interface";
import { TYPES } from "@/types";
import { inject, injectable } from "inversify";
import { Logger } from "pino";
import { Inventory } from "@/domain/inventory";
import { Order } from "@/domain/order";
import { Document } from "mongoose";
import { OrderItemModel } from "@/domain/orderItem";
import { v4 as uuidv4 } from "uuid";

@injectable()
export class OrderInventoryService implements IOrderInventoryHandler {
  public readonly repository: {
    getAll: () => Promise<(Document & Order)[]>;
    deleted: (id: string) => Promise<void>;
    deleteAllOrders: () => Promise<void>;
  };

  constructor(
    @inject(TYPES.Logger) private readonly _logger: Logger,
    @inject(TYPES.OrderItemModel)
    private readonly _orderItemModel: Inventory<
      Document & typeof OrderItemModel
    >,
    @inject(TYPES.OrderModel)
    private readonly _orderModel: Inventory<Document & Order>
  ) {
    this.repository = {
      getAll: () =>
        this._orderModel._model
          .find()
          .populate({
            path: "user",
            select: "firstName lastName",
          })
          .populate({
            path: "items",
            model: "OrderItem",
            select: "quantity productId",
            populate: {
              path: "productId",
              model: "Product",
              select: "name description price",
            },
          })

          .exec(),
      deleted: (id: string) => this._orderModel.delete(id),
      deleteAllOrders: () => this._orderModel.deleteAllEntities(),
    };
  }

  async getOrderWithItems(orderId: string): Promise<(Document & Order)[]> {
    this._logger.info(`Getting order with items: ${orderId}`);

    const order = await this._orderModel._model
      .find()
      .populate({
        path: "user",
        select: "firstName lastName",
      })
      .populate({
        path: "items",
        model: "OrderItem",
        select: "quantity productId",
        populate: {
          path: "productId",
          model: "Product",
          select: "name description price",
        },
      })
      .exec();

    if (!order) return [];
    return order as unknown as (Document & Order)[];
  }

  async createOrderWithItems(
    customerId: string,
    items: IOrderItem[]
  ): Promise<void> {
    this._logger.info(`Creating order with items for customer: ${customerId}`);

    const aggregateId = uuidv4();

    const order = new Order(aggregateId, customerId, new Date(), []);

    const savedOrder = await this._orderModel._model.create(order);

    const itemIds = [];

    for (const item of items) {
      this._logger.info(`Creating order item: ${item}`);

      const orderItem = {
        ...item,
        quantity: item.quantity,
        orderId: savedOrder._id,
      };

      // Create the item
      const createdItem = await this._orderItemModel.create(
        orderItem as unknown as Document & typeof OrderItemModel
      );

      // Add the item's ID to our collection
      itemIds.push(createdItem._id);

      await OrderItemModel.expenseProductQuantity(
        item.productId.toString(),
        item.quantity
      ).catch((error) => {
        this._logger.error(`Failed to expense product quantity: ${error}`);
        throw error;
      });
    }

    await this._orderModel._model.findByIdAndUpdate(savedOrder._id, {
      $set: { items: itemIds },
    });
  }
}
