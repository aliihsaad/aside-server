import { Router } from "express";
import isAuth from "../middlewares/isAuth.middleware.js";
import { signup, login, verify } from "../controllers/auth.controller.js";

const router = Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/verify", isAuth, verify);

export default router;