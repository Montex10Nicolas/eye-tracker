// src/auth.ts
import { Lucia, TimeSpan } from "lucia";
import { adapter } from "./adapter";

export const lucia = new Lucia(adapter, {
  sessionExpiresIn: new TimeSpan(2, "w"),
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
    DatabaseUserAttributes: DatabaseUserAttributes;
  }
}

interface DatabaseUserAttributes {
  username: string;
}
