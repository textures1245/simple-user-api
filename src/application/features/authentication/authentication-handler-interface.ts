import { User } from "@/domain/user";
import { IUser } from "@/interface/IUser";
import { Document } from "mongoose";

export interface IAuthenticationHandler {
  register(req: IUser): Promise<{ token: string; user: Document & User }>;
  authenticate(
    username: string,
    password: string
  ): Promise<{ token: string; user: Document & User }>;
}
