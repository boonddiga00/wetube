import express from "express";
import { viewsController } from "../controllers/videoController";

const apiRouter = express.Router();

apiRouter.post("/videos/:id([0-9a-f]{24})/view", viewsController);

export default apiRouter;