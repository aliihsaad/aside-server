import { Router } from "express";
import authRoutes from "./auth.routes.js";

const router = Router();

router.get("/health", (req, res) => {
  res.json({ ok: true, service: "aside-server", time: new Date() });
});

router.use("/auth", authRoutes);

export default router;