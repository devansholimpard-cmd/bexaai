import { describe, expect, it } from "vitest";
import { hashPassword, normalizeEmail, validatePassword, verifyPassword } from "./_core/password";

describe("email authentication helpers", () => {
  it("normalizes email addresses and enforces password length", () => {
    expect(normalizeEmail("  Bexa@Example.COM ")).toBe("bexa@example.com");
    expect(validatePassword("short")).toBe(false);
    expect(validatePassword("correct-horse-battery-staple")).toBe(true);
  });

  it("hashes passwords without storing the plaintext and verifies them", async () => {
    const password = "correct-horse-battery-staple";
    const hash = await hashPassword(password);
    expect(hash).toMatch(/^scrypt:[^:]+:[^:]+$/);
    expect(hash).not.toContain(password);
    expect(await verifyPassword(password, hash)).toBe(true);
    expect(await verifyPassword("wrong-password", hash)).toBe(false);
  });
});
