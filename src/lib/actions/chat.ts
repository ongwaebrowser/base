// src/lib/actions/chat.ts
"use server";

import clientPromise from "@/lib/mongodb";
import { Message, Chat } from "@/lib/types";
import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";

const MAX_MESSAGES = 200; // Limit conversations to 200 messages

export async function getChatsForUser(userId: string): Promise<Chat[]> {
  try {
    const client = await clientPromise;
    const db = client.db("ongwaegpt");
    const chatsCollection = db.collection<Chat>("chats");

    const chats = await chatsCollection
      .find({ userId: new ObjectId(userId) })
      .sort({ createdAt: -1 })
      .toArray();
    
    return JSON.parse(JSON.stringify(chats));
  } catch (error) {
    console.error("Error fetching chats:", error);
    return [];
  }
}

export async function getChatById(chatId: string): Promise<Chat | null> {
    try {
        const client = await clientPromise;
        const db = client.db("ongwaegpt");
        const chatsCollection = db.collection<Chat>("chats");

        const chat = await chatsCollection.findOne({ _id: new ObjectId(chatId) });
        if (!chat) return null;

        return JSON.parse(JSON.stringify(chat));

    } catch (error) {
        console.error("Error fetching chat by ID:", error);
        return null;
    }
}


export async function createChat(userId: string, firstMessage: string): Promise<Chat | null> {
  try {
    const client = await clientPromise;
    const db = client.db("ongwaegpt");
    const chatsCollection = db.collection<Chat>("chats");

    const newChat: Omit<Chat, '_id'> = {
      userId: new ObjectId(userId),
      title: firstMessage.substring(0, 30), // Use first message as title
      messages: [],
      createdAt: new Date(),
    };

    const result = await chatsCollection.insertOne(newChat as Chat);
    
    // Revalidate paths to update UI
    revalidatePath("/chat");
    revalidatePath(`/chat/${result.insertedId}`);

    const createdChat = await chatsCollection.findOne({ _id: result.insertedId });
    return createdChat ? JSON.parse(JSON.stringify(createdChat)) : null;

  } catch (error) {
    console.error("Error creating chat:", error);
    return null;
  }
}

export async function addMessageToChat(chatId: string, message: Message) {
  try {
    const client = await clientPromise;
    const db = client.db("ongwaegpt");
    const chatsCollection = db.collection<Chat>("chats");
    
    // Push the new message and slice the array to keep only the last N messages
    const result = await chatsCollection.updateOne(
        { _id: new ObjectId(chatId) },
        { 
            $push: { 
                messages: {
                    $each: [message],
                    $slice: -MAX_MESSAGES 
                }
            } 
        }
    );

    revalidatePath(`/chat/${chatId}`);
    return result.modifiedCount > 0;
  } catch (error) {
    console.error("Error adding message:", error);
    return false;
  }
}

export async function deleteChat(chatId: string) {
    try {
        const client = await clientPromise;
        const db = client.db("ongwaegpt");
        const chatsCollection = db.collection<Chat>("chats");

        const result = await chatsCollection.deleteOne({ _id: new ObjectId(chatId) });

        revalidatePath("/chat");
        revalidatePath(`/chat/${chatId}`);
        
        return result.deletedCount > 0;
    } catch (error) {
        console.error("Error deleting chat:", error);
        return false;
    }
}
