import { Router } from "express";
import isAuth from "../middlewares/isAuth.middleware.js";
import { create, listbyUser, getOne, update, remove } from "../controllers/folder.controller.js";

const router = Router();

router.use(isAuth);

router.post("/", create);
router.get("/user/:userId", listbyUser);
router.get("/:id", getOne);
router.put("/:id", update);
router.delete("/:id", remove);

export default router;
