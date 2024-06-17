import { type User } from "lucia";
import Image from "next/image";
import Link from "next/link";
import { removeAllListeners } from "process";
import {
  TMDB_IMAGE_URL,
  addZero,
  convertMinute,
  displayHumanDate,
} from "~/_utils/utils";
import { getUser } from "~/app/(user)/user_action";
import { type DBSeasonWatchedType } from "~/server/db/types";
import { queryTMDBProvider, queryTMDBTVRecomendation } from "~/server/queries";
import { type Credits, type Season, type Serie } from "~/types/tmdb_detail";
import Provider from "../../_components/Providers";
import {
  addEpisodeToSeasonWatched,
  getUserWatchedTVAndSeason,
  markSeriesAsCompleted,
  removeAllSerie,
  type SeriesAndSeasonsWatched,
} from "../../actions";
import { TVGetOrUpdateSerieData } from "./_actions/tv_actions";
import { ClientCredits } from "./_components/Client";
import { EditSeason } from "./_components/EditSeason";
import { SeasonForm } from "./_components/SeasonForm";
import { SerieForm } from "./_components/SerieForm";

async function Detail(props: { user: User | null; serie: Serie }) {
  const { user, serie } = props;

  const userId = user?.id;
  const serieId = serie.id.toString();

  const season_watched = await getUserWatchedTVAndSeason(userId, serieId);
  const isLogged = user !== null,
    hasWatched = season_watched !== null;

  const services = await queryTMDBProvider("tv", serie.id);

  const {
    name,
    overview,
    original_name,
    number_of_episodes,
    number_of_seasons,
    episode_run_time,
    genres,
    keywords,
    first_air_date,
    last_air_date,
    origin_country,
    poster_path,
    status,
    languages,
    networks,
  } = serie;
  const totalRuntime = (episode_run_time[0] ?? -1) * number_of_episodes;
  const {
    minutes: totalMinutes,
    hours: totalHours,
    days: totalDays,
    months: totalMonths,
  } = convertMinute(totalRuntime);

  function Field(props: { title: string; children: React.ReactNode }) {
    const { title, children } = props;

    return (
      <div>
        <span className="font-semibold">{title}</span>
        <span className="space-x-1 capitalize">{children}</span>
      </div>
    );
  }

  function DisplayDateInput(props: { input: number; appendix: string }) {
    const { input, appendix } = props;
    return input !== -1 && input > 0 ? (
      <span>{`${addZero(input)}${appendix}`}</span>
    ) : null;
  }

  function AddToListButton(p: { value: boolean } = { value: false }) {
    const { value } = p;
    return (
      <EditSeason
        myButton={
          <button className="mt-4 w-full rounded-sm bg-primary py-3 text-sm sm:px-8 sm:text-base">
            <span>Add to list</span>
          </button>
        }
        value={value}
      >
        <SerieForm
          markCompleted={markSeriesAsCompleted}
          removeAllSerie={removeAllSerie}
          serie={serie}
          userId={userId!}
          season_watched={season_watched}
        />
      </EditSeason>
    );
  }

  function Main() {
    return (
      <div className="col-span-8 row-span-2 h-full bg-foreground  text-black">
        {/* Title + Vote */}
        <div className="flex items-center justify-between">
          <h1 className="ml-3 text-2xl font-bold">{name}</h1>
          <div className="m-1 grid h-10 w-10 place-content-center rounded-sm bg-primary p-2 ">
            <span>9</span>
          </div>
        </div>
        <hr className="mx-auto h-1 w-11/12 bg-primary lg:w-full " />
        {/* Content */}
        <div className="flex h-auto flex-col gap-2 sm:flex-row">
          <div className="flex p-2 sm:block sm:px-5 sm:py-4">
            <div className="h-[169px] min-w-[110px] sm:h-[270px] sm:min-w-[180px]">
              <Image
                src={TMDB_IMAGE_URL(poster_path)}
                width={180}
                height={270}
                alt={name}
                className="h-full w-full"
              />
            </div>
            <div className="ml-2 text-xs sm:hidden">{overview}</div>
            {isLogged ? (
              <div className="hidden sm:block">
                <AddToListButton value={true} />
                <button className="mt-4 h-full w-full rounded-sm bg-primary py-3 text-base">
                  stars
                </button>
              </div>
            ) : null}
          </div>
          <div className="mx-6 my-3 text-xs sm:mb-0 sm:mr-8 sm:text-base">
            <div className="hidden sm:block">{overview}</div>
            <hr className="mx-auto h-1 w-11/12 bg-primary sm:w-full " />

            {/* Detail on Mobile */}
            <div className="sm:hidden">
              {isLogged ? (
                <div className="mb-3 flex justify-between">
                  <AddToListButton value={false} />
                  <button className="mt-4 h-full w-2/5 rounded-sm bg-primary py-1 text-base">
                    stars
                  </button>
                </div>
              ) : null}
              <Field title="Name: ">{name}</Field>
              <Field title="Status: ">{status}</Field>
              <Field title="Episode: ">{number_of_episodes}</Field>
              <Field title="Seasons: ">{number_of_seasons}</Field>
              <Field title="Runtime: ">
                {episode_run_time.length > 0 ? (
                  episode_run_time.map((el) => <span key={el}>{el}</span>)
                ) : (
                  <span className="text-red-600">uknown</span>
                )}
              </Field>
              <Field title="Total runtime: ">
                <DisplayDateInput input={totalMonths} appendix="M" />
                <DisplayDateInput input={totalDays} appendix="d" />
                <DisplayDateInput input={totalHours} appendix="h" />
                <DisplayDateInput input={totalMinutes} appendix="m" />
              </Field>
              <Field title="Air time: ">
                {displayHumanDate(first_air_date)}-
                {displayHumanDate(last_air_date)}
              </Field>
            </div>

            {/* Detail for Desktop and Mobile */}
            <div className="">
              <Field title="Native name: ">{original_name}</Field>
              <Field title="Country of origin: ">
                {origin_country.length > 0 ? (
                  origin_country.map((el) => <span key={el}>{el}</span>)
                ) : (
                  <span>Unknown</span>
                )}
              </Field>
              <Field title="Genres: ">
                {genres.map((el, idx) => (
                  <span key={el.id}>
                    {el.name}
                    {idx != genres.length - 1 ? ", " : ""}
                  </span>
                ))}
              </Field>
              <Field title="Keywords: ">
                {keywords.results.map((el, idx) => (
                  <span key={el.id}>
                    {el.name}
                    {idx != keywords.results.length - 1 ? "," : ""}
                  </span>
                ))}
              </Field>
              <Field title={`Language${languages.length > 1 ? "s" : ""}: `}>
                {languages.map((el, idx) => (
                  <span className="uppercase" key={el}>
                    {el}
                    {idx !== languages.length - 1 ? "," : ""}
                  </span>
                ))}
              </Field>
              <Field title="Networks: ">
                {networks.map((el, idx) => (
                  <span key={el.id}>
                    {el.name}
                    {idx != networks.length - 1 ? "," : ""}
                  </span>
                ))}
              </Field>
            </div>

            <div>
              <Provider providers={services.results} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Desktop only Detail
  function Detail() {
    const runtime = episode_run_time[0] ?? -1;

    return (
      <div className="px-4 py-2 text-xl text-black">
        <Field title="Name: ">{name}</Field>
        <Field title="Status: ">{status}</Field>
        <Field title="Episode: ">{number_of_episodes}</Field>
        <Field title="Seasons: ">{number_of_seasons}</Field>
        <Field title="Runtime: ">{runtime}</Field>
        <Field title="Total runtime: ">
          <DisplayDateInput input={totalMonths} appendix="M" />
          <DisplayDateInput input={totalDays} appendix="d" />
          <DisplayDateInput input={totalHours} appendix="h" />
          <DisplayDateInput input={totalMinutes} appendix="m" />
        </Field>
        <Field title="Air time: ">
          {displayHumanDate(first_air_date)}-{displayHumanDate(last_air_date)}
        </Field>
      </div>
    );
  }

  return (
    <section className="min-h-[500px] w-full grid-cols-12 grid-rows-2 gap-x-8 gap-y-4 px-2 sm:px-4 lg:mx-auto lg:grid xl:w-4/5 ">
      <Main />
      <div className="col-span-3 row-span-2 hidden bg-foreground lg:block">
        <div className="flex h-12 w-full items-center bg-secondary">
          <span className="mx-4 line-clamp-2 text-lg font-bold">Detail</span>
        </div>
        <Detail />
      </div>
    </section>
  );
}

async function Seasons(props: {
  user: User | null;
  seasons: Season[];
  serie: Serie;
}) {
  const { user, seasons, serie } = props;

  const userId = user?.id;
  const serieId = serie.id.toString();

  const season_watched: SeriesAndSeasonsWatched | undefined =
    await getUserWatchedTVAndSeason(userId, serieId);
  const isLogged = user !== null;

  if (seasons[0] && seasons[0].season_number === 0) {
    const first = seasons.shift();
    if (first !== undefined) {
      seasons.push(first);
    }
  }

  // Single Season "card"
  function DisplaySeason(props: { season: Season }) {
    const { season } = props;
    const {
      id,
      episode_count,
      poster_path: season_poster,
      name: season_name,
      season_number,
    } = season;
    async function DBAddSeason() {
      "use server";

      await addEpisodeToSeasonWatched(userId!, serie, season, {
        episodeCount: episode_count,
        status: "COMPLETED",
        ended: new Date(),
      });
    }

    async function DBRemoveSeason() {
      "use server";

      await addEpisodeToSeasonWatched(userId!, serie, season, {
        episodeCount: -1,
        status: null,
        ended: null,
        started: null,
      });
    }

    const seasonId = id.toString();
    const season_w: DBSeasonWatchedType | undefined =
      season_watched?.seasons.find((s) => s.seasonId === seasonId);

    const hasWatched = season_w !== undefined;

    let grid_cols = 2;
    if (hasWatched) {
      if (season_w.status !== "COMPLETED" && season_w.status !== "PLANNING") {
        grid_cols = 3;
      }
    }

    async function test() {
      "use server";
      console.log("hello");
    }

    return (
      <div className="flex snap-center flex-col items-center">
        <div className="relative h-[130px] w-[90px] sm:h-[200px] sm:w-[150px]">
          <Image
            src={TMDB_IMAGE_URL(season_poster)}
            height={200}
            width={200}
            alt={season_name}
            className="h-full w-full"
          />
          <div className="absolute bottom-0 left-0 h-1/2 w-full bg-gradient-to-b from-transparent to-black"></div>
          <div className="absolute bottom-2 left-0 w-full">
            <p className="mx-2 flex justify-between sm:text-lg">
              <span>S{season_number}</span>
              <span>
                {hasWatched ? <span>{season_w.episodeWatched}/</span> : null}
                {episode_count}
              </span>
            </p>
          </div>
        </div>

        {/* Actions */}
        {isLogged ? (
          <div
            className={`grid h-8 w-full grid-cols-${grid_cols} grid-flow-col text-xs font-bold sm:h-10 sm:text-sm`}
          >
            {season_w?.status !== "COMPLETED" ? (
              <form action={DBAddSeason} className="col-span-1 h-full w-full">
                <button className="h-full w-full bg-primary text-black">
                  Add
                </button>
              </form>
            ) : null}
            {season_w && season_w.status !== "PLANNING" ? (
              <form
                action={DBRemoveSeason}
                className="col-span-1 h-full w-full"
              >
                <button className="h-full w-full bg-red-700 text-white">
                  Del
                </button>
              </form>
            ) : null}
            <EditSeason
              myButton={
                <button className="h-full w-full bg-secondary text-white">
                  Edit
                </button>
              }
            >
              <SeasonForm
                userId={userId!}
                serie={serie}
                season={season}
                addEpisode={addEpisodeToSeasonWatched}
                seasonWatch={season_w}
              />
            </EditSeason>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <section className="left-0 flex h-[250px] w-full flex-col border-x-0 border-y-2 border-secondary bg-foreground sm:h-[350px]">
      <div className="min-w-full basis-12 bg-secondary text-center">
        <div className="mx-auto grid h-full w-fit place-content-center">
          <span className="my-auto text-lg font-bold">Seasons</span>
        </div>
      </div>
      <div className="mx-2 mt-2 flex h-full w-full snap-x snap-proximity flex-row gap-4 overflow-x-scroll scroll-smooth bg-foreground pr-6 sm:mx-auto sm:mt-6 sm:w-3/4 sm:pr-0 md:gap-12">
        {seasons.map((season) => (
          <DisplaySeason key={season.id} season={season} />
        ))}
      </div>
    </section>
  );
}

async function Credits(props: { credits: Credits }) {
  const { credits } = props;

  return <ClientCredits credits={credits} />;
}

async function Reccomendation(props: { tvId: string }) {
  const { tvId } = props;

  const { results } = await queryTMDBTVRecomendation(tvId, 1);

  return (
    <section className="left-0 flex h-[250px] w-full flex-col border-y-2 border-secondary bg-foreground sm:h-[350px]">
      <div className="min-w-full basis-12 bg-secondary text-center">
        <div className="mx-auto grid h-full w-fit place-content-center">
          <span className="my-auto text-lg font-bold">Reccomendation</span>
        </div>
      </div>
      <div className="mx-2 mt-2 flex h-full w-full snap-x snap-proximity flex-row gap-4 overflow-x-scroll scroll-smooth bg-foreground pr-6 text-black sm:mx-auto sm:mt-6 sm:w-3/4 sm:pr-0 md:gap-12">
        {results.map((item) => {
          const { poster_path, id, name, media_type } = item;
          return (
            <div key={id}>
              <Link href={`${id}`}>
                <div className="relative h-[130px] w-[90px] sm:h-[200px] sm:w-[150px]">
                  <Image
                    src={TMDB_IMAGE_URL(poster_path)}
                    height={200}
                    width={200}
                    alt={name}
                    className="h-full w-full"
                  />
                  <div className="absolute bottom-0 left-0 h-1/2 w-full bg-gradient-to-b from-transparent to-black"></div>
                  <div className="absolute bottom-2 left-0 w-full text-xs font-semibold text-white sm:text-base">
                    <p>{name}</p>
                  </div>
                </div>
                <div>{media_type}</div>
              </Link>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default async function Page(props: { params: { tv_id: string } }) {
  const {
    params: { tv_id },
  } = props;

  const user = await getUser();
  const serie = await TVGetOrUpdateSerieData(tv_id);
  const { seasons, credits } = serie;

  return (
    <main className="my-6 w-screen space-y-6 overflow-x-hidden bg-background">
      <Detail user={user} serie={serie} />
      <Seasons user={user} seasons={seasons} serie={serie} />
      <Credits credits={credits} />
      <Reccomendation tvId={tv_id} />
    </main>
  );
}
