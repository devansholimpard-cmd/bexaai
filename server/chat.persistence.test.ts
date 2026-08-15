import { beforeEach, describe, expect, it, vi } from "vitest";

const dbMocks = vi.hoisted(() => ({
  addMessage: vi.fn(),
  createConversation: vi.fn(),
  getConversationForUser: vi.fn(),
  listConversations: vi.fn(),
  listMessages: vi.fn(),
  renameConversation: vi.fn(),
}));

vi.mock("./db", () => dbMocks);
vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn(async () => ({ choices: [{ message: { content: "## Bexa\n\nHere is a real answer." } }] })),
}));

import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

const user = { id: 42, openId: "persist-user", email: "persist@example.com", name: "Persist User", loginMethod: "manus", role: "user" as const, createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() };
const conversation = { id: 9, userId: 42, title: "New conversation", createdAt: new Date(), updatedAt: new Date() };

function caller() {
  const ctx: TrpcContext = { user, req: { protocol: "https", headers: {} } as TrpcContext["req"], res: {} as TrpcContext["res"] };
  return appRouter.createCaller(ctx);
}

describe("chat persistence", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    dbMocks.createConversation.mockResolvedValue(conversation);
    dbMocks.getConversationForUser.mockResolvedValue(conversation);
    dbMocks.listMessages.mockResolvedValue([]);
  });

  it("creates a conversation for the authenticated account", async () => {
    const result = await caller().chat.createConversation({ title: "Planning" });
    expect(result).toEqual(conversation);
    expect(dbMocks.createConversation).toHaveBeenCalledWith(42, "Planning");
  });

  it("persists the user and assistant messages and renames a fresh conversation", async () => {
    const result = await caller().chat.send({ conversationId: 9, content: "Help me plan a launch." });
    expect(result.answer).toContain("Bexa");
    expect(dbMocks.addMessage).toHaveBeenNthCalledWith(1, 9, "user", "Help me plan a launch.");
    expect(dbMocks.addMessage).toHaveBeenNthCalledWith(2, 9, "assistant", "## Bexa\n\nHere is a real answer.");
    expect(dbMocks.renameConversation).toHaveBeenCalledWith(9, "Help me plan a launch.");
  });
});
