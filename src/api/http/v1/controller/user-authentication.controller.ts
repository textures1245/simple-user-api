import { TYPES } from "@/types";
import {
  controller,
  httpGet,
  httpPost,
  httpPatch,
  request,
  response,
  httpDelete,
} from "inversify-express-utils";
import { inject } from "inversify";
import type { Request, Response } from "express";

import type { Logger } from "pino";
import { msg, ok } from "../processor/resp";
import { AuthenticationService } from "../../../../application/features/authentication/authentication-service";
import { UserManagementService } from "@/application/features/user-management/user-management-service";
import { IUser } from "@/interface/IUser";
import { Gender } from "@/interface/IUser";

@controller("/api/v1/user")
export class UserAuthenticationController {
  constructor(
    @inject(TYPES.Logger) private readonly _logger: Logger,
    @inject(TYPES.AuthenticationService)
    private readonly _userAuthenticationService: AuthenticationService,
    @inject(TYPES.UserManagementService)
    private readonly _userManagementService: UserManagementService
  ) {}

  @httpGet("/")
  async getAllUsers(@request() _req: Request, @response() resp: Response) {
    const users = await this._userManagementService.repository.getAll();
    this._logger.info(`get all users request ${JSON.stringify(users)}`);
    return resp.status(200).json(ok("Users fetched successfully", users));
  }

  @httpPost("/register")
  async registerUser(@request() req: Request, @response() resp: Response) {
    const userDatReq = req.body as IUser;

    const genders: Gender[] = ["Male", "Female", "Other"];

    if (userDatReq.gender && !genders.includes(userDatReq.gender)) {
      return resp
        .status(400)
        .json(
          msg("Invalid gender, accepts 'Male', 'Female' or 'Other'", "400")
        );
    }

    this._logger.info(
      `received register user request: ${JSON.stringify({
        ...userDatReq,
        password: null,
      })}`
    );

    const cmdRes = await this._userAuthenticationService
      .register(userDatReq)
      .catch((err) => {
        this._logger.error(`Error registering user: ${err.message}`);
        return resp.status(400).json(msg(err.message, "400"));
      });

    return resp.status(201).json(ok("User registered successfully", cmdRes));
  }

  @httpPost("/auth")
  async authenticateUser(@request() req: Request, @response() resp: Response) {
    const { username, password } = req.body;

    this._logger.info(
      `received authenticate user request: ${JSON.stringify({
        username,
        password,
      })}`
    );

    const cmdRes = await this._userAuthenticationService
      .authenticate(username, password)
      .catch((err) => {
        this._logger.error(`Error authenticating user: ${err.message}`);
        return resp.status(401).json(msg(err.message, "401"));
      });

    return resp.status(200).json(ok("User authenticated successfully", cmdRes));
  }

  @httpGet("/:id")
  async getUserById(@request() req: Request, @response() resp: Response) {
    const { id } = req.params;
    const user = await this._userManagementService.repository.getById(id);
    if (!user) {
      return resp.status(404).json(msg("User not found", "404"));
    }
    this._logger.info(`get user by id request ${JSON.stringify(user)}`);
    return resp.status(200).json(ok("User fetched successfully", user));
  }

  @httpPatch("/:id")
  async updateUserProfile(@request() req: Request, @response() resp: Response) {
    const { id } = req.params;
    const { firstName, lastName, age, gender }: Partial<IUser> = req.body;

    const genders: Gender[] = ["Male", "Female", "Other"];

    if (gender && !genders.includes(gender)) {
      return resp.status(400).json(msg("Invalid gender", "400"));
    }

    this._logger.info(
      `received update user request: ${JSON.stringify({
        id,
        userUpdates: { firstName, lastName, age, gender },
      })}`
    );

    const cmdRes = await this._userManagementService.repository
      .updateUserProfile(id, {
        firstName,
        lastName,
        age,
        gender,
      })
      .catch((err) => {
        this._logger.error(`Error updating user: ${err.message}`);
        return resp.status(400).json(msg(err.message, "400"));
      });

    return resp
      .status(200)
      .json(ok("User profile updated successfully", cmdRes));
  }

  @httpDelete("/:id")
  async deleteUser(@request() req: Request, @response() resp: Response) {
    const { id } = req.params;
    this._logger.info(`received delete user request: ${JSON.stringify(id)}`);

    const user = await this._userManagementService.repository.getById(id);

    if (!user) {
      return resp.status(404).json(msg("User not found", "404"));
    }

    const cmdRes = await this._userManagementService.repository
      .delete(id)
      .catch((err) => {
        this._logger.error(`Error deleting user: ${err.message}`);
        return resp.status(400).json(msg(err, "400"));
      });
    return resp.status(200).json(ok("User deleted successfully", cmdRes));
  }
}
