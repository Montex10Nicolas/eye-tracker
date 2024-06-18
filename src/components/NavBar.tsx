import Link from "next/link";
import { redirect } from "next/navigation";
import { DisplaySearchMultiple } from "~/app/(root)/detail/_components/Search";
import { Logout, getUser } from "~/app/(user)/user_action";
import Profile from "./profile";

async function HandleLogged() {
  const user = await getUser();
  const loggedIn = user !== null;
  if (loggedIn) {
    return (
      <div className="relative z-50">
        <Profile logout={Logout} />
      </div>
    );
  }
  return (
    <div className="ml-4 mr-2 space-x-2 font-bold text-white">
      <Link href="/login" className="cursor-pointer hover:text-primary">
        Sign in
      </Link>
      <Link
        href="/signup"
        className="cursor-pointer font-bold text-white hover:text-primary"
      >
        Sign up
      </Link>
    </div>
  );
}

export default async function NavBar() {
  return (
    <section className="max-w-screen-s m sticky top-0 z-50 flex h-16 justify-between bg-secondary text-primary">
      <div className="flex h-full items-center">
        <Link href="/" className="mx-2 cursor-pointer">
          <span className="my-auto text-2xl font-bold">Siuwi Tracker</span>
        </Link>
      </div>
      <div className="flex items-center gap-2">
        <DisplaySearchMultiple />
        <HandleLogged />
      </div>
    </section>
  );
}
