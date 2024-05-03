import { GetMovieDetail } from "~/server/queries";

export default async function MovieDetail(props: {
  params: { movie_id: number };
}) {
  const id = props.params.movie_id;

  if (Number.isNaN(id)) {
    throw new Error("Not a number");
  }
  const movie = await GetMovieDetail(id);

  return (
    <div>
      <code>{JSON.stringify(movie)}</code>
      Movie detail
    </div>
  );
}
