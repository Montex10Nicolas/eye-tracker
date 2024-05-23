export default async function Page(props: {
  params: {
    tv_id: string;
    season_id: string;
  };
}) {
  return (
    <div>
      <code>{JSON.stringify(props, null, 2)}</code>
    </div>
  );
}
