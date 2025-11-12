import mongoose from "mongoose";

let isConnecting = false;

export const connectToDatabase = async (): Promise<void> => {
  if ((mongoose.connection.readyState as unknown as number) === 1) return;
  if (isConnecting) {
    // Wait until an ongoing connection attempt finishes
    await new Promise((resolve) => setTimeout(resolve, 50));
    if ((mongoose.connection.readyState as unknown as number) === 1) return;
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not set");
  }

  try {
    isConnecting = true;
    await mongoose.connect(uri, {
      dbName: process.env.MONGODB_DB || undefined,
    });
  } finally {
    isConnecting = false;
  }
};
