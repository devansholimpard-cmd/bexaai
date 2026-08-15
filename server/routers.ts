import { createHash } from "node:crypto";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { COOKIE_NAME, ONE_YEAR_MS } from "../shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { hashPassword, normalizeEmail, validatePassword, verifyPassword } from "./_core/password";
import { createLocalSessionToken } from "./_core/localSession";
import { invokeLLM } from "./_core/llm";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import {
  addMessage,
  createConversation,
  getConversationForUser,
  listConversations,
  listMessages,
  renameConversation,
  getUserByEmail,
  upsertUser,
} from "./db";

const chatInput = z.object({
  conversationId: z.number().int().positive(),
  content: z.string().trim().min(1).max(12000),
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    register: publicProcedure
      .input(z.object({ name: z.string().trim().min(1).max(120), email: z.string().email().max(320), password: z.string().min(8).max(128) }))
      .mutation(async ({ ctx, input }) => {
        const email = normalizeEmail(input.email);
        if (!validatePassword(input.password)) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Password must be 8–128 characters." });
        }
        const existing = await getUserByEmail(email);
        if (existing?.passwordHash) {
          throw new TRPCError({ code: "CONFLICT", message: "An account with this email already exists." });
        }
        const openId = existing?.openId ?? `email_${createHash("sha256").update(email).digest("hex").slice(0, 48)}`;
        await upsertUser({ openId, name: input.name, email, passwordHash: await hashPassword(input.password), loginMethod: "email", lastSignedIn: new Date() });
        const sessionToken = await createLocalSessionToken(openId, input.name);
        ctx.res.cookie(COOKIE_NAME, sessionToken, { ...getSessionCookieOptions(ctx.req), maxAge: ONE_YEAR_MS });
        return { success: true } as const;
      }),
    login: publicProcedure
      .input(z.object({ email: z.string().email().max(320), password: z.string().min(1).max(128) }))
      .mutation(async ({ ctx, input }) => {
        const email = normalizeEmail(input.email);
        const user = await getUserByEmail(email);
        if (!user?.passwordHash || !(await verifyPassword(input.password, user.passwordHash))) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid email or password." });
        }
        await upsertUser({ openId: user.openId, lastSignedIn: new Date() });
        const sessionToken = await createLocalSessionToken(user.openId, user.name ?? email);
        ctx.res.cookie(COOKIE_NAME, sessionToken, { ...getSessionCookieOptions(ctx.req), maxAge: ONE_YEAR_MS });
        return { success: true } as const;
      }),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  chat: router({
    conversations: protectedProcedure.query(({ ctx }) => listConversations(ctx.user.id)),
    createConversation: protectedProcedure
      .input(z.object({ title: z.string().trim().min(1).max(255).optional() }).optional())
      .mutation(({ ctx, input }) => createConversation(ctx.user.id, input?.title ?? "New conversation")),
    messages: protectedProcedure
      .input(z.object({ conversationId: z.number().int().positive() }))
      .query(async ({ ctx, input }) => {
        const conversation = await getConversationForUser(input.conversationId, ctx.user.id);
        if (!conversation) throw new Error("Conversation not found");
        return listMessages(input.conversationId);
      }),
    send: protectedProcedure.input(chatInput).mutation(async ({ ctx, input }) => {
      const conversation = await getConversationForUser(input.conversationId, ctx.user.id);
      if (!conversation) throw new Error("Conversation not found");

      const history = await listMessages(input.conversationId);
      await addMessage(input.conversationId, "user", input.content);
      if (conversation.title === "New conversation") {
        await renameConversation(input.conversationId, input.content.replace(/\s+/g, " ").slice(0, 48));
      }

      const response = await invokeLLM({
        model: "gpt-5-mini",
        messages: [
          {
            role: "system",
            content:
              "You are Bexa, a capable, warm, precise AI assistant. Answer the user's question directly, explain reasoning when useful, and use Markdown headings, lists, code blocks, and emphasis when they improve clarity. Never claim to have performed actions or accessed information you do not have.",
          },
          ...history.map(message => ({ role: message.role as "user" | "assistant", content: message.content })),
          { role: "user" as const, content: input.content },
        ],
        reasoning: { effort: "low" },
      });

      const raw = response.choices?.[0]?.message?.content;
      const answer = typeof raw === "string" ? raw : raw?.map(part => (part.type === "text" ? part.text : "")).join("") ?? "I’m sorry, I wasn’t able to generate a response.";
      await addMessage(input.conversationId, "assistant", answer);
      return { answer };
    }),
  }),
});

export type AppRouter = typeof appRouter;
