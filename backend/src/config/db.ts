import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { config } from './env';

let mongoMemoryServer: MongoMemoryServer | null = null;

export const connectDB = async (): Promise<string> => {
  let uri = config.mongoUri;

  if (!uri) {
    console.log('[DATABASE] MONGODB_URI not provided. Starting MongoMemoryServer for instant execution...');
    mongoMemoryServer = await MongoMemoryServer.create();
    uri = mongoMemoryServer.getUri();
  }

  try {
    await mongoose.connect(uri);
    console.log(`[SUCCESS] MongoDB Connected successfully to: ${uri.startsWith('mongodb://127.0.0.1') ? 'Local MongoDB' : uri.startsWith('mongodb+srv') ? 'MongoDB Atlas' : 'In-Memory MongoDB'}`);
    return uri;
  } catch (error) {
    console.warn('[WARN] Failed to connect to configured MongoDB URI. Falling back to MongoMemoryServer...', error);
    mongoMemoryServer = await MongoMemoryServer.create();
    const fallbackUri = mongoMemoryServer.getUri();
    await mongoose.connect(fallbackUri);
    console.log(`[SUCCESS] MongoDB Connected via MongoMemoryServer fallback: ${fallbackUri}`);
    return fallbackUri;
  }
};

export const closeDB = async (): Promise<void> => {
  await mongoose.disconnect();
  if (mongoMemoryServer) {
    await mongoMemoryServer.stop();
  }
};
