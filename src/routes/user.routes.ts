import { Router } from "express";
import { loginUser, logoutUser,updatePassword } from "../controllers/user.controller";
import { verifyJwt } from "../middlewares/auth";

const userRouter: Router = Router();

userRouter.route("/").post(loginUser);

userRouter.route("/logout").post(verifyJwt, logoutUser);

userRouter.route("/update-password").post(verifyJwt,updatePassword);

export { userRouter };
