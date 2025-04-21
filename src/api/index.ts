import "@api/http/v1/controller/index";
import * as dotenv from "dotenv";
dotenv.config();

import "reflect-metadata";

import config from "@config/index";
import { infraInitialize } from "@/startup";
import { TYPES } from "@/types";
import type { Application } from "express";

// Self-executing async function to start the application
(async () => {
  try {
    console.log("Initializing application...");

    // Initialize IoC container
    const container = await infraInitialize();

    // Get Express application from container
    const api: Application = container.get<Application>(TYPES.ApiServer);

    // Start the server
    api.listen(config.API_PORT, () => {
      console.log(`Server running in ${config.NODE_ENV} mode`);
      console.log(`API is running on port ${config.API_PORT}`);
    });
  } catch (error) {
    console.error("Failed to start application:", error);
    process.exit(1);
  }
})();
