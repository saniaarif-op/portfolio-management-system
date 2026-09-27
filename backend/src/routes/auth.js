import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

const registerSchema = z.object({
  name: z.string().min(2).max(80),
  username: z.string().regex(/^[a-zA-Z0-9_-]{3,30}$/),
  email: z.string().email(),
  password: z.string().min(8).max(100)
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

function tokenFor(user) {
  return jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

function safeUser(user) {
  return {
    id: user.id,
    name: user.name,
    username: user.username,
    email: user.email,
    title: user.title,
    bio: user.bio,
    location: user.location,
    avatarUrl: user.avatarUrl,
    resumeUrl: user.resumeUrl,
    skills: JSON.parse(user.skills || "[]"),
    socials: JSON.parse(user.socials || "[]")
  };
}

router.post("/register", async (req, res) => {
  const data = registerSchema.parse(req.body);

  const exists = await prisma.user.findFirst({
    where: { OR: [{ email: data.email.toLowerCase() }, { username: data.username.toLowerCase() }] }
  });

  if (exists) return res.status(409).json({ message: "Email or username is already in use." });

  const passwordHash = await bcrypt.hash(data.password, 12);
  const user = await prisma.user.create({
    data: {
      name: data.name,
      username: data.username.toLowerCase(),
      email: data.email.toLowerCase(),
      passwordHash
    }
  });

  res.status(201).json({ token: tokenFor(user), user: safeUser(user) });
});

router.post("/login", async (req, res) => {
  const data = loginSchema.parse(req.body);
  const user = await prisma.user.findUnique({ where: { email: data.email.toLowerCase() } });

  if (!user || !(await bcrypt.compare(data.password, user.passwordHash))) {
    return res.status(401).json({ message: "Invalid email or password." });
  }

  res.json({ token: tokenFor(user), user: safeUser(user) });
});

router.get("/me", requireAuth, async (req, res) => {
  res.json({ user: safeUser(req.user) });
});

export default router;
