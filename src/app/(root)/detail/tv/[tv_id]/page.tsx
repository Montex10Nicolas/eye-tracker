import { mysqlDatabase } from "drizzle-orm/mysql-core";
import { type User } from "lucia";
import Image from "next/image";
import { TMDB_IMAGE_URL, displayHumanDate } from "~/_utils/utils";
import { getUser } from "~/app/(user)/user_action";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { type StatusWatchedType } from "~/server/db/types";
import { queryTMDBTVDetail } from "~/server/queries";
import { type Credits, type Season, type Serie } from "~/types/tmdb_detail";
import { DisplayGenres } from "../../_components/Display";
import {
  getUserWatchedTVAndSeason,
  type SeriesAndSeasonsWatched,
} from "../../actions";

function Info(props: {
  serie: Serie;
  user: User | null;
  watched: SeriesAndSeasonsWatched | undefined;
}) {
  const { user, serie, watched } = props;
  const {
    name,
    status,
    number_of_seasons,
    number_of_episodes,
    episode_run_time,
    original_language,
    origin_country,
    original_name,
    networks,
    first_air_date,
    last_air_date,
    genres,
    keywords,
    created_by,
    backdrop_path,
    poster_path,
    overview,
  } = serie;
  const logged = user !== null;
  return (
    <section className="w-full">
      {/* BG TOP */}
      <div className="relative h-64 w-full overflow-hidden">
        <Image
          src={TMDB_IMAGE_URL(backdrop_path)}
          width={2000}
          height={300}
          alt={``}
          className="-top-30 absolute w-full lg:-top-48"
        />
      </div>

      <div className="flex w-full flex-row">
        {/* Poster */}
        <div className="relative min-w-36 sm:min-w-56 sm:max-w-56">
          {/* <div className="-top-8 sm:absolute sm:-top-40 sm:left-12 lg:left-10"> */}
          <div className="-mt-8 ml-2 sm:-mt-40 sm:ml-8">
            <Image
              src={TMDB_IMAGE_URL(poster_path)}
              width={400}
              height={400}
              alt={`Poster ${name}`}
              className=""
            />
            {logged ? (
              <div className="grid h-12 w-full place-items-center bg-slate-800">
                {watched?.serie.status === "COMPLETED" ? (
                  <button className="h-full w-full items-center justify-center bg-red-500 font-semibold uppercase">
                    Remove
                  </button>
                ) : (
                  <button className="h-full w-full items-center justify-center bg-blue-500 font-semibold uppercase">
                    add
                  </button>
                )}
              </div>
            ) : null}
          </div>
        </div>

        <div className="ml-4 space-y-4 p-2">
          <div className="flex flex-row items-center gap-2">
            <h1 className="text-3xl">{name}</h1>
            <span>|</span>
            <h3 className="text-xl">{original_name}</h3>
          </div>
          <div className="mt-4 flex flex-row flex-wrap gap-x-8 gap-y-1 text-xl">
            <p>
              <span>Number of Season: </span>
              <span>{number_of_seasons}</span>
            </p>
            <p>
              <span>Episode number: </span>
              <span>{number_of_episodes}</span>
            </p>
            <p>
              <span>Status: </span>
              <span>{status}</span>
            </p>
            <p>
              <span>Runtime: </span>
              <span>{episode_run_time}m</span>
            </p>
            <p>
              <span>Origin Country: </span>
              <span>{origin_country.join(" - ")}</span>
            </p>
            <p>
              <span>Origin Language: </span>
              <span>{original_language.toUpperCase()}</span>
            </p>
            <p>
              <span>Networks: </span>
              <span className="space-x-2">
                {networks.map((n) => (
                  <span key={n.id}>{n.name}</span>
                ))}
              </span>
            </p>
            <p>
              <span>Created by: </span>
              <span className="space-x-2">
                {created_by.map((e) => (
                  <span key={e.id}>{e.name}</span>
                ))}
              </span>
            </p>
            <p>
              <span>Air Time: </span>
              <span className="space-x-1">
                <span>{displayHumanDate(first_air_date)}</span>
                <span>-</span>
                <span>
                  {displayHumanDate(last_air_date.toLocaleLowerCase())}
                </span>
              </span>
            </p>
          </div>
          <div>
            <DisplayGenres genres={genres} />
          </div>
          <div className="space-x-2 text-xl">
            <span>Keywords: </span>
            {keywords.results.map((res, idx) => (
              <span key={res.id}>
                <span>{res.name}</span> {idx > 0 ? <span>, </span> : null}
              </span>
            ))}
          </div>
          <div></div>
          <p className="mt-auto text-xl">{overview}</p>
        </div>
      </div>
    </section>
  );
}

