export default async function Page(props: { params: { tv_id: string } }) {
  const {
    params: { tv_id },
  } = props;
  return (
    <main className="h-screen w-full bg-background">
      <code>{JSON.stringify(tv_id, null, 2)}</code>
    </main>
  );
}
