import Image from "next/image";
import Link from "next/link";
import { NOT_FOUND_POSTER, TMDB_IMAGE_URL } from "~/_utils/utils";
import { Badge } from "~/components/ui/badge";
import { GetTVDetail } from "~/server/queries";
import { type Season } from "~/types/tmdb";

function DisplaySeason(props: { season: Season; name: string }) {
  const { season, name } = props;

  const season_poster_image_url = season.poster_path
    ? season.poster_path
    : NOT_FOUND_POSTER;

  if (season.air_date === null) {
    return <div>Season {season.season_number} is still in production</div>;
  }

  return (
    <Link key={season.id} href={`/detail/tv/season/${season.id}`}>
      <div>
        <Image
          src={TMDB_IMAGE_URL(season_poster_image_url)}
          width={150}
          height={250}
          alt={`Poster ${name}-${season.id}`}
        />
        <div className="flex justify-between">
          <div>{season.episode_count} episodes</div>
          <div>{season.vote_average}/10</div>
        </div>
      </div>
    </Link>
  );
}

export default async function TVDetail(props: { params: { tv_id: number } }) {
  const id = props.params.tv_id;
  if (Number.isNaN(id)) {
    throw new Error("Not a valid id");
  }
  const tv = await GetTVDetail(id);
  const background_image_url = tv.backdrop_path
    ? tv.backdrop_path
    : NOT_FOUND_POSTER;
  const poster_image_url = tv.poster_path ? tv.poster_path : NOT_FOUND_POSTER;

  return (
    <main className="p-4">
      <div className="relative flex flex-row gap-4 overflow-hidden rounded-sm border border-white p-4 text-white">
        <Image
          src={TMDB_IMAGE_URL(poster_image_url)}
          alt={`Poster ${tv.name}`}
          width={200}
          height={300}
        />
        <div className="flex h-full flex-col">
          <span className="text-bold">
            {tv.name} <span className="italic text-slate-500">{tv.status}</span>
          </span>
          <div className="flex gap-2">
            <span>Episode count: {tv.number_of_episodes}</span>
            <span>Season count: {tv.number_of_seasons}</span>
          </div>
          <div>
            {tv.genres.map((genre) => (
              <Badge key={genre.id}>{genre.name}</Badge>
            ))}
          </div>
          <p className="content-end">{tv.overview}</p>
        </div>
        <img
          className="absolute left-0 top-0 z-[-1] h-full w-full object-cover opacity-45"
          alt={`background ${tv.name}`}
          src={TMDB_IMAGE_URL(background_image_url)}
        />
      </div>
      <div className="mt-4 flex flex-row gap-2 rounded-md bg-white p-4 text-black">
        {tv.seasons.map((season) => (
          <DisplaySeason key={season.id} season={season} name={tv.name} />
        ))}
      </div>
    </main>
  );
}
