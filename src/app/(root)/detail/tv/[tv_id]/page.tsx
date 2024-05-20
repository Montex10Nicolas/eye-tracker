import Image from "next/image";
import { TMDB_IMAGE_URL, displayHumanDate } from "~/_utils/utils";
import { getUser } from "~/app/(user)/user_action";
import { ScrollArea, ScrollBar } from "~/components/ui/scroll-area";
import {
  type SeasonWatchedType,
  type SerieWatchedType,
} from "~/server/db/types";
import { queryTMDBTVDetail } from "~/server/queries";
import { type Season, type Serie, type User } from "~/types/tmdb_detail";
import { SeasonButtons } from "../../_components/Buttons";
import { DisplayCredits, DisplayGenres } from "../../_components/Display";
import { AddIcon, EditIcon, TrashIcon } from "../../_components/Icons";
import Provider from "../../_components/Providers";
import {
  addSeasonToWatched,
  getUserWatchedTVAndSeason,
  returnEpisodesFromSeason,
  type SeasonWatchWithEpisodes,
  type SeriesAndSeasons,
} from "../../actions";
import DrawerEpisodes from "./_components/SeasonEpisodes";

async function DisplayInfo(props: {
  tv: Serie;
  serieWatched: SerieWatchedType | undefined;
}) {
  const { tv, serieWatched } = props;
  const back_url = tv.backdrop_path;
  const poster_url = tv.poster_path;

  return (
    <section className="relative flex flex-row gap-4 overflow-hidden rounded-md border border-white bg-transparent p-4 text-white">
      <div className="flex max-w-40 shrink-0 flex-col gap-2">
        <div className="min-w-[50%]">
          <Image
            src={TMDB_IMAGE_URL(poster_url)}
            width={130}
            height={130}
            alt={tv.name}
            priority
            className="w-full object-cover"
          />
          <div className="grid w-full grid-flow-col gap-5 p-1 [&>*]:overflow-hidden [&>*]:rounded-md">
            <Provider id={tv.id} type="tv" />
          </div>
        </div>
      </div>

      <div className="flex flex-col">
        <div className="space-x-2">
          <span className="font-bold">{tv.name}</span>
          <span>|</span>
          <span className="italic text-slate-400">{tv.status}</span>
        </div>

        <div className="flex flex-col flex-wrap gap-1">
          <p>
            <span className="italic text-slate-300">Language(s): </span>
            <span>{tv.languages.join("-").toUpperCase()}</span>
          </p>
          <p>
            <span className="italic text-slate-300">Runtime: </span>
            <span>{tv.episode_run_time}</span>m
          </p>
          <p className="">
            <span className="italic text-slate-300">From: </span>
            <span>{displayHumanDate(tv.first_air_date)}</span>
            <span className="italic text-slate-300"> To: </span>
            <span>{displayHumanDate(tv.last_air_date)}</span>
          </p>
          <div>
            <DisplayGenres genres={tv.genres} />
          </div>
        </div>
        <p className="mb-4 mt-auto">
          <span className=" text-slate-300">Overview: </span> {tv.overview}
        </p>
      </div>

      <img
        src={TMDB_IMAGE_URL(back_url)}
        alt={tv.name}
        className="absolute left-0 top-0 -z-10 h-full w-full object-cover opacity-40"
      />
    </section>
  );
}

// I should get all the episodes of a season on Edit button click

async function DisplaySeason(props: {
  user: User | null;
  tv: Serie;
  tvId: string;
  seasons: Season[];
  seasonsWatched: SeasonWatchWithEpisodes[] | undefined;
}) {
  const { seasons, user, tv, seasonsWatched, tvId } = props;
  const loggedIn = user !== null;

  // Position specials at the end of the list
  if (seasons[0]?.name.toLocaleLowerCase() === "specials") {
    const special = seasons.shift();
    if (special !== undefined) {
      seasons.push(special);
    }
  }

  return (
    <section className="mt-4 rounded-md bg-white p-4 text-black">
      <h1 className="text-xl font-semibold">Season</h1>
      <hr className="h-2 w-full bg-black fill-black" />

      <section className="mt-4">
        <ScrollArea className="h-80 w-full">
          <div className="flex flex-row flex-wrap justify-around gap-4">
            {seasons.map((season) => {
              return (
                <div
                  key={season.id}
                  className="flex flex-col bg-slate-900 text-white"
                >
                  <h3 className="py-1 text-center text-xl">{season.name}</h3>
                  <Image
                    src={TMDB_IMAGE_URL(season.poster_path)}
                    width={150}
                    height={300}
                    alt={`Poster ${season.name}`}
                    className="object-fill"
                  />
                  <div className="mt-auto flex h-12 flex-row justify-around">
                    <button className="flex h-full w-full items-center justify-center bg-sky-600">
                      <AddIcon />
                    </button>
                    <DrawerEpisodes
                      seasonId={season.id.toString()}
                      serieId={tvId}
                      season={season}
                      serieName={tv.name}
                      serverEpisodeQuery={returnEpisodesFromSeason}
                    />
                    <button className="flex h-full w-full items-center justify-center bg-red-600">
                      <TrashIcon />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          <ScrollBar orientation="vertical" />
        </ScrollArea>
      </section>
    </section>
  );
}

export default async function Page(props: { params: { tv_id: string } }) {
  const tv_id = props.params.tv_id;

  const tv = await queryTMDBTVDetail(tv_id);
  const user = await getUser();

  const userId = user?.id;

  const seriesAndSeasonWatched: SeriesAndSeasons | undefined =
    await getUserWatchedTVAndSeason(userId, tv_id);

  return (
    <div className="mx-auto mb-6 mt-4 w-[75%] text-black">
      <DisplayInfo tv={tv} serieWatched={seriesAndSeasonWatched?.serie} />
      <DisplaySeason
        user={user}
        tv={tv}
        tvId={tv_id}
        seasons={tv.seasons}
        seasonsWatched={seriesAndSeasonWatched?.seasons}
      />

      <DisplayCredits credits={tv.credits} />
    </div>
  );
}
