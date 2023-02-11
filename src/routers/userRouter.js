import express from "express";
import { edit, see, logout, startGithubLogin, finishGithubLogin,
startKakaoLogin, finishKakaoLogin } from "./Controllers/userController";

const userRouter = express.Router();

userRouter.get("/logout", logout);
userRouter.get("/edit", edit);
userRouter.get("/github/start", startGithubLogin);
userRouter.get("/github/finish", finishGithubLogin);
userRouter.get("/kakao/start", startKakaoLogin);
userRouter.get("/kakao/finish", finishKakaoLogin);
userRouter.get(":id", see);

export default userRouter;
