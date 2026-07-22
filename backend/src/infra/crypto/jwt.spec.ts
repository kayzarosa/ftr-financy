import { describe, expect, it } from "vitest";
import { signAccessToken, verifyToken } from "./jwt.js";

describe("jwt", () => {
  it("must return the same userId that was signed", () => {
    const token = signAccessToken("user-123");

    const userId = verifyToken(token);

    expect(userId).toEqual("user-123");
  });

  it("must throw for a malformed token", () => {
    expect(() => verifyToken("token-invalido")).toThrow();
  });

  it("must throw for an expired token", () => {
    const jwt = require("jsonwebtoken");
    const expiredToken = jwt.sign({ sub: "user-123", type: "access" }, process.env.JWT_SECRET, {
      expiresIn: -1,
    });

    expect(() => verifyToken(expiredToken)).toThrow();
  });
});
