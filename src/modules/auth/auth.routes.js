import express from "express";
import { getMe, getSessions, login, logout, logoutAll, refresh, register, revoke } from "./auth.controller.js";
import authenticate from "../../middleware/authenticate.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", logout);

router.get("/me", authenticate, getMe);
router.post("/logout-all", authenticate, logoutAll);
router.get("/sessions", authenticate, getSessions);
router.delete("/sessions/:id", authenticate, revoke);

export default router;