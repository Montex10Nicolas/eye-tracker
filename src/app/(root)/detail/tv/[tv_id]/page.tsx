import { type User } from "lucia";
import Image from "next/image";
import { TMDB_IMAGE_URL, displayHumanDate } from "~/_utils/utils";
import { getUser } from "~/app/(user)/user_action";
import { Credits, type Season, type Serie } from "~/types/tmdb_detail";
import { TVGetOrUpdateSerieData } from "./_actions/tv_actions";
import { ClientCredits } from "./_components/Client";

async function Detail(props: { user: User | null; serie: Serie }) {
  const { user, serie } = props;

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

  function Thing(props: { title: string; children: React.ReactNode }) {
    const { title, children } = props;

    return (
      <div>
        <span className="font-semibold">{title}</span>
        <span className="space-x-1 capitalize">{children}</span>
      </div>
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
            <button className="mt-4 hidden w-full rounded-sm bg-primary py-3 text-sm sm:px-8 sm:text-base lg:block">
              <span>Add to list</span>
            </button>
          </div>
          <div className="mx-6 my-3 text-xs sm:mb-0 sm:mr-8 sm:text-base">
            <div className="hidden sm:block">{overview}</div>
            <hr className="mx-auto h-1 w-11/12 bg-primary sm:w-full " />

            {/* Detail on Mobile */}
            <div className="lg:hidden">
              <div className="mb-3">
                <button className="mt-4 w-2/5 rounded-sm bg-primary px-4 py-1 text-base ">
                  <span>Add to list</span>
                </button>
              </div>
              <Thing title="Name: ">{name}</Thing>
              <Thing title="Status: ">{status}</Thing>
              <Thing title="Episode: ">{number_of_episodes}</Thing>
              <Thing title="Seasons: ">{number_of_seasons}</Thing>
              <Thing title="Runtime: ">
                {episode_run_time.length > 0 ? (
                  episode_run_time.map((el) => <span key={el}>{el}</span>)
                ) : (
                  <span className="text-red-600">uknown</span>
                )}
              </Thing>
              <Thing title="Air time: ">
                {displayHumanDate(first_air_date)}-
                {displayHumanDate(last_air_date)}
              </Thing>
            </div>

            {/* Detail for Desktop and Mobile */}
            <div className="">
              <Thing title="Native name: ">{original_name}</Thing>
              <Thing title="Country of origin: ">
                {origin_country.length > 0 ? (
                  origin_country.map((el) => <span key={el}>{el}</span>)
                ) : (
                  <span>Unknown</span>
                )}
              </Thing>
              <Thing title="Genres: ">
                {genres.map((el, idx) => (
                  <span key={el.id}>
                    {el.name}
                    {idx != genres.length - 1 ? ", " : ""}
                  </span>
                ))}
              </Thing>
              <Thing title="Keywords: ">
                {keywords.results.map((el, idx) => (
                  <span key={el.id}>
                    {el.name}
                    {idx != keywords.results.length - 1 ? "," : ""}
                  </span>
                ))}
              </Thing>
              <Thing title={`Language${languages.length > 1 ? "s" : ""}: `}>
                {languages.map((el, idx) => (
                  <span className="uppercase" key={el}>
                    {el}
                    {idx !== languages.length - 1 ? "," : ""}
                  </span>
                ))}
              </Thing>
              <Thing title="Networks: ">
                {networks.map((el, idx) => (
                  <span key={el.id}>
                    {el.name}
                    {idx != networks.length - 1 ? "," : ""}
                  </span>
                ))}
              </Thing>
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
        <Thing title="Name: ">{name}</Thing>
        <Thing title="Status: ">{status}</Thing>
        <Thing title="Episode: ">{number_of_episodes}</Thing>
        <Thing title="Seasons: ">{number_of_seasons}</Thing>
        <Thing title="Runtime: ">{runtime}</Thing>
        <Thing title="Total runtime: ">{runtime * number_of_episodes}</Thing>
        <Thing title="Air time: ">
          {displayHumanDate(first_air_date)}-{displayHumanDate(last_air_date)}
        </Thing>
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

async function Seasons(props: { user: User | null; seasons: Season[] }) {
  const { user, seasons } = props;

  if (seasons[0] && seasons[0].season_number === 0) {
    const first = seasons.shift();
    if (first !== undefined) {
      seasons.push(first);
    }
  }

  // Single Season "card"
  function DispalySeason(props: { season: Season }) {
    const {
      season: {
        episode_count,
        poster_path: season_poster,
        name: season_name,
        season_number,
      },
    } = props;

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
              <span>{episode_count}</span>
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="grid h-8 w-full grid-cols-3 text-xs font-bold sm:h-10 sm:text-sm">
          <form action="" className="h-full w-full">
            <button className="h-full w-full bg-primary text-black">Add</button>
          </form>
          <form action="" className="h-full w-full">
            <button className="h-full w-full bg-secondary text-white">
              Edit
            </button>
          </form>
          <form action="" className="h-full w-full">
            <button className="h-full w-full bg-red-700 text-white">Del</button>
          </form>
        </div>
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
          <DispalySeason key={season.id} season={season} />
        ))}
      </div>
    </section>
  );
}

async function Credits(props: { credits: Credits }) {
  const { credits } = props;

  return <ClientCredits credits={credits} />;
}

async function Reccomendation() {
  return (
    <section className="left-0 flex h-[250px] w-full flex-col border-y-2 border-secondary bg-foreground sm:h-[350px]">
      <div className="min-w-full basis-12 bg-secondary text-center">
        <div className="mx-auto grid h-full w-fit place-content-center">
          <span className="my-auto text-lg font-bold">Reccomendation</span>
        </div>
      </div>
      <div className="mx-auto h-full w-full bg-foreground outline outline-red-400 sm:w-3/4"></div>
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
    <main className="my-6 w-screen space-y-6 overflow-hidden bg-background">
      <Detail user={user} serie={serie} />
      <Seasons user={user} seasons={seasons} />
      <Credits credits={credits} />
      <Reccomendation />
    </main>
  );
}
