import { getUser } from "~/app/(user)/action";

export default async function Page() {
  const user = await getUser();

  return (
    <main>
      <div>
        <code>{JSON.stringify(user, null, 2)}</code>
      </div>
    </main>
  );
}
