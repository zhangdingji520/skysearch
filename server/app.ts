import express from "express";
import flightsRouter from "./routes/flights";
import airportsRouter from "./routes/airports";
import healthRouter from "./routes/health";

const app = express();
app.use(express.json({ limit: "2mb" }));

// CORS for local dev
app.use((_req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});

app.use("/api", healthRouter);
app.use("/api", airportsRouter);
app.use("/api", flightsRouter);

export default app;
