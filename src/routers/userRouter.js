import express from "express";
import { protectorMiddleware, publicOnlyMiddleware } from "../middlewares";
import { getEdit, postEdit, see, logout, startGithubLogin, finishGithubLogin,
startKakaoLogin, finishKakaoLogin } from "./Controllers/userController";

const userRouter = express.Router();

userRouter.get("/logout", protectorMiddleware,logout);
userRouter.route("/edit").all(protectorMiddleware).get(getEdit).post(postEdit);
userRouter.get("/github/start", publicOnlyMiddleware, startGithubLogin);
userRouter.get("/github/finish",publicOnlyMiddleware, finishGithubLogin);
userRouter.get("/kakao/start", publicOnlyMiddleware, startKakaoLogin);
userRouter.get("/kakao/finish", finishKakaoLogin);
userRouter.get(":id", see);

export default userRouter;
