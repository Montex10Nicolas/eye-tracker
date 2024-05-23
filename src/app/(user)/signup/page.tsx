import Link from "next/link";
import { Separator } from "~/components/ui/separator";
import { signup } from "../user_action";

export default async function Page() {
  async function submit(formData: FormData) {
    "use server";
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;

    await signup(username, password);
  }

  return (
    <div className="m-6 ml-auto mr-auto flex w-96 flex-col gap-4 rounded-md bg-white p-4 text-black">
      <h1 className="flex justify-center text-xl font-bold uppercase">
        Sign up
      </h1>
      <Separator orientation="horizontal" className="mb-4 h-1 bg-slate-600" />
      <form action={submit} className="flex flex-col gap-2">
        <div className="flex flex-col gap-1">
          <label htmlFor="username">Username:</label>
          <input
            className="border-md rounded-md border border-black p-1 text-lg text-black"
            type="text"
            name="username"
            placeholder="Username"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="password">Password:</label>
          <input
            className="border-md rounded-md border border-black p-1 text-lg text-black"
            type="password"
            name="password"
            placeholder="Password"
          />
        </div>
        <button
          type="submit"
          className="mt-3 w-full cursor-pointer rounded-md bg-slate-600 px-4  py-2 font-semibold uppercase text-white"
        >
          submit
        </button>
        <Link href={"/login"}>
          <button className="w-full rounded-md bg-sky-700 px-4 py-2 font-semibold uppercase text-white">
            go to login
          </button>
        </Link>
      </form>
    </div>
  );
}
