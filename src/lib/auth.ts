// src/auth.ts
import { Lucia } from "lucia";
import { adapter } from "./adapter";

export const lucia = new Lucia(adapter, {
  // getSessionAttributes: function (attributes) {
  //   return {
  //     username: attributes.username,
  //   };
  // },
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
    // DatabaseSessionAttributes: DatabaseSessionAttributes;
    DatabaseUserAttributes: DatabaseUserAttributes;
  }
}

// interface DatabaseSessionAttributes {
//   username: string;
// }
interface DatabaseUserAttributes {
  username: string;
}
