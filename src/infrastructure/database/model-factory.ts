// src/infrastructure/database/ModelFactory.ts
import { Schema, model, Model } from "mongoose";
import { DomainEvent } from "@/core/Event";

export function createDomainModel<T extends DomainEvent>(
  modelName: string,
  schema: Schema<T>
): Model<T> {
  return model<T>(modelName, schema);
}
