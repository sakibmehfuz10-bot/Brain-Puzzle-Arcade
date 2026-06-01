import express from "express";
import dotenv from "dotenv";
import apiRouter from "../api-router";

dotenv.config();

const app = express();
app.use(express.json());

// Mount the quiz generator API router under /api
app.use("/api", apiRouter);

export default app;
