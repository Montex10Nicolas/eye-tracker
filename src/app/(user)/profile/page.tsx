import { getUser } from "../user_action";
import { LoginRedirect } from "./_components/Client";

async function Summary() {
  return null;
}

export default async function Page() {
  const user = await getUser();

  if (user === null) {
    return (
      <main className="flex h-screen w-screen items-center justify-center">
        <div className="-mt-40 h-[50%] w-[90%] rounded-sm bg-white text-black">
          <p className="space-x-2 p-8 text-center text-3xl">
            You need an account to access this area, you will be redirected in
          </p>
          <div className="text-center text-6xl">
            <LoginRedirect time={3} />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main>
      <Summary />
    </main>
  );
}
