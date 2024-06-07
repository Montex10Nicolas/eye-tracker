import Link from "next/link";
import { type z } from "zod";
import { Separator } from "~/components/ui/separator";
import LoginForm, { type FormSchemaType } from "../_components/LoginForm";
import { login } from "../user_action";

export default async function Login() {
  async function handleSubmit(formData: z.infer<FormSchemaType>) {
    "use server";

    console.log("formData:", formData);

    const { username, password } = formData;

    const { status, statusText } = await login(username, password);
    console.log(status, statusText);
    return [status, statusText] as const;
  }

  return (
    <div className="m-6 ml-auto mr-auto w-96 rounded-md bg-white p-4 text-black">
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
