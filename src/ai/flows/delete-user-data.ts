// src/ai/flows/delete-user-data.ts
'use server';

/**
 * @fileOverview A flow for deleting a user and all their associated data.
 *
 * - deleteUserDataFlow - Deletes a user's account and all their chats from the database.
 * - DeleteUserInput - The input type for the deleteUserDataFlow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

const DeleteUserInputSchema = z.object({
  userId: z.string().describe('The ID of the user to delete.'),
});
export type DeleteUserInput = z.infer<typeof DeleteUserInputSchema>;

const DeleteUserOutputSchema = z.object({
  success: z.boolean(),
  deletedChats: z.number().optional(),
  deletedUser: z.boolean().optional(),
});
export type DeleteUserOutput = z.infer<typeof DeleteUserOutputSchema>;

export const deleteUserDataFlow = ai.defineFlow(
  {
    name: 'deleteUserDataFlow',
    inputSchema: DeleteUserInputSchema,
    outputSchema: DeleteUserOutputSchema,
  },
  async (input) => {
    try {
      const client = await clientPromise;
      const db = client.db('ongwaegpt');
      const userId = new ObjectId(input.userId);

      // Delete all chats associated with the user
      const chatsCollection = db.collection('chats');
      const chatDeletionResult = await chatsCollection.deleteMany({ userId });

      // Delete the user's account
      const usersCollection = db.collection('users');
      const userDeletionResult = await usersCollection.deleteOne({ _id: userId });

      return {
        success: true,
        deletedChats: chatDeletionResult.deletedCount,
        deletedUser: userDeletionResult.deletedCount > 0,
      };
    } catch (error) {
      console.error('Error in deleteUserDataFlow:', error);
      return { success: false };
    }
  }
);
