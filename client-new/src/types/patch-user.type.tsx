import type { User } from "./user.type";

export type PatchUser = Partial<Omit<User, "id" | "createdAt" | "updatedAt">>;
