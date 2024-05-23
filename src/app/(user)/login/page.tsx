import Link from "next/link";
import { Separator } from "~/components/ui/separator";
import { login } from "../user_action";

export default async function Login() {
  async function handleSubmit(formData: FormData) {
    "use server";
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;

    await login(username, password);
  }

  return (
    <div className="m-6 ml-auto mr-auto w-96 rounded-md bg-white p-4 text-black">
      <h1 className="mb-2 flex justify-center text-xl font-bold uppercase">
        Login
      </h1>
      <Separator orientation="horizontal" className="mb-4 h-1 bg-slate-600" />
      <form action={handleSubmit} className="flex flex-col gap-2">
        <div className="flex flex-col">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            name="username"
            placeholder="Insert username"
            className="rounded-sm border border-black p-1 text-xl text-black"
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            name="password"
            placeholder="Insert password"
            className="rounded-sm border border-black p-1 text-xl text-black"
          />
        </div>
        <button
          type="submit"
          className="cursor-pointer rounded-md bg-slate-600 px-4 py-2 font-semibold uppercase text-white"
        >
          login
        </button>
        <Link href={"/signup"}>
          <button className="w-full rounded-md bg-sky-700 px-4 py-2 font-semibold uppercase text-white">
            SignUp
          </button>
        </Link>
      </form>
    </div>
  );
}
