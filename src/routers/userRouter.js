import express from "express";
import { protectorMiddleware, publicOnlyMiddleware, avatarUpload } from "../middlewares";
import { getEdit, postEdit, see, logout, startGithubLogin, finishGithubLogin,
startKakaoLogin, finishKakaoLogin, getChangePassword, postChangePassword } from "./Controllers/userController";

const userRouter = express.Router();

userRouter.get("/logout", protectorMiddleware,logout);
userRouter.route("/edit").all(protectorMiddleware)
.get(getEdit)
.post(avatarUpload.single("avatar") ,postEdit);  // middleware 먼저 실행
userRouter.get("/github/start", publicOnlyMiddleware, startGithubLogin);
userRouter.get("/github/finish",publicOnlyMiddleware, finishGithubLogin);
userRouter.get("/kakao/start", publicOnlyMiddleware, startKakaoLogin);
userRouter.get("/kakao/finish", finishKakaoLogin);
userRouter.route("/change-password").all(protectorMiddleware)
.get(getChangePassword).post(postChangePassword);

userRouter.get("/:id", see);

export default userRouter;
