import express from "express";
import flightsRouter from "./routes/flights";
import airportsRouter from "./routes/airports";
import healthRouter from "./routes/health";

const app = express();
app.use(express.json());
app.use("/api", healthRouter);
app.use("/api", airportsRouter);
app.use("/api", flightsRouter);

export default app;
