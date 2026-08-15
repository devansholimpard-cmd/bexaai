import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createContext(user: TrpcContext["user"]): TrpcContext {
  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("chat access", () => {
  it("rejects conversation access for unauthenticated users", async () => {
    const caller = appRouter.createCaller(createContext(null));
    await expect(caller.chat.conversations()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("requires a positive conversation id for message history", async () => {
    const user = {
      id: 7,
      openId: "bexa-test-user",
      email: "bexa@example.com",
      name: "Bexa Tester",
      loginMethod: "manus",
      role: "user" as const,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    };
    const caller = appRouter.createCaller(createContext(user));
    await expect(caller.chat.messages({ conversationId: 0 })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});
