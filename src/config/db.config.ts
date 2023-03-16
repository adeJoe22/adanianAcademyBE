import mongoose from "mongoose";
import environmentVariable from "./environmentVariables.config";

export async function dbConfig(): Promise<void> {
  try {
    const conn = await mongoose.connect(environmentVariable.DB);
    console.log(`DB is connected to ${conn.connection.host}`);
  } catch (error) {
    console.log(error);
  }
}

export default dbConfig;
