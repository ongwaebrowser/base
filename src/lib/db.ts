import { MongoClient, ServerApiVersion, Collection } from 'mongodb';
import type { Message } from '@/lib/types';

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

let client: MongoClient;
let messagesCollection: Collection<Message>;

async function connectToDb() {
  if (client && messagesCollection) {
    return { client, messagesCollection };
  }

  client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  });

  try {
    await client.connect();
    await client.db('admin').command({ ping: 1 });
    console.log(
      'Pinged your deployment. You successfully connected to MongoDB!'
    );
    const db = client.db('ongwaegpt');
    messagesCollection = db.collection<Message>('messages');
  } catch (error) {
    console.error('Failed to connect to MongoDB', error);
    // In a real app, you'd want to handle this more gracefully
    throw new Error('Failed to connect to database');
  }

  return { client, messagesCollection };
}

export async function saveMessage(message: Message) {
  const { messagesCollection } = await connectToDb();
  // Using updateOne with upsert:true to insert or update the message.
  // This is useful if you want to prevent duplicate messages by ID.
  return messagesCollection.updateOne(
    { id: message.id },
    { $set: message },
    { upsert: true }
  );
}

export async function getMessages(): Promise<Message[]> {
  const { messagesCollection } = await connectToDb();
  // find().toArray() returns all documents. Note this may be slow for large collections.
  // You might want to add pagination later.
  const messages = await messagesCollection.find({}).toArray();
  // MongoDB stores _id, we don't need it on the client.
  return messages.map(({ _id, ...rest }) => rest);
}

export async function deleteMessage(id: string) {
  const { messagesCollection } = await connectToDb();
  return messagesCollection.deleteOne({ id });
}

export async function clearChat() {
  const { messagesCollection } = await connectToDb();
  return messagesCollection.deleteMany({});
}
