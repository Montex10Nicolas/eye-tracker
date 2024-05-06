import { RegisterAndCreateSession } from "~/server/queries";

export default async function Register() {
  async function registerSession(formData: FormData) {
    "use server";
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;

    console.log(username, password);
    await RegisterAndCreateSession(username, password);
  }

  return (
    <div>
      <form
        className="flex flex-col gap-2 bg-white p-4"
        action={registerSession}
      >
        <input type="text" name="username" className="bg-slate-600" />
        <input type="text" name="password" className="bg-slate-600" />
        <input
          type="submit"
          name="submit"
          value="register"
          className="bg-green-600"
        />
      </form>
    </div>
  );
}
