export type Gender = "Male" | "Female" | "Other";

export interface IUser {
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  age: number;
  gender: Gender;
}

export interface UserPayload {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  age: number;
  gender: string;
}
