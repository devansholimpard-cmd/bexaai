import { z } from "zod";
import { COOKIE_NAME } from "../shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
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
} from "./db";

const chatInput = z.object({
  conversationId: z.number().int().positive(),
  content: z.string().trim().min(1).max(12000),
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
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
