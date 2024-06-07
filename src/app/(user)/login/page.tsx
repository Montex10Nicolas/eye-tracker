import Link from "next/link";
import { type z } from "zod";
import { Separator } from "~/components/ui/separator";
import LoginForm, { type FormSchemaType } from "../_components/Form";
import { login } from "../user_action";

export default async function Login() {
  async function handleSubmit(formData: z.infer<FormSchemaType>) {
    "use server";

    const { username, password } = formData;

    const { status, statusText } = await login(username, password);
    return [status, statusText] as const;
  }

  return (
    <div className="m-6 ml-auto mr-auto w-[90%] rounded-md bg-white p-4 text-black sm:w-96">
      <h1 className="mb-2 flex justify-center text-xl font-bold uppercase">
        Login
      </h1>
      <Separator orientation="horizontal" className="mb-4 h-1 bg-slate-600" />
      <LoginForm submit={handleSubmit} />

      <p className="mt-4 space-x-2">
        <span>Don&apos;t have an account yet go</span>
        <Link href="/signup" className="text-blue-800 underline">
          signup
        </Link>
      </p>
    </div>
  );
}
