// src/lib/actions/user.ts
"use server";

import { z } from "zod";

// TODO: Connect to a real database
const users: any[] = [];

const UserSchema = z.object({
  id: z.string().cuid(),
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  createdAt: z.date(),
});

export type User = z.infer<typeof UserSchema>;

export async function createUser(userData: Omit<User, "id" | "createdAt">) {
  // This is a placeholder. In the next step, we will connect this to MongoDB.
  console.log("Creating user (placeholder):", userData.email);
  return { success: true, message: "User created successfully (placeholder)" };
}

export async function findUserByEmail(email: string) {
  // This is a placeholder.
  console.log("Finding user (placeholder):", email);
  return null;
}