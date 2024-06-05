import Link from "next/link";
import { DisplaySearchMultiple } from "~/app/(root)/detail/_components/Search";
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
      <button className="rounded-sm bg-sky-500 px-4 py-2 text-sm font-semibold uppercase text-white">
        Sign in
      </button>
    </Link>
  );
}

export default async function NavBar() {
  return (
    <section className="max-w-screen flex flex-row bg-white p-2 py-4 sm:p-4">
      <div className=""></div>
      <div className="flex w-full  flex-row items-center justify-between text-black">
        <Link className="cursor-pointer" href={"/"}>
          <h1 className="text-lg font-bold sm:text-2xl">Siuwi Tracker</h1>
        </Link>
        <DisplaySearchMultiple />
        <HandleLogged />
      </div>
    </section>
  );
}
