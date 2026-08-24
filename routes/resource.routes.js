import { Router } from "express";
import isAuth from "../middlewares/isAuth.middleware.js";
import { create, list, getOne, update, remove, fork, lineage } from "../controllers/resource.controller.js";

const router = Router();

router.use(isAuth);

router.post("/", create);
router.get("/", list);
router.post("/:id/fork", fork);
router.get("/:id/lineage", lineage);
router.get("/:id", getOne);
router.put("/:id", update);
router.delete("/:id", remove);

export default router;
