import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { lucia } from "~/lib/auth";
import { db } from "~/server/db";

export default function Login() {
  async function login(formData: FormData) {
    "use server";
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;

    console.log(`Submitted with ${username}-${password}`);

    const user = await db.query.userTable.findFirst({
      where: (user, { eq, and }) =>
        and(eq(user.password, password), eq(user.username, username)),
    });

    if (user === undefined) {
      return <div>Username or password wrong</div>;
    }

    const session = await lucia.createSession(user.id, {
      username: user.username,
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
    <div className="bg-white p-4 text-black">
      <form action={login} className="flex flex-col gap-2">
        <input type="text" name="username" className="bg-black text-white" />
        <input
          type="password"
          name="password"
          className="bg-black text-white"
        />
        <input type="submit" value="submit" className="bg-green-600" />
      </form>
    </div>
  );
}
