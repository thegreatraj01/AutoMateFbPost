import { Router } from "express";
import { healthcheck } from "../controllers/healthcheck.controller.js";

const healthcheckRoute = Router();

healthcheckRoute.get("/", healthcheck);

export default healthcheckRoute;