import { DisplaySearchMultiple } from "./(root)/detail/_components/Search";

export default async function HomePage() {
  return (
    <main className="flex flex-col">
      <DisplaySearchMultiple />
      <code className="">User: {JSON.stringify(user, null, 2)}</code>
      <code>Result: {JSON.stringify(result, null, 2)}</code>
    </main>
  );
}
