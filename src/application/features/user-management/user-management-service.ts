import { Inventory } from "@/domain/inventory";
import { User } from "@/domain/user";
import { IUser } from "@/interface/IUser";
import { TYPES } from "@/types";
import { inject, injectable } from "inversify";
import { Document } from "mongoose";
import { Logger } from "pino";

@injectable()
export class UserManagementService {
  public readonly repository: {
    getById: (id: string) => Promise<(Document & User) | null>;
    getAll: () => Promise<(Document & User)[]>;
    delete: (id: string) => Promise<void>;

    updateUserProfile: (
      id: string,
      userUpdates: Partial<IUser>
    ) => Promise<void>;
  };

  constructor(
    @inject(TYPES.Logger) private readonly _logger: Logger,
    @inject(TYPES.UserModel)
    private readonly _userModel: Inventory<Document & User>
  ) {
    this.repository = {
      getById: (id: string) =>
        this._userModel
          .getById(id)
          .then((user) =>
            user ? { ...user.toObject(), password: undefined } : null
          ),
      delete: (id: string) => this._userModel.delete(id),
      getAll: () =>
        this._userModel
          .getAll()
          .then((users) =>
            users.map((user) => ({ ...user.toObject(), password: undefined }))
          ),
      updateUserProfile: (id: string, userUpdates: Partial<IUser>) =>
        this._userModel.update(id, userUpdates),
    };
  }
}
