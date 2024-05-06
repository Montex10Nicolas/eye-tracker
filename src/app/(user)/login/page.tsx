import { LoginAndCreateSession } from "~/server/queries";

export default function Login() {
  async function login(formData: FormData) {
    "use server";
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;

    console.log(`Submitted with ${username}-${password}`);

    await LoginAndCreateSession(username, password);
  }

  return (
    <div className="bg-white p-4 text-black">
      <form action={login} className="flex flex-col gap-2">
        <input type="text" name="username" className="bg-black text-white" />
        <input
          type="password"
          name="password"
          className="bg-black text-white"
        />
        <input type="submit" value="submit" className="bg-green-600" />
      </form>
    </div>
  );
}
