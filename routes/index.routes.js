import { Router } from "express";

const router = Router();

router.get("/health", (req, res) => {
  res.json({ ok: true, service: "aside-server", time: new Date() });
});

export default router;