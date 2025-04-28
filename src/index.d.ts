// src/types/express/index.d.ts
import { Express } from "express";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        username: string;
        firstName?: string;
        lastName?: string;
        [key: string]: any;
      };
      // Add any other custom properties you want to attach
      currentOrder?: any;
    }
  }
}
