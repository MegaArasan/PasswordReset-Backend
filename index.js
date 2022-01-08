import express from "express";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import cors from "cors";
import { userRouter } from "./routes/users.js";

const app = express();
dotenv.config();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT;
const MONGO_URL = process.env.MONGO_URL;

async function CreateConnection() {
  const client = new MongoClient(MONGO_URL);
  await client.connect();
  console.log("MongoDb is connected");
  return client;
}
export const client = await CreateConnection();

app.listen(PORT, () => console.log("PORT started in:" + PORT));

app.use("/", userRouter);
