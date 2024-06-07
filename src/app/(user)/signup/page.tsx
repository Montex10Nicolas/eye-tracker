import Link from "next/link";
import { type z } from "zod";
import { Separator } from "~/components/ui/separator";
import LoginForm, { type FormSchemaType } from "../_components/Form";
import { signup } from "../user_action";

export default async function Page() {
  async function submit(formData: z.infer<FormSchemaType>) {
    "use server";

    const { username, password } = formData;

    const { status, statusText } = await signup(username, password);

    return [status, statusText] as const;
  }

  return (
    <div className="m-6 ml-auto mr-auto w-96 rounded-md bg-white p-4 text-black">
      <h1 className="mb-2 flex justify-center text-xl font-bold uppercase">
        Sign up
      </h1>
      <Separator orientation="horizontal" className="mb-4 h-1 bg-slate-600" />
      <LoginForm submit={submit} />
      <p className="mt-4 space-x-1">
        <span>Already have an account, go </span>
        <Link className="text-blue-800 underline" href="/login">
          login
        </Link>
      </p>
    </div>
  );
}
