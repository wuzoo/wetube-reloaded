import express from "express";
import { Join } from "./Controllers/userController";
import { trending } from "./Controllers/videoController";

const globalRouter = express.Router();

globalRouter.get("/", trending);
globalRouter.get("/join", Join);

export default globalRouter;
