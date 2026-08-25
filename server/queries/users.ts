import { eq } from "drizzle-orm";
import * as schema from "../../db/schema.js";
import type { InsertUser, User } from "../../db/schema.js";
import { getDb } from "./connection.js";
import { env } from "../lib/env.js";

export async function findUserById(id: number): Promise<User | undefined> {
  const rows = await getDb()
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, id))
    .limit(1);
  return rows.at(0);
}

export async function findUserByEmail(email: string): Promise<User | undefined> {
  const rows = await getDb()
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, email.toLowerCase()))
    .limit(1);
  return rows.at(0);
}

export async function createUser(data: InsertUser): Promise<User> {
  const values: InsertUser = {
    ...data,
    email: data.email.toLowerCase(),
  };

  // The configured owner email gets the "admin" role automatically.
  if (
    values.role === undefined &&
    env.ownerEmail &&
    values.email === env.ownerEmail.toLowerCase()
  ) {
    values.role = "admin";
  }

  const [user] = await getDb().insert(schema.users).values(values).returning();
  return user;
}

export async function touchLastSignIn(id: number): Promise<void> {
  await getDb()
    .update(schema.users)
    .set({ lastSignInAt: new Date() })
    .where(eq(schema.users.id, id));
}
