import { Schema, model } from "mongoose";
import type { Gender, IUser } from "@interface/IUser";
import { DomainEvent } from "@/core/Event";

const UserSchema = new Schema<User>({
  type: { type: String, default: "user", required: true },
  aggregateName: { type: String, default: "users", required: true },
  aggregateId: { type: String, required: true },

  username: { type: String, required: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String, enum: ["Male", "Female", "Other"], required: true },
});

export class User extends DomainEvent implements IUser {
  type: string = "user";
  aggregateName: string = "users";

  username: string;
  firstName: string;
  lastName: string;
  age: number;
  gender: Gender;
  password: string;

  constructor(
    aggregateId: string,
    username: string,
    password: string,
    firstName: string,
    lastName: string,
    age: number,
    gender: Gender
  ) {
    super(aggregateId);
    this.username = username;
    this.password = password;
    this.firstName = firstName;
    this.lastName = lastName;
    this.age = age;
    this.gender = gender;
  }
}

UserSchema.loadClass(User);

const UserModel = model<User>("User", UserSchema);
export default UserModel;
