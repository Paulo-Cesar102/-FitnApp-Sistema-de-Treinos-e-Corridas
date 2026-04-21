import { Router } from "express";
import GymController from "../controller/GymController";
import { authMiddleware } from "../middlewares/auth";

const gymRoutes = Router()
const  gymControllerRoutes= new GymController()

gymRoutes.post("/register" , authMiddleware , gymControllerRoutes.create);

gymRoutes.post("/join" , authMiddleware , gymControllerRoutes.join);

export {gymRoutes}