import bcrypt from "bcryptjs";
import { prisma } from "../db.js";

export class AuthError extends Error {
  constructor(
    message: string,
    public code: "EMAIL_TAKEN" | "INVALID_CREDENTIALS",
  ) {
    super(message);
    this.name = "AuthError";
  }
}

export async function signUp(input: {
  email: string;
  password: string;
  name: string;
}) {
  const existing = await prisma.user.findUnique({
    where: { email: input.email },
  });
  if (existing) {
    throw new AuthError("Email already registered", "EMAIL_TAKEN");
  }

  const passwordHash = await bcrypt.hash(input.password, 10);

  const user = await prisma.user.create({
    data: {
      email: input.email,
      passwordHash,
      name: input.name,
    },
    select: { id: true, email: true, name: true, createdAt: true },
  });

  return user;
}

export async function signIn(input: { email: string; password: string }) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) {
    throw new AuthError("Invalid email or password", "INVALID_CREDENTIALS");
  }

  const valid = await bcrypt.compare(input.password, user.passwordHash);
  if (!valid) {
    throw new AuthError("Invalid email or password", "INVALID_CREDENTIALS");
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    createdAt: user.createdAt,
  };
}
