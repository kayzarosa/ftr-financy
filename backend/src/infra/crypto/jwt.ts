import jwt from "jsonwebtoken";

const JWT_SECRET = process.env["JWT_SECRET"];

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET não foi definida no .env");
}

const SECRET: string = JWT_SECRET;

type TokenPayload = {
  sub: string;
  type: "access" | "refresh";
}

export function signAccessToken(userId: string) {
  return jwt.sign({ sub: userId, type: "access" }, SECRET, { expiresIn: "15m" })
}

export function signRefreshToken(userId: string) {
  return jwt.sign({ sub: userId, type: "refresh" }, SECRET, { expiresIn: "7d" })
}

export function verifyToken(token: string) {
  let payload: TokenPayload;

  try {
    payload = jwt.verify(token, SECRET) as TokenPayload;
  } catch {
    throw new Error("Token inválido ou expirado");
  }

  return payload;
}