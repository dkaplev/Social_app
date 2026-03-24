import { randomBytes } from "crypto";

export function createInviteToken(): string {
  return randomBytes(24).toString("base64url");
}
