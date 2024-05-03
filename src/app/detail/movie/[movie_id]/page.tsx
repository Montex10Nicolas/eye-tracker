import { Badge } from "~/components/ui/badge";
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
    <main>
      <div>{movie.original_title}</div>
      <div>{movie.overview}</div>
      <div>Budget ${movie.budget}</div>
      {movie.production_companies.map((company) => {
        return (
          <div key={company.id} className="flex gap-2">
            <span>{company.name}</span>
            <span>{company.origin_country}</span>
          </div>
        );
      })}
      <div>{movie.release_date}</div>
      <div>{movie.revenue}</div>
      <div>{movie.runtime}</div>
      <div>
        {movie.spoken_languages.map((language) => {
          return <span key={language.iso_639_1}>{language.name}</span>;
        })}
      </div>
      <div>{movie.status}</div>
      <div>{movie.vote_average}</div>
      <div>
        Genres:
        {movie.genres.map((genre) => {
          return <Badge key={genre.id}>{genre.name}</Badge>;
        })}
      </div>
      <div className="flex flex-col gap-8 bg-white p-8 text-black">
        <code>{JSON.stringify(movie.images, null, 2)}</code>
        <code>{JSON.stringify(movie.credits, null, 2)}</code>
        <code>{JSON.stringify(movie.videos, null, 2)}</code>
      </div>
    </main>
  );
}
