// src/auth.ts
import { Lucia, TimeSpan } from "lucia";
import { cookies } from "next/headers";
import { cache } from "react";
import { adapter } from "./adapter";

export const lucia = new Lucia(adapter, {
  getSessionAttributes: function (attributes) {
    return {
      username: attributes.username,
    };
  },
  getUserAttributes: function (attributes) {
    return {
      username: attributes.username,
    };
  },
  sessionCookie: {
    expires: false,
    attributes: {
      // set to `true` when using HTTPS
      secure: process.env.NODE_ENV === "production",
    },
  },
});

// IMPORTANT!
declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseSessionAttributes: DatabaseSessionAttributes;
    DatabaseUserAttributes: DatabaseUserAttributes;
  }
}

interface DatabaseSessionAttributes {
  username: string;
}
interface DatabaseUserAttributes {
  username: string;
}

export const getUser = cache(async () => {
  const sessionId = cookies().get(lucia.sessionCookieName)?.value ?? null;
  console.log("\n\nSessionid: ", sessionId, "\n\n");
  if (sessionId === null) return null;
  const { user, session } = await lucia.validateSession(sessionId);
  try {
    if (session && session.fresh) {
      const sessionCookie = lucia.createSessionCookie(session.id);
      cookies().set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes,
      );
    }
    if (!session) {
      const sessionsCookie = lucia.createBlankSessionCookie();
      cookies().set(
        sessionsCookie.name,
        sessionsCookie.value,
        sessionsCookie.attributes,
      );
    }
  } catch (e: unknown) {
    throw new Error(e);
  }
  return user;
});
