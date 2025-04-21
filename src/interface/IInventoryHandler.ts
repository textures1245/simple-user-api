import { Document } from "mongoose";

export interface IInventoryHandler<T extends Document> {
  getById(id: string): Promise<T | null>;
  getAll(): Promise<T[]>;
  create(event: T): Promise<T>;
  update(id: string, event: Partial<T>): Promise<void>;
  delete(id: string): Promise<void>;
  deleteAllEntities(): Promise<void>;
}
