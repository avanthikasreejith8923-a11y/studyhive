import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

/**
 * Searches common local directories for an installed MongoDB server binary (mongod.exe).
 * Using an existing local binary avoids downloading hundreds of megabytes on-the-fly.
 */
function findSystemMongod() {
  const candidates = [
    process.env.MONGOD_PATH,
    'C:/Program Files/MongoDB/Server/8.2/bin/mongod.exe',
    'C:/Program Files/MongoDB/Server/8.0/bin/mongod.exe',
    'C:/Program Files/MongoDB/Server/7.0/bin/mongod.exe',
    'C:/Program Files/MongoDB/Server/6.0/bin/mongod.exe',
    'C:/Program Files/MongoDB/Server/5.0/bin/mongod.exe',
  ];

  for (const c of candidates) {
    if (c && fs.existsSync(c)) return c;
  }

  const serverDir = 'C:/Program Files/MongoDB/Server';
  if (fs.existsSync(serverDir)) {
    try {
      const versions = fs.readdirSync(serverDir);
      for (const v of versions) {
        const candidate = path.join(serverDir, v, 'bin', 'mongod.exe');
        if (fs.existsSync(candidate)) return candidate;
      }
    } catch (_) {}
  }

  return null;
}

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/studyhive';
  
  try {
    // Attempt standard connection with 2-second timeout
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2000,
    });
    console.log(`🐝 Connected to MongoDB at: ${uri}`);
  } catch (err) {
    console.warn(`⚠️ Could not connect to local MongoDB (${err.message}). Starting in-memory fallback...`);
    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      const systemBinary = findSystemMongod();
      const opts = systemBinary ? { binary: { systemBinary } } : {};
      if (systemBinary) {
        console.log(`🍯 Using local MongoDB binary for in-memory server: ${systemBinary}`);
      }
      const mongod = await MongoMemoryServer.create(opts);
      const memUri = mongod.getUri();
      await mongoose.connect(memUri);
      console.log(`🍯 Connected to In-Memory MongoDB at: ${memUri}`);
    } catch (memErr) {
      console.error('❌ Failed to start In-Memory MongoDB:', memErr.message);
      process.exit(1);
    }
  }
};
