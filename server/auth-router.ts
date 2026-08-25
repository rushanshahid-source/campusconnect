import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createRouter, publicQuery, authedQuery } from "./middleware.js";
import {
  hashPassword,
  verifyPassword,
  signSessionToken,
  serializeSessionCookie,
  serializeLogoutCookie,
} from "./auth/index.js";
import {
  createUser,
  findUserByEmail,
  touchLastSignIn,
} from "./queries/users.js";

const credentials = {
  email: z.string().email().max(254),
  password: z.string().min(8).max(200),
};

export const authRouter = createRouter({
  me: authedQuery.query((opts) => opts.ctx.user),

  register: publicQuery
    .input(
      z.object({
        ...credentials,
        name: z.string().min(1).max(80),
        university: z.string().max(120).optional(),
        campus: z.string().max(120).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await findUserByEmail(input.email);
      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "An account with this email already exists.",
        });
      }

      const passwordHash = await hashPassword(input.password);
      const user = await createUser({
        email: input.email,
        passwordHash,
        name: input.name,
        university: input.university,
        campus: input.campus,
        avatar: `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(input.name)}`,
        lastSignInAt: new Date(),
      });

      const token = await signSessionToken({ userId: user.id });
      ctx.resHeaders.append(
        "set-cookie",
        serializeSessionCookie(ctx.req.headers, token),
      );

      return user;
    }),

  login: publicQuery
    .input(z.object(credentials))
    .mutation(async ({ ctx, input }) => {
      const user = await findUserByEmail(input.email);
      if (!user || !(await verifyPassword(input.password, user.passwordHash))) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid email or password.",
        });
      }
      if (user.status === "suspended") {
        throw new TRPCError({ code: "FORBIDDEN", message: "This account is suspended. Contact campus support." });
      }

      await touchLastSignIn(user.id);

      const token = await signSessionToken({ userId: user.id });
      ctx.resHeaders.append(
        "set-cookie",
        serializeSessionCookie(ctx.req.headers, token),
      );

      return user;
    }),

  logout: authedQuery.mutation(async ({ ctx }) => {
    ctx.resHeaders.append(
      "set-cookie",
      serializeLogoutCookie(ctx.req.headers),
    );
    return { success: true };
  }),
});
