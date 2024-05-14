import Image from "next/image";
import { TMDB_IMAGE_URL, displayHumanDate } from "~/_utils/utils";
import { getUser } from "~/app/(user)/user_action";
import {
  type SeasonWatchedType,
  type SerieWatchedType,
} from "~/server/db/types";
import { GetTVDetail } from "~/server/queries";
import { type Season, type TVDetail, type User } from "~/types/tmdb_detail";
import { SeasonButtons } from "../../_components/Buttons";
import { DisplayCredits, DisplayGenres } from "../../_components/Display";
import Provider from "../../_components/Providers";
import {
  addSeasonToWatched,
  getUserWatchedTVAndSeason,
  type SeriesAndSeasons,
} from "../../actions";

async function DisplayInfo(props: {
  tv: TVDetail;
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

async function DisplaySeason(props: {
  user: User | null;
  tv: TVDetail;
  tvId: string;
  seasons: Season[];
  seasonsWatched: SeasonWatchedType[] | undefined;
}) {
  const { seasons, user, tv, seasonsWatched } = props;
  const loggedIn = user !== null;

  return (
    <div className="mt-4 flex flex-col gap-1 rounded-md bg-white p-4 text-black">
      <h1>Seasons</h1>
      <hr className="mb-3" />
      <div className="relative flex flex-row flex-wrap gap-4 rounded-sm">
        {seasons.map((season) => {
          const seasonId = season.id.toString();

          const seasonWatched = seasonsWatched?.find((season) => {
            return season.seasonId === seasonId ? season : undefined;
          });

          return (
            <div
              key={seasonId}
              className="relative w-32 shrink-0 border border-slate-900"
            >
              <Image
                src={TMDB_IMAGE_URL(season.poster_path)}
                alt={season.name}
                width={200}
                height={200}
                className="h-44"
              />
              <div className="flex flex-row flex-wrap justify-between gap-1">
                <div>{season.name}</div>
                <div>{season.episode_count} episodes</div>
              </div>
              <div className="absolute right-0 top-0 w-16 rounded-bl-xl bg-white p-2 text-center font-bold">
                {season.vote_average}/10
              </div>
              {loggedIn ? (
                <div className="flex w-full flex-col gap-2 p-1">
                  <SeasonButtons
                    addAllSeason={addSeasonToWatched}
                    season={season}
                    userId={user.id}
                    serie={tv}
                    seasonWatched={seasonWatched}
                  />
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default async function Page(props: { params: { tv_id: string } }) {
  const tv_id = props.params.tv_id;

  const tv = await GetTVDetail(tv_id);
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
