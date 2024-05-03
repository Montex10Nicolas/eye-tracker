export default function MovieDetail(params: { movie_id: number }) {
  return (
    <div>
      <code>{JSON.stringify(params.movie_id)}</code>
      Movie detail
    </div>
  );
}
