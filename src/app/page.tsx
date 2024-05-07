import { cookies } from "next/headers";
import { getUser, lucia } from "~/lib/auth";

export default async function HomePage() {
  const user = await getUser();
  const sessionId = cookies().get(lucia.sessionCookieName)?.value ?? null;

  if (!sessionId) {
    return <div>User null session null</div>;
  }
  const result = await lucia.validateSession(sessionId);

  return (
    <main className="flex flex-col rounded-md bg-white p-4 text-black">
      <code>User: {JSON.stringify(user, null, 2)}</code>
      <code>Result: {JSON.stringify(result, null, 2)}</code>
    </main>
  );
}
