import Link from "next/link";
import { Logout, getUser } from "~/app/(user)/user_action";
import Profile from "./profile";

async function HandleLogged() {
  const user = await getUser();
  const loggedIn = user !== null;
  if (loggedIn) {
    return <Profile logout={Logout} />;
  }
  return (
    <Link href="/login">
      <button className="rounded-sm bg-sky-600 px-4 py-2 font-semibold uppercase text-white">
        Sign in
      </button>
    </Link>
  );
}

export default async function NavBar() {
  return (
    <section className="mb-6 flex flex-col gap-4 bg-slate-200 px-6 py-2 text-black sm:flex-row sm:items-center sm:justify-around">
      <div className=""></div>
      <div className="mx-auto text-3xl font-bold ">
        <Link className="cursor-pointer" href={"/"}>
          <h1>Siuwi Tracker</h1>
        </Link>
      </div>
      <div className="flex flex-row gap-4">
        <HandleLogged />
      </div>
    </section>
  );
}
