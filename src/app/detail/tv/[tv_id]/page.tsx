import Image from "next/image";
import Link from "next/link";
import { NOT_FOUND_POSTER, TMDB_IMAGE_URL } from "~/_utils/utils";
import { Badge } from "~/components/ui/badge";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Authorization, GetTVDetail, TMDB_URL } from "~/server/queries";
import { type Season } from "~/types/tmdb";
import { RenderCastCrew } from "../../_components/Summary";

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

  async function TVProvider() {
    "use server";
    const url = new URL(`/tv/${id}/watch/providers`, TMDB_URL);

    const response = await fetch(url, {
      headers: {
        Authorization: Authorization,
      },
    });

    return (await response.json()) as unknown;
  }

  const tv_providers = await TVProvider();

  return (
    <main className="p-4">
      <section className="relative flex flex-row gap-4 overflow-hidden rounded-md border border-white p-4 text-white">
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
      </section>
      <section className="mt-4 rounded-md bg-white p-4 text-black">
        <h2 className="text-xl font-semibold">Seasons</h2>
        <div className="mt-6 flex flex-row flex-wrap gap-2">
          {tv.seasons.map((season) => (
            <DisplaySeason key={season.id} season={season} name={tv.name} />
          ))}
        </div>
      </section>
      <section className="mt-4 overflow-hidden rounded-md bg-white p-4 text-black">
        <h2 className="text-xl font-semibold">Credits</h2>
        <Tabs defaultValue="cast" className="relative mt-6">
          <TabsList className="flex w-full flex-row bg-black">
            <TabsTrigger value="cast" className="w-full">
              Cast
            </TabsTrigger>
            <TabsTrigger value="crew" className="w-full">
              Crew
            </TabsTrigger>
          </TabsList>
          <ScrollArea className="h-[500] w-full">
            <TabsContent value="cast" className="mt-6">
              <RenderCastCrew persons={tv.credits.cast} cast={true} />
            </TabsContent>
            <TabsContent value="crew" className="mt-6">
              <RenderCastCrew persons={tv.credits.crew} cast={false} />
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </section>
    </main>
  );
}
