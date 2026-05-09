import { nanoid } from "nanoid";

/**
 * Generate a URL-safe share token for tribute links.
 * Format: chere.app/g/{token}
 * 
 * Uses nanoid for URL-safe, unique, short tokens.
 * 10 characters = ~1 trillion combinations (collision-safe for years)
 */
export function generateShareToken(): string {
  return nanoid(10);
}

/**
 * Generate a URL-safe invite token for collaboration links.
 * Format: chere.app/invite/{token}
 */
export function generateInviteToken(): string {
  return nanoid(12);
}

/**
 * Build the full URL for a tribute/gift page.
 */
export function getTributeUrl(shareToken: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return `${baseUrl}/g/${shareToken}`;
}

/**
 * Build the full URL for a collaboration invite.
 */
export function getInviteUrl(inviteToken: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return `${baseUrl}/invite/${inviteToken}`;
}
