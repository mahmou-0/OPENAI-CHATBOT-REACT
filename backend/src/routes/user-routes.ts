import { Router } from "express";
import {
  getAllUsers,
  userLogin,
  userLogout,
  userSignup,
  verifyUser,
} from "../controllers/user-contrillers.js";
import {
  longinValidator,
  signupValidator,
  validate,
} from "../utils/validators.js";
import { verifyToken } from "../utils/token-manager.js";
const userRoutes = Router();

userRoutes.get("/", getAllUsers);
userRoutes.post("/signup", validate(signupValidator), userSignup); // => /user/signup
userRoutes.post("/login", validate(longinValidator), userLogin); // => /user/signup
userRoutes.get("/auth-status", verifyToken, verifyUser); // => /user/signup
userRoutes.get("/logout", verifyToken, userLogout);

export default userRoutes;
