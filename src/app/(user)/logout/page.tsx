"use server";

import { Logout } from "../user_action";

export default async function Page() {
  "use server";
  await Logout();

  return <div>Logout in process</div>;
}