export async function Seasons(props: {
  serie: Serie;
  watched: SeriesAndSeasonsWatched | undefined;
  user: User | null;
}) {
  const { serie, watched, user } = props;
  const logged = user !== null;

  function handleButton(season: Season) {
    const found = watched?.seasons.find(
      (ses) => ses.seasonId === season.id.toString(),
    );

    if (found === undefined) {
      return (
        <div className="h-16">
          <button className="h-full w-full items-center justify-center bg-blue-500 font-semibold uppercase text-white">
            ADD
          </button>
        </div>
      );
    }
    const { status } = found;
    const myStatus = status as StatusWatchedType;

    let buttons: JSX.Element | null = null;

    if (myStatus === "COMPLETED") {
      buttons = (
        <>
          <button className="h-full w-full items-center justify-center bg-green-500 font-semibold uppercase text-white">
            edit
          </button>
          <button className="h-full w-full items-center justify-center bg-red-500 font-semibold uppercase text-white">
            remove
          </button>
        </>
      );
    } else {
      buttons = (
        <>
          <button className="h-full w-full items-center justify-center bg-blue-500 uppercase text-white">
            Add
          </button>
          <button className="h-full w-full items-center justify-center bg-green-500 uppercase text-white">
            Edit
          </button>
        </>
      );
    }

    return <div className="flex h-16">{buttons}</div>;
  }

  // Handle the display of seasons
  function Seasons() {
    const { seasons } = serie;

    return (
      <div className="mt-10 flex flex-row flex-wrap gap-16">
        {seasons.map((season) => {
          const { name, poster_path, season_number, id } = season;

          return (
            <div key={id}>
              <div className="relative h-96">
                <Image
                  src={TMDB_IMAGE_URL(poster_path)}
                  alt="alt"
                  width={200}
                  height={100}
                  className="h-full w-full"
                />
                <p className="absolute right-5 top-3 text-3xl font-bold text-yellow-950 shadow-2xl shadow-blue-500">
                  {season_number}
                </p>
              </div>
              {logged ? handleButton(season) : null}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <section className="mx-auto w-[90%]">
      <h1 className="text-2xl">Seasons</h1>
      {Seasons()}
    </section>
  );
}

async function Credits(props: { credits: Credits }) {
  const {
    credits: { cast: casts, crew: crews },
  } = props;

  function Cast() {
    return (
      <div className="flex flex-row flex-wrap gap-8">
        {casts.map((cast) => {
          const { name, profile_path, character, original_name } = cast;
          return (
            <div key={cast.id} className="w-48 text-xl">
              <div>
                <Image
                  src={TMDB_IMAGE_URL(profile_path ?? "")}
                  alt="alt"
                  width={200}
                  height={100}
                />
              </div>
              <div>
                <p className="flex w-full flex-wrap space-x-2">
                  <span>{name}</span>
                  <span>|</span>
                  <span>{original_name}</span>
                </p>
                <p className="mt-4">
                  <span>{character}</span>
                </p>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  function Crew() {
    return (
      <div className="flex flex-row flex-wrap gap-8">
        {crews.map((crew) => {
          const { name, profile_path, department } = crew;

          return (
            <div key={crew.id}>
              <div className="">
                <Image
                  src={TMDB_IMAGE_URL(profile_path ?? "")}
                  alt={name}
                  width={200}
                  height={100}
                  className="h-full w-full"
                />
              </div>
              <div>
                <p>{name}</p>
                <p>{department}</p>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <section className="mx-auto w-[90%]">
      <h1 className="text-2xl">Credits</h1>
      <Tabs defaultValue="cast" className="w-full">
        <TabsList className="grid grid-cols-2 bg-transparent text-white">
          <TabsTrigger value="cast" className="">
            <p className="h-full w-full rounded-md bg-blue-600 py-4 font-semibold uppercase">
              Cast
            </p>
          </TabsTrigger>
          <TabsTrigger value="crew">
            <p className="h-full w-full rounded-md bg-blue-600 py-4 font-semibold uppercase">
              Crew
            </p>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="cast" className="mt-10">
          <h2 className="text-2xl">Cast</h2>
          {Cast()}
        </TabsContent>
        <TabsContent value="crew" className="mt-10">
          <h2 className="text-2xl">Crew</h2>
          {Crew()}
        </TabsContent>
      </Tabs>
    </section>
  );
}

export default async function Page(props: { params: { tv_id: string } }) {
  const tv_id = props.params.tv_id;

  const serie = await queryTMDBTVDetail(tv_id);
  const user = await getUser();

  const userId = user?.id;

  const seriesAndSeasonWatched: SeriesAndSeasonsWatched | undefined =
    await getUserWatchedTVAndSeason(userId, tv_id);

  return (
    <main className="w-screen">
      <Info user={user} serie={serie} watched={seriesAndSeasonWatched} />
      <hr className="my-2 min-h-8 w-full" />
      <Seasons user={user} serie={serie} watched={seriesAndSeasonWatched} />
      <hr className="my-8 min-h-8 w-full" />
      <Credits credits={serie.credits} />
      <hr className="my-2 min-h-8 w-full" />
    </main>
  );
}
