import { Router } from "express";
import isAuth from "../middlewares/isAuth.middleware.js";
import { getMe, getOne, list, updateMe } from "../controllers/user.controller.js";

const router = Router();

router.use(isAuth);

router.get("/me", getMe);
router.put("/me", updateMe);
router.get("/", list);
router.get("/:id", getOne);

export default router;