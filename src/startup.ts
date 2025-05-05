import "reflect-metadata";
import { Container } from "inversify";
import { InversifyExpressServer } from "inversify-express-utils";
import * as express from "express";
import { TYPES } from "./types";
import { connectMongoose } from "@infrastructure/database/mongodb";
import { createPinoLogger } from "@infrastructure/utils/logger";
import { Inventory } from "./domain/inventory";
import { ProductModel } from "./domain/product";
import { ProductInventoryService } from "./application/features/product-inventory/product-inventory-service";
import { Document } from "mongoose";
import * as pino from "pino";

// Import all controllers
import "./api/http/v1/controller";
import config from "./config";
import OrderModel from "./domain/order";
import UserModel from "./domain/user";
import { OrderItemModel } from "./domain/orderItem";
import { OrderInventoryService } from "./application/features/order-inventory/order-inventory-service";
import { UserManagementService } from "./application/features/user-management/user-management-service";
import { AuthenticationService } from "./application/features/authentication/authentication-service";
import { RequestMiddleware } from "./api/http/v1/middleware/request";

export const infraInitialize = async () => {
  const container = new Container();

  const logger = createPinoLogger("simple-user-api");
  await connectMongoose(config.MONGODB_URI, logger);

  container.bind<pino.Logger>(TYPES.Logger).toConstantValue(logger);

  // Create an instance of Inventory with ProductModel
  const productInventory = new Inventory<Document & typeof ProductModel>(
    container.get<pino.Logger>(TYPES.Logger),
    ProductModel as any
  );
  const orderInventory = new Inventory<Document & typeof OrderModel>(
    container.get<pino.Logger>(TYPES.Logger),
    OrderModel as any
  );
  const orderItemState = new Inventory<Document & typeof OrderItemModel>(
    container.get<pino.Logger>(TYPES.Logger),
    OrderItemModel as any
  );
  const userState = new Inventory<Document & typeof UserModel>(
    container.get<pino.Logger>(TYPES.Logger),
    UserModel as any
  );

  // Bind the INSTANCE to the container, not the class
  container
    .bind<Inventory<Document & typeof ProductModel>>(TYPES.ProductModel)
    .toConstantValue(productInventory);
  container
    .bind<Inventory<Document & typeof OrderItemModel>>(TYPES.OrderItemModel)
    .toConstantValue(orderItemState);
  container
    .bind<Inventory<Document & typeof OrderModel>>(TYPES.OrderModel)
    .toConstantValue(orderInventory);
  container
    .bind<Inventory<Document & typeof UserModel>>(TYPES.UserModel)
    .toConstantValue(userState);

  // Register services
  container
    .bind<ProductInventoryService>(TYPES.ProductInventoryService)
    .to(ProductInventoryService);
  container
    .bind<OrderInventoryService>(TYPES.OrderInventoryService)
    .to(OrderInventoryService);
  container
    .bind<UserManagementService>(TYPES.UserManagementService)
    .to(UserManagementService);
  container
    .bind<AuthenticationService>(TYPES.AuthenticationService)
    .to(AuthenticationService);

  // Create server
  const server = new InversifyExpressServer(container);

  // middleware setup
  const requestMiddleware = new RequestMiddleware(
    container.get<pino.Logger>(TYPES.Logger)
  );

  server.setConfig((app) => {
    // Middleware
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    app.use(requestMiddleware.requestInfo.bind(requestMiddleware));

    // CORS handling
    app.use((_req, res, next) => {
      res.header("Access-Control-Allow-Origin", "*");
      res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization"
      );
      res.header(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, PATCH, OPTIONS"
      );
      next();
    });
  });

  // Build the express app
  const app = server.build();

  // Register the app in the container
  container.bind<express.Application>(TYPES.ApiServer).toConstantValue(app);

  return container;
};

// Export the aliases for backward compatibility
export const infrastructureInitialize = infraInitialize;
