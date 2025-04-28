import config from "@/config";
import jwt from "jsonwebtoken";
export class JWTAuth {
  static validateToken(token: string): string | jwt.JwtPayload {
    try {
      const decoded = jwt.verify(token, config.JWT_SECRET);
      return decoded;
    } catch (error) {
      throw new Error("Invalid token");
    }
  }
}

export default JWTAuth;
