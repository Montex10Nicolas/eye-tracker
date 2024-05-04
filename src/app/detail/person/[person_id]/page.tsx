import { GetPersonDetail } from "~/server/queries";

export default async function PersonDetail(props: {
  params: { person_id: number };
}) {
  const person = await GetPersonDetail(props.params.person_id);
  return (
    <div>
      <code>{JSON.stringify(person, null, 2)}</code>
    </div>
  );
}
