// src/lib/actions/user.ts
"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import clientPromise from "@/lib/mongodb";
import {_prepareDataForClient} from "mongodb/src/utils";

const UserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Invalid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export async function createUser(userData: z.infer<typeof UserSchema>) {
  const validation = UserSchema.safeParse(userData);
  if (!validation.success) {
    return { success: false, message: validation.error.errors[0].message };
  }

  try {
    const client = await clientPromise;
    const db = client.db("ongwaegpt");
    const usersCollection = db.collection("users");

    const existingUser = await usersCollection.findOne({ email: userData.email });
    if (existingUser) {
      return { success: false, message: "A user with this email already exists." };
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    const result = await usersCollection.insertOne({
      name: userData.name,
      email: userData.email,
      password: hashedPassword,
      createdAt: new Date(),
    });

    if (result.insertedId) {
      return { success: true, message: "User created successfully! You can now log in." };
    } else {
      return { success: false, message: "Failed to create user. Please try again." };
    }
  } catch (error) {
    console.error("Error creating user:", error);
    return { success: false, message: "An unexpected error occurred. Please try again later." };
  }
}

export async function findUserByEmail(email: string) {
  try {
    const client = await clientPromise;
    const db = client.db("ongwaegpt");
    const user = await db.collection("users").findOne({ email });
    return user;
  } catch (error) {
    console.error("Error finding user:", error);
    return null;
  }
}
