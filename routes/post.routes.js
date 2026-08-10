import { Router } from "express";
import isAuth from "../middlewares/isAuth.middleware.js";
import { create, list, getOne, update, remove } from "../controllers/post.controller.js";

const router = Router();

router.use(isAuth);

router.post("/", create);
router.get("/", list);
router.get("/:id", getOne);
router.put("/:id", update);
router.delete("/:id", remove);

export default router;