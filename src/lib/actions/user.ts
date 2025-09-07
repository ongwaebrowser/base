// src/lib/actions/user.ts
"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import clientPromise from "@/lib/mongodb";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { User } from "@/lib/types";
import { ObjectId } from "mongodb";

const CreateUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Invalid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

const LoginUserSchema = z.object({
  email: z.string().email("Invalid email address."),
  password: z.string().min(1, "Password is required."),
});

// Helper function to find if an admin exists
async function findAdmin() {
  try {
    const client = await clientPromise;
    const db = client.db("ongwaegpt");
    const admin = await db.collection<User>("users").findOne({ role: "admin" });
    return admin;
  } catch (error) {
    console.error("Error finding admin:", error);
    return null;
  }
}

export async function createUser(userData: z.infer<typeof CreateUserSchema>) {
  const validation = CreateUserSchema.safeParse(userData);
  if (!validation.success) {
    return { success: false, message: validation.error.errors[0].message };
  }

  try {
    const client = await clientPromise;
    const db = client.db("ongwaegpt");
    const usersCollection = db.collection<User>("users");

    const existingUser = await usersCollection.findOne({ email: userData.email });
    if (existingUser) {
      return { success: false, message: "A user with this email already exists." };
    }
    
    // Determine user role
    const adminExists = await findAdmin();
    const role = adminExists ? "user" : "admin";

    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    const result = await usersCollection.insertOne({
      name: userData.name,
      email: userData.email,
      password: hashedPassword,
      role: role,
      createdAt: new Date(),
    });

    if (result.insertedId) {
      return { success: true, message: `User created as ${role}! You can now log in.` };
    } else {
      return { success: false, message: "Failed to create user. Please try again." };
    }
  } catch (error) {
    console.error("Error creating user:", error);
    return { success: false, message: "An unexpected error occurred. Please try again later." };
  }
}

export async function verifyLogin(credentials: z.infer<typeof LoginUserSchema>) {
    const validation = LoginUserSchema.safeParse(credentials);
    if (!validation.success) {
        return { success: false, message: validation.error.errors[0].message };
    }

    try {
        const user = await findUserByEmail(credentials.email);
        if (!user) {
            return { success: false, message: "No user found with this email." };
        }

        const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password);
        if (!isPasswordCorrect) {
            return { success: false, message: "Incorrect password." };
        }

        const sessionData = { userId: user._id.toString(), name: user.name, email: user.email, role: user.role };
        await createSession(sessionData);

        return { success: true, message: "Login successful!", role: user.role };
    } catch (error) {
        console.error("Login error:", error);
        return { success: false, message: "An unexpected error occurred during login." };
    }
}


export async function findUserByEmail(email: string): Promise<User | null> {
  try {
    const client = await clientPromise;
    const db = client.db("ongwaegpt");
    const user = await db.collection<User>("users").findOne({ email });
    return user;
  } catch (error) {
    console.error("Error finding user:", error);
    return null;
  }
}

export async function getAllUsers(): Promise<User[]> {
  try {
    const client = await clientPromise;
    const db = client.db("ongwaegpt");
    const users = await db.collection<User>("users").find({}, { projection: { password: 0 } }).toArray(); // Exclude passwords
    return JSON.parse(JSON.stringify(users));
  } catch (error) {
    console.error("Error fetching all users:", error);
    return [];
  }
}

async function createSession(sessionData: any) {
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  cookies().set("session", JSON.stringify(sessionData), { expires, httpOnly: true });
}

export async function getSession(): Promise<{ userId: string; name: string; email: string; role: 'user' | 'admin' } | null> {
  const sessionCookie = cookies().get("session");
  if (sessionCookie) {
    try {
      return JSON.parse(sessionCookie.value);
    } catch (error) {
      return null;
    }
  }
  return null;
}

export async function logout() {
  cookies().delete("session");
  revalidatePath("/");
}
