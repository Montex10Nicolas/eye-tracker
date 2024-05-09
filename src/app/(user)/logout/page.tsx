"use server";
import { Logout } from "~/server/queries";

export default async function Page() {
  "use server";
  await Logout();

  return <div>Logout in process</div>;
}
