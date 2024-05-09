import { hash, verify } from "@node-rs/argon2";
import { generateIdFromEntropySize } from "lucia";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { cache } from "react";
import { lucia } from "~/lib/auth";
import { db } from "~/server/db";
import { userTable } from "~/server/db/schema";

export const PASSWORD_HASH_PAR = {
  memoryCost: 19456,
  timeCost: 2,
  outputLen: 32,
  parallelism: 1,
};

export const getUser = cache(async () => {
  "use server";
  const sessionId = cookies().get(lucia.sessionCookieName)?.value ?? null;
  if (sessionId === null) return null;
  const { user, session } = await lucia.validateSession(sessionId);

  if (session === null) return null;

  try {
    if (session.fresh) {
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
  } catch {
    throw new Error("Error");
  }
  return user;
});

export async function signup(username: string, password: string) {
  "use server";
  if (
    typeof username !== "string" ||
    username.length < 3 ||
    username.length > 31 ||
    !/^[a-z0-9_-]+$/.test(username)
  ) {
    return new NextResponse("Invalid username", {
      status: 400,
    });
  }

  if (
    typeof password !== "string" ||
    password.length < 6 ||
    password.length > 255
  ) {
    return new NextResponse("invalid password", {
      status: 400,
    });
  }
  const passwordHash = await hash(password, { ...PASSWORD_HASH_PAR });
  const userId = generateIdFromEntropySize(10);

  await db.insert(userTable).values({
    username: username,
    password_hash: passwordHash,
    id: userId,
  });
  const session = await lucia.createSession(userId, {});
  const sessionCookie = lucia.createSessionCookie(session.id);
  cookies().set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes,
  );
  return redirect("/");
}

export async function login(username: string, password: string) {
  if (typeof username !== "string" || username.length < 3) {
    return new NextResponse("Invalid username", {
      status: 400,
    });
  }

  if (typeof password !== "string" || password.length < 6) {
    return new NextResponse("Invalid password", {
      status: 400,
    });
  }

  const user = await db.query.userTable.findFirst({
    where: (user, { eq }) => eq(user.username, username),
  });

  if (!user) {
    return new NextResponse("username or password wrong", {
      status: 400,
      statusText: "Username or password wrong",
    });
  }

  const validPassword = await verify(user.password_hash, password, {
    ...PASSWORD_HASH_PAR,
  });

  if (!validPassword) {
    return new NextResponse("Invalid email or password", {
      status: 400,
    });
  }

  const session = await lucia.createSession(user.id, {});
  const sessionCookie = lucia.createSessionCookie(session.id);
  cookies().set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes,
  );
  return redirect("/");
}

async function LogOut() {
  "use server";
  const user = await getUser();
  const sessionId = cookies().get(lucia.sessionCookieName)?.value ?? null;
  if (sessionId !== null) {
    await lucia.invalidateSession(sessionId);
  }
  if (user !== null) {
    await lucia.invalidateUserSessions(user.username);
  }

  cookies().delete(lucia.sessionCookieName);
}
