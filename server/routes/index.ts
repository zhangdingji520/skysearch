import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import flightsRouter from "./flights.js";
import airportsRouter from "./airports.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(flightsRouter);
router.use(airportsRouter);

export default router;
