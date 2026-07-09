import jwt from "jsonwebtoken";

const JWT_SECRET = process.env["JWT_SECRET"];

export const REFRESH_TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60;
export const REFRESH_TOKEN_TTL_MS = REFRESH_TOKEN_TTL_SECONDS * 1000;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET não foi definida no .env");
}

const SECRET: string = JWT_SECRET;

type TokenPayload = {
  sub: string;
  type: "access" | "refresh";
};

export function signAccessToken(userId: string) {
  return jwt.sign({ sub: userId, type: "access" }, SECRET, {
    expiresIn: REFRESH_TOKEN_TTL_SECONDS,
  });
}

export function verifyToken(token: string): string {
  let payload: TokenPayload;

  try {
    payload = jwt.verify(token, SECRET) as TokenPayload;
  } catch {
    throw new Error("Token inválido ou expirado");
  }

  return payload.sub;
}
