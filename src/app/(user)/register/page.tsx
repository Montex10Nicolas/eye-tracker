import { generateIdFromEntropySize } from "lucia";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { lucia } from "~/lib/auth";
import { db } from "~/server/db";
import { userTable } from "~/server/db/schema";

export default async function Register() {
  async function registerSession(formData: FormData) {
    "use server";
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;

    const id = generateIdFromEntropySize(10);
    await db.insert(userTable).values({
      username: username,
      password: password,
      id: id,
    });
    const session = await lucia.createSession(id, {
      username: username,
    });
    const sessionCookie = lucia.createSessionCookie(session.id);
    cookies().set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes,
    );
    redirect("/");
  }

  return (
    <div>
      <form
        className="flex flex-col gap-2 bg-white p-4"
        action={registerSession}
      >
        <input type="text" name="username" className="bg-slate-600" />
        <input type="text" name="password" className="bg-slate-600" />
        <input
          type="submit"
          name="submit"
          value="register"
          className="bg-green-600"
        />
      </form>
    </div>
  );
}
