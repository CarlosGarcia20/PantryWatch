import { Router } from "express";
import { sensorController } from "../controllers/sensor.controller.js";

export const sensorRouter = Router();

sensorRouter.post('/sensores', sensorController.recibirDatosSensor)