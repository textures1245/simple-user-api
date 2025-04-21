import mongoose from "mongoose";
import config from "@/config";
import { Logger } from "pino";

export const connectMongoose = async (
  hostUrl: string,
  logger: Logger
): Promise<typeof mongoose> => {
  try {
    const mongoUri = hostUrl || config.MONGODB_URI;
    logger.info(`Connecting to MongoDB at ${mongoUri}`);

    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 15000, // Timeout after 15 seconds
    });

    mongoose.connection.on("connected", () => {
      logger.info("Mongoose connected to MongoDB");
    });

    mongoose.connection.on("error", (err) => {
      logger.error(`Mongoose connection error: ${err}`);
    });

    mongoose.connection.on("disconnected", () => {
      logger.info("Mongoose disconnected from MongoDB");
    });

    return mongoose;
  } catch (error) {
    logger.error(`Failed to connect to MongoDB: ${error}`);
    throw error;
  }
};
