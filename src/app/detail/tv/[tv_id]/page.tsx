import { GetTVDetail } from "~/server/queries";

export default async function TVDetail(props: { params: { tv_id: number } }) {
  const id = props.params.tv_id;
  if (Number.isNaN(id)) {
    throw new Error("Not a valid id");
  }
  const tv = await GetTVDetail(id);

  return (
    <main>
      <code>{JSON.stringify(tv, null, 2)}</code>
    </main>
  );
}
