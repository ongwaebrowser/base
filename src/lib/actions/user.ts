
// src/lib/actions/user.ts
"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import clientPromise from "@/lib/mongodb";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { User } from "@/lib/types";
import { ObjectId } from "mongodb";
import { deleteUserDataFlow } from "@/ai/flows/delete-user-data";

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
    
    const adminExists = await findAdmin();
    const role = adminExists ? "user" : "admin";

    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    const result = await usersCollection.insertOne({
      _id: new ObjectId(),
      name: userData.name,
      email: userData.email,
      password: hashedPassword,
      role: role,
      createdAt: new Date(),
      subscription: {
        tier: 'free',
        paymentStatus: 'none',
      }
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

        const sessionData = { 
          userId: user._id.toString(), 
          name: user.name, 
          email: user.email, 
          role: user.role,
          subscription: user.subscription
        };
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
    
    if (user && user.subscription?.tier === 'premium' && user.subscription.expiresAt && user.subscription.expiresAt < new Date()) {
      // Subscription expired, revert to free
      const usersCollection = db.collection<User>("users");
      await usersCollection.updateOne({ _id: user._id }, {
        $set: {
          'subscription.tier': 'free',
          'subscription.paymentStatus': 'none'
        },
        $unset: {
          'subscription.expiresAt': ""
        }
      });
      user.subscription.tier = 'free';
    }

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
    const users = await db.collection<User>("users").find({}, { projection: { password: 0 } }).sort({ createdAt: -1 }).toArray(); // Exclude passwords
    return JSON.parse(JSON.stringify(users));
  } catch (error) {
    console.error("Error fetching all users:", error);
    return [];
  }
}

export async function deleteUserAccount() {
  const session = await getSession();
  if (!session) {
    return { success: false, message: "Not authenticated" };
  }

  try {
    await deleteUserDataFlow({ userId: session.userId });
    await logout(); // Log the user out after deleting their data.
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error deleting user account:", error);
    return { success: false, message: "An error occurred while deleting the account." };
  }
}

export async function requestPremium() {
    const session = await getSession();
    if (!session) return { success: false, message: "Not authenticated" };

    try {
        const client = await clientPromise;
        const db = client.db("ongwaegpt");
        const usersCollection = db.collection<User>("users");
        await usersCollection.updateOne(
            { _id: new ObjectId(session.userId) },
            { $set: { 'subscription.paymentStatus': 'pending' } }
        );
        revalidatePath('/admin');
        revalidatePath('/premium');
        return { success: true };
    } catch (error) {
        console.error("Error requesting premium:", error);
        return { success: false, message: "An error occurred." };
    }
}

export async function approveSubscription(userId: string) {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
        return { success: false, message: "Unauthorized" };
    }

    try {
        const client = await clientPromise;
        const db = client.db("ongwaegpt");
        const usersCollection = db.collection<User>("users");
        
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7-day subscription

        await usersCollection.updateOne(
            { _id: new ObjectId(userId) },
            { 
                $set: { 
                    'subscription.tier': 'premium',
                    'subscription.paymentStatus': 'paid',
                    'subscription.expiresAt': expiresAt
                } 
            }
        );
        revalidatePath('/admin');
        return { success: true };
    } catch (error) {
        console.error("Error approving subscription:", error);
        return { success: false, message: "An error occurred." };
    }
}


async function createSession(sessionData: any) {
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  cookies().set("session", JSON.stringify(sessionData), { expires, httpOnly: true, path: '/' });
}

export async function getSession(): Promise<(User & { userId: string }) | null> {
  const sessionCookie = cookies().get("session");
  if (sessionCookie) {
    try {
      const session = JSON.parse(sessionCookie.value);
      // Basic check for expired subscription on session load
      if (session.subscription?.tier === 'premium' && session.subscription.expiresAt && new Date(session.subscription.expiresAt) < new Date()) {
        session.subscription.tier = 'free';
        // Re-save session with updated tier
        await createSession(session);
      }
      return session;
    } catch (error) {
      // Corrupted cookie, delete it
      cookies().delete("session");
      return null;
    }
  }
  return null;
}

export async function logout() {
  cookies().delete("session");
  revalidatePath("/");
}
