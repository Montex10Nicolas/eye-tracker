import { type User } from "lucia";
import { revalidatePath } from "next/cache";
import Image from "next/image";
import Link from "next/link";
import {
  TMDB_IMAGE_URL,
  convertMinute,
  displayHumanDate,
} from "~/_utils/utils";
import { getUser } from "~/app/(user)/user_action";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import {
  type DBSeasonWatchedType,
  type StatusWatchedType,
} from "~/server/db/types";
import {
  queryTMDBProvider,
  queryTMDBTVDetail,
  queryTMDBTVRecomendation,
} from "~/server/queries";
import { type Credits, type Season, type Serie } from "~/types/tmdb_detail";
import { DisplayGenres } from "../../_components/Display";
import Provider from "../../_components/Providers";
import {
  addEpisodeToSeasonWatched,
  getUserWatchedTVAndSeason,
  markSeriesAsCompleted,
  removeAllSerie,
  type SeriesAndSeasonsWatched,
} from "../../actions";
import { EditSeason } from "./_components/EditSeason";

async function Info(props: {
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
  const providers = await queryTMDBProvider("tv", serie.id);

  const userId = user?.id.toString();
  const serieId = serie.id.toString();

  async function AddAllSerie() {
    "use server";
    if (user === null) return;
    await markSeriesAsCompleted(userId!, serieId, serie);

    return revalidatePath(`/detail/tv/${serieId}`);
  }

  async function removeSerie() {
    "use server";
    if (user === null) return;
    await removeAllSerie(userId!, serieId, serie);

    return revalidatePath(`/detail/tv/${serieId}`);
  }

  function TotalRuntime() {
    if (episode_run_time[0] === undefined) return "~";
    const [months, days, hours, minutes] = convertMinute(
      episode_run_time[0] * number_of_episodes,
    );
    const date = `${months > 0 ? months + "M " : " "}${days > 0 ? days + "d " : ""}${hours > 0 ? hours + "h " : ""}${minutes}m`;
    return date;
  }

  return (
    <section className="w-full">
      {/* BG TOP */}
      <div className="-z-10 h-[200px] w-full overflow-hidden sm:h-[300px]">
        <Image
          src={TMDB_IMAGE_URL(backdrop_path)}
          width={2000}
          height={300}
          alt={``}
          className="z-0 w-full sm:-translate-y-12"
        />
      </div>

      <div className="flex w-full flex-col sm:flex-row">
        {/* Poster */}
        <div className="relative min-w-36 sm:min-w-56 sm:max-w-56">
          <div className="absolute -mt-40 ml-2 h-[100px] w-[80px] sm:ml-8 sm:h-[300px] sm:w-[200px]">
            <Image
              src={TMDB_IMAGE_URL(poster_path)}
              width={400}
              height={400}
              alt={`Poster ${name}`}
              className="h-full"
            />
            {logged ? (
              <div className="grid h-12 w-full place-items-center  bg-slate-800">
                {watched?.serie.status === "COMPLETED" ? (
                  <form className="h-full w-full" action={removeSerie}>
                    <button
                      type="submit"
                      className="h-full w-full items-center justify-center bg-red-500 font-semibold uppercase"
                    >
                      remove
                    </button>
                  </form>
                ) : (
                  <form className="h-full w-full" action={AddAllSerie}>
                    <button
                      type="submit"
                      className="h-full w-full items-center justify-center bg-blue-500 font-semibold uppercase"
                    >
                      add
                    </button>
                  </form>
                )}
              </div>
            ) : null}
          </div>
        </div>

        <div className="ml-4 space-y-4 p-2">
          <div className="flex flex-row items-center gap-2">
            <h1 className="text-3xl font-bold">{name}</h1>
            <span>|</span>
            <h3 className="text-xl">{original_name}</h3>
          </div>
          <div className="mt-4 flex flex-row flex-wrap gap-x-8 gap-y-1 text-lg">
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
              <span>Total runtime: </span>
              <span>{TotalRuntime()}</span>
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
          <p className="mt-auto text-xl">{overview}</p>
          <Provider providers={providers.results} />
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
  const userId = user!.id.toString();

  function handleButton(
    season: Season,
    found: DBSeasonWatchedType | undefined,
  ) {
    async function DBAddSeason() {
      "use server";

      await addEpisodeToSeasonWatched(userId, serie, season, {
        episodeCount: season.episode_count,
        status: "COMPLETED",
        ended: new Date(),
      });
    }

    async function DBRemoveSeason() {
      "use server";

      await addEpisodeToSeasonWatched(userId, serie, season, {
        episodeCount: -1,
        status: null,
        ended: null,
        started: null,
      });
    }

    const AddBtn = (
      <form className="h-full w-full" action={DBAddSeason}>
        <button
          type="submit"
          className="h-full w-full items-center justify-center bg-blue-500 font-semibold uppercase text-white"
        >
          Add
        </button>
      </form>
    );

    const EditBtn = (
      <div className="h-full w-full">
        <EditSeason
          serie={serie}
          season={season}
          userId={userId}
          addEpisode={addEpisodeToSeasonWatched}
          season_w={found}
          myButton={
            <button className="h-full w-full cursor-pointer items-center justify-center bg-green-500 font-semibold uppercase text-white">
              edit
            </button>
          }
        />
      </div>
    );

    if (found === undefined) {
      return (
        <div className="flex h-16">
          {AddBtn}
          {EditBtn}
        </div>
      );
    }
    const { status } = found;
    const myStatus = status as StatusWatchedType;

    let customBtn: JSX.Element | null = null;

    const RemoveBtn = (
      <form action={DBRemoveSeason} className="h-full w-full">
        <button
          type="submit"
          className="h-full w-full items-center justify-center bg-red-500 font-semibold uppercase text-white"
        >
          Remove
        </button>
      </form>
    );

    if (myStatus === "COMPLETED") {
      customBtn = (
        <>
          {EditBtn}
          {RemoveBtn}
        </>
      );
    } else if (myStatus === "WATCHING") {
      customBtn = (
        <>
          {AddBtn}
          {EditBtn}
          {RemoveBtn}
        </>
      );
    } else {
      customBtn = (
        <>
          {AddBtn}
          {EditBtn}
        </>
      );
    }

    return <div className="flex h-12">{customBtn}</div>;
  }

  // Handle the display of seasons
  function Seasons() {
    const { seasons: original } = serie;
    // Move special from first to last place in the array
    if (original[0]?.season_number === 0) {
      const first = original.shift();
      original.push(first!);
    }
    const seasons = original;

    return (
      <div className="mt-10 flex flex-row flex-wrap gap-16">
        {seasons.map((season) => {
          const { poster_path, season_number, id, name } = season;
          const found = watched?.seasons.find(
            (ses) => ses.seasonId === season.id.toString(),
          );

          return (
            <div key={id} className="w-48">
              <div className="relative">
                <Image
                  src={TMDB_IMAGE_URL(poster_path)}
                  alt="alt"
                  width={200}
                  height={100}
                  className="h-full w-full"
                />
                {logged && found && watched ? (
                  <div className="absolute left-5 top-4 text-xl font-bold text-yellow-950">
                    <span>{watched.serie.status}</span>
                    <p className="w-full space-x-2 text-center">
                      <span>{found.episodeWatched}</span>
                      <span>/</span>
                      <span>{season.episode_count}</span>
                    </p>
                  </div>
                ) : null}
                <p className="absolute right-5 top-3 text-3xl font-bold text-yellow-950 shadow-2xl shadow-blue-500">
                  {season_number === 0 ? name : season_number}
                </p>
              </div>
              {logged ? handleButton(season, found) : null}
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
      <div className="flex flex-row flex-wrap justify-around gap-8">
        {casts.map((cast) => {
          const { name, profile_path, character, original_name } = cast;
          return (
            <div key={cast.id} className="w-32">
              <Link href={`/detail/person/${cast.id}`}>
                <div className="overflow-hidden">
                  <Image
                    src={TMDB_IMAGE_URL(profile_path ?? "")}
                    alt="alt"
                    width={200}
                    height={100}
                    className="transition-transform duration-500 ease-in-out hover:scale-125"
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
              </Link>
            </div>
          );
        })}
      </div>
    );
  }

  function Crew() {
    return (
      <div className="flex flex-row flex-wrap justify-around gap-8">
        {crews.map((crew) => {
          const { name, profile_path, department } = crew;

          return (
            <div key={crew.id} className="w-32">
              <Link href={`/detail/person/${crew.id}`}>
                <div>
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
              </Link>
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

async function Reccomendations(props: { serieId: string }) {
  const { serieId } = props;

  const { results: reccomendations } = await queryTMDBTVRecomendation(
    serieId,
    1,
  );

  return (
    <div className="mx-auto mb-6 w-[90%] p-2">
      <h2 className="text-2xl">Reccomendations: </h2>
      <div className="mt-8 flex flex-row flex-wrap gap-8">
        {reccomendations.map((serie) => {
          const { id, name, poster_path, original_language, first_air_date } =
            serie;

          return (
            <div
              key={id}
              className="max-h-[300px] max-w-[150px] duration-200 ease-in-out hover:scale-110"
            >
              <Link href={`/detail/tv/${id}`}>
                <div className="h-[200px] max-h-[200px] w-[150px] max-w-[150px] overflow-hidden">
                  <Image
                    src={TMDB_IMAGE_URL(poster_path)}
                    alt={name}
                    width={150}
                    height={200}
                  />
                </div>
                <div className="text-wrap">
                  <p className="text-wrap">{name}</p>
                  <p className="flex justify-between">
                    <span>{original_language}</span>
                    <span>{displayHumanDate(first_air_date)}</span>
                  </p>
                </div>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
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
      <Reccomendations serieId={tv_id} />
    </main>
  );
}
