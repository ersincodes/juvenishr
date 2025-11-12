import mongoose from "mongoose";

const MONGODB_URI =
  process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017/juvenishr";

type MongooseGlobal = typeof globalThis & {
  _mongooseConn?: typeof mongoose;
  _mongoosePromise?: Promise<typeof mongoose>;
};

let cached = (global as MongooseGlobal)._mongooseConn;
let cachedPromise = (global as MongooseGlobal)._mongoosePromise;

export const connectToDatabase = async (): Promise<typeof mongoose> => {
  if (cached) return cached;

  if (!cachedPromise) {
    cachedPromise = mongoose
      .connect(MONGODB_URI, {
        dbName: process.env.MONGODB_DB ?? "juvenishr",
      })
      .then((m) => m);
    (global as MongooseGlobal)._mongoosePromise = cachedPromise;
  }

  cached = await cachedPromise;
  (global as MongooseGlobal)._mongooseConn = cached;
  return cached;
};
