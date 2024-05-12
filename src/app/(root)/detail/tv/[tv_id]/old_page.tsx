"use server";

import Image from "next/image";
import Link from "next/link";
import { NOT_FOUND_POSTER, TMDB_IMAGE_URL } from "~/_utils/utils";
import { Badge } from "~/components/ui/badge";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import {
  GetTVDetail,
  getSeasonDetail,
  getTvRecomendation,
} from "~/server/queries";
import {
  type Season,
  type SeasonDetail,
  type TVDetail,
} from "~/types/tmdb_detail";
import { DisplayTV } from "../../_components/Display";
import { SeasonDrawer } from "../../_components/Drawer";
import Provider from "../../_components/Providers";
import { DisplayCastCrew } from "../../_components/Summary";
import { addAll } from "../../actions";

function Info(props: {
  tv: TVDetail;
  posterURL: string;
  backgroundURL: string;
}) {
  const { tv, posterURL, backgroundURL } = props;
  return (
    <section className="relative flex flex-row gap-4 overflow-hidden rounded-md border border-white p-4 text-white">
      <div className="flex flex-col gap-1">
        <Image
          src={TMDB_IMAGE_URL(posterURL)}
          alt={`Poster ${tv.name}`}
          width={300}
          height={300}
          className="min-w-28 shrink-0"
        />
        <div className="flex flex-row justify-around gap-4 lg:sr-only">
          <Provider id={tv.id} type="tv" />
        </div>
      </div>
      <div className="flex h-full flex-col">
        <img
          className="absolute left-0 top-0 z-[-1] h-full w-full object-cover opacity-45"
          alt={`background ${tv.name}`}
          src={TMDB_IMAGE_URL(backgroundURL)}
        />
        <span className="text-bold">
          {tv.name} <span className="italic text-slate-500">{tv.status}</span>
        </span>
        <div className="flex gap-2">
          <span>{tv.number_of_episodes} episodes</span> |
          <span>{tv.number_of_seasons} seasons</span>
        </div>
        <div>
          {tv.genres.map((genre) => (
            <Badge key={genre.id}>{genre.name}</Badge>
          ))}
        </div>
        <p className="content-end">{tv.overview}</p>
        <div className="invisible absolute bottom-3 flex flex-row gap-4 lg:visible">
          <Provider id={tv.id} type="tv" />
        </div>
      </div>
    </section>
  );
}

async function DisplaySeason(props: { season: Season; name: string }) {
  const { season, name } = props;

  const season_poster_image_url = season.poster_path
    ? season.poster_path
    : NOT_FOUND_POSTER;

  if (season.air_date === null) {
    return <div>Season {season.season_number} is still in production</div>;
  }

  return (
    <div>
      <div className="border-1 flex h-full w-64 flex-col border border-slate-800 p-2">
        <div className="flex flex-row gap-2">
          <Link key={season.id} href={`/detail/tv/season/${season.id}`}>
            <Image
              src={TMDB_IMAGE_URL(season_poster_image_url)}
              width={150}
              height={50}
              alt={`Poster ${name}-${season.id}`}
              className="w-[75%] shrink-0"
            />
          </Link>
          <div className="my-auto flex flex-col gap-1 text-white">
            <button className="rounded-sm bg-sky-600 px-4 py-2 uppercase">
              - all
            </button>
            <button className="rounded-sm bg-sky-600 px-4 py-2 uppercase">
              + all
            </button>
            <SeasonDrawer
              buttonText="edit"
              addSeason={addAll}
              seasonId={season.id.toString()}
              seasonNumber={season.season_number}
            />
            <button className=" rounded-sm bg-sky-600 px-4 py-2 uppercase">
              add
            </button>
          </div>
        </div>
        <div className="mt-auto flex justify-between">
          <div>{season.name}</div>
          <div>{season.episode_count} episodes</div>
          <div>{season.vote_average}/10</div>
        </div>
      </div>
    </div>
  );
}

export async function Credits(props: { tv: TVDetail }) {
  const { tv } = props;
  return (
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
            <DisplayCastCrew persons={tv.credits.cast} cast={true} />
          </TabsContent>
          <TabsContent value="crew" className="mt-6">
            <DisplayCastCrew persons={tv.credits.crew} cast={false} />
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </section>
  );
}

export default async function Page(props: { params: { tv_id: number } }) {
  const id = props.params.tv_id;
  if (Number.isNaN(id)) {
    throw new Error("Not a valid id");
  }
  const tv = await GetTVDetail(id);
  const reccomendations = await getTvRecomendation(id, 1);

  const background_image_url = tv.backdrop_path
    ? tv.backdrop_path
    : NOT_FOUND_POSTER;
  const poster_image_url = tv.poster_path ? tv.poster_path : NOT_FOUND_POSTER;

  return (
    <main className="p-4">
      <Info
        tv={tv}
        backgroundURL={background_image_url}
        posterURL={poster_image_url}
      />

      <section className="mt-4 rounded-md bg-white p-4 text-black">
        <h2 className="text-xl font-semibold">Seasons</h2>
        <div className="mt-6 flex flex-row flex-wrap justify-center gap-4">
          {tv.seasons.map((season) => (
            <DisplaySeason key={season.id} season={season} name={tv.name} />
          ))}
        </div>
      </section>

      <section className="mt-4 flex flex-col flex-wrap gap-4 rounded-md bg-white p-4 text-black">
        <h2>Reccomendations</h2>
        <div className="flex flex-row flex-wrap gap-4">
          {/* <code>{JSON.stringify(reccomendations, null, 2)}</code> */}
          {reccomendations.results.map((tv_reccomend) => {
            return (
              <DisplayTV
                key={tv_reccomend.id}
                result={tv_reccomend}
                background_url={tv_reccomend.backdrop_path}
              />
            );
          })}
        </div>
      </section>
    </main>
  );
}
