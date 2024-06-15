import { TVGetOrUpdateSerieData } from "./_actions/tv_actions";

export default async function Page(props: { params: { tv_id: string } }) {
  const {
    params: { tv_id },
  } = props;

  const serie = await TVGetOrUpdateSerieData(tv_id);

  return (
    <main className="h-screen w-full bg-background">
      <code>{JSON.stringify(serie, null, 2)}</code>
    </main>
  );
}
