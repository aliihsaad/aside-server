import { Router } from "express";
import isAuth from "../middlewares/isAuth.middleware.js";
import { create, remove, listMine } from "../controllers/bookmark.controller.js";

const router = Router();

router.use(isAuth);

router.post("/", create);
router.get("/me", listMine);
router.delete("/:resourceId", remove);

export default router;