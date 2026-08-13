import { Router } from "express";
import authRoutes from "./auth.routes.js";
import userRoutes from "./user.routes.js";
import postRoutes from "./post.routes.js";
import postCommentRoutes from "./postComment.routes.js";
// import resourceCommentRoutes from "./resourceComment.routes.js";

const router = Router();

router.get("/health", (req, res) => {
  res.json({ ok: true, service: "aside-server", time: new Date() });
});

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/posts", postRoutes);
router.use("/post-comments", postCommentRoutes);
// router.use("/resource-comments", resourceCommentRoutes);


export default router;