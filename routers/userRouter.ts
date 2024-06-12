import { Router, Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

import { db } from "../index";
import * as schema from "../schema.ts";
import { eq } from "drizzle-orm";

import { validate } from "../utils.ts";
import { z } from "zod";

const router: Router = Router();

const JWT_SECRET = "muchsecret";

router.post(
  "/register",
  validate(
    z.object({
      body: z.object({
        name: z.string().max(255),
        email: z.string().email().max(255),
        password: z.string().min(6),
      }),
    })
  ),
  async (req: Request, res: Response) => {
    const { name, password, email } = req.body;
    const user = await db.query.user.findFirst({
      where: eq(schema.user.email, email),
    });

    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 5);

    const newUser = await db
      .insert(schema.user)
      .values({
        name,
        password: hashedPassword,
        email,
        role: "user",
      })
      .returning();

    res.status(201).json(newUser);
  }
);

router.post(
  "/login",
  validate(
    z.object({
      body: z.object({
        email: z.string().email().max(255),
        password: z.string().min(6),
      }),
    })
  ),
  async (req, res) => {
    const { email, password } = req.body;

    const user = await db.query.user.findFirst({
      where: eq(schema.user.email, email),
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign({ id: user.id }, JWT_SECRET, {
      expiresIn: "30d",
    });

    res.json({ token });
  }
);

export interface AuthenticatedRequest extends Request {
  user?: any;
}

export function authenticateToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

router.get(
  "/profile",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user.id;

    const user = await db.query.user.findFirst({
      where: eq(schema.user.id, userId),
    });

    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found. Was the user deleted?" });
    }

    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  }
);

router.get("/verify", authenticateToken, (_, res) => {
  res.sendStatus(200);
});

export default router;
