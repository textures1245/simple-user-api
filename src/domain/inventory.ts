import type { IInventoryHandler } from "@/interface/IInventoryHandler";
import { TYPES } from "@/types";
import { inject, injectable } from "inversify";
import { Document, Model } from "mongoose";
import type { Logger } from "pino";

@injectable()
export class Inventory<T extends Document> implements IInventoryHandler<T> {
  public readonly _model: Model<T>;

  constructor(
    @inject(TYPES.Logger) private readonly _logger: Logger,
    model: Model<T>
  ) {
    this._model = model;
  }

  async getById(id: string): Promise<T | null> {
    this._logger.info(`Getting entity by ID: ${id}`);
    return this._model.findById(id).exec();
  }

  async getAll(): Promise<T[]> {
    this._logger.info("Getting all entities");
    return this._model.find().exec();
  }

  async create(item: T): Promise<T> {
    this._logger.info(`Creating new entity`);
    const newItem = new this._model(item);
    return await newItem.save();
  }

  async update(id: string, updateData: Partial<T>): Promise<void> {
    this._logger.info(`Updating entity with ID: ${id}`);

    // Find and update with partial data, return the updated document
    const updated = await this._model
      .findByIdAndUpdate(id, { $set: updateData }, { new: true })
      .exec();

    if (!updated) {
      throw new Error(`Entity with ID ${id} not found`);
    }
  }

  async delete(id: string): Promise<void> {
    this._logger.info(`Deleting entity with ID: ${id}`);
    const result = await this._model.findOneAndDelete({ _id: id }).exec();

    if (!result) {
      this._logger.warn(`Entity with ID ${id} not found for deletion`);
    } else {
      this._logger.info(`Entity with ID ${id} successfully deleted`);
    }
  }

  async deleteAllEntities(): Promise<void> {
    this._logger.info("Deleting all entities");
    const result = await this._model.deleteMany({}).exec();

    if (result.deletedCount === 0) {
      this._logger.warn("No entities found for deletion");
    } else {
      this._logger.info(`${result.deletedCount} entities successfully deleted`);
    }
  }
}
