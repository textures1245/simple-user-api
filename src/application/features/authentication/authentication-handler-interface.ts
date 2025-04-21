import { IUser } from "@/interface/IUser";

export interface IAuthenticationHandler {
  register(req: IUser): Promise<void>;
  authenticate(username: string, password: string): Promise<{ token: string }>;
}
