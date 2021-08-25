import express from "express";
import { edit, logout, see, startGithubLogin, finishGithubLogin, getEdit, postEdit, getPasswordChange,
postPasswordChange, profile } from "../controllers/userController";
import { protectorMiddleware, publicOnlyMiddleware, avatarUpload } from "../middlewares"

const userRouter = express.Router();

userRouter.route("/edit").all(protectorMiddleware).get(getEdit).post(avatarUpload.single("avatar"), postEdit);
userRouter.get("/logout", protectorMiddleware, logout);
userRouter.get("/github/start", publicOnlyMiddleware, startGithubLogin);
userRouter.get("/github/finish", publicOnlyMiddleware, finishGithubLogin);
userRouter.route("/change-password").all(protectorMiddleware).get(getPasswordChange).post(postPasswordChange)
userRouter.get("/:id", profile);

export default userRouter;