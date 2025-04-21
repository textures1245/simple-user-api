import { TYPES } from "@/types";
import { inject, injectable } from "inversify";
import { Logger } from "pino";
import { IAuthenticationHandler } from "./authentication-handler-interface";
import { Inventory } from "@/domain/inventory";
import { User } from "@domain/user";
import { Document } from "mongoose";
import jwt from "jsonwebtoken";
import bcrpyt from "bcrypt";
import { IUser } from "@/interface/IUser";
import { v4 } from "uuid";
import config from '@config/index'


@injectable()
export class AuthenticationService implements IAuthenticationHandler {

  constructor(
    @inject(TYPES.Logger) private readonly _logger: Logger,
    @inject(TYPES.UserModel)
    private readonly _userModel: Inventory<Document & User>
  ) {
    
  }
  register(req: IUser): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      try {
        const existingUser = await this._userModel._model.findOne({
          username: req.username,
        });

        if (existingUser) {
          this._logger.warn(`User already exists: ${req.username}`);
          return reject(new Error("User already exists"));
        }

        const hashedPassword = await new Promise<string>((resolve, reject) => {
          bcrpyt.hash(req.password, 10, (err, hash) => {
            if (err) {
              reject(err);
            }
            resolve(hash);
          });
        });

        const aggregateId = v4(); // Generate a unique ID

        const user = new User(
          aggregateId,
          req.username,
          hashedPassword,
          req.firstName,
          req.lastName,
          req.age,
          req.gender
        );

        await this._userModel.create(user as Document & User);

        this._logger.info(`User registered: ${req.username}`);
        resolve();
      } catch (error) {
        this._logger.error("Registration error", error);
        reject(error);
      }
    });
  }

  async authenticate(
    username: string,
    password: string
  ): Promise<{ token: string }> {
    return new Promise<{ token: string }>(async (resolve, reject) => {
      const user = await this._userModel._model.findOne({
        username,
      });

      if (!user) {
        this._logger.warn(`User not found: ${username}`);
        return reject(new Error("Invalid credentials"));
      }

      const isMatch = await new Promise<boolean>((resolve, reject) => {
        bcrpyt.compare(password, user.password, (err, result) => {
          if (err) {
            reject(err);
          }
          resolve(result);
        });
      });

      if (!isMatch) {
        this._logger.warn(`Password mismatch for user: ${username}`);
        return reject(new Error("Invalid credentials"));
      }

      resolve({ token: this.generateToken(user) });
    });
  }

  private generateToken(user: Document & User): string {
    const payload = {
      id: user.id,
      username: user.username,
    };

    const token = jwt.sign(
      payload,
      config.JWT_SECRET,
      { expiresIn: "1h" } // Token expires in 1 hour
    );

    return token;
  }
}
