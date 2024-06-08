import { type User } from "lucia";
import Image from "next/image";
import Link from "next/link";
import {
  TMDB_IMAGE_URL,
  convertMinute,
  displayHumanDate,
} from "~/_utils/utils";
import { db } from "~/server/db";
import {
  getUser,
  myInfo,
  myLatestSeries,
  myWatchedMovie,
} from "../user_action";
import { LoginRedirect } from "./_components/Client";
import { RadarGraph } from "./_components/SummaryGraph";

async function Summary(props: { user: User }) {
  const { user } = props;
  const dbUser = await db.query.userTable.findFirst({
    where: (us, { eq }) => eq(us.id, user.id),
  });

  if (dbUser === undefined) return null;
  const { username, createatedAt } = dbUser;

  return (
    <section className="mx-auto mt-8 h-[300px] w-[90%] bg-slate-800 sm:mx-0 sm:ml-8 sm:h-[600px] sm:w-[400px]">
      <div className="min-h-[150px] w-[150px] bg-sky-500 sm:min-h-[400px] sm:min-w-full"></div>
      <hr className="my-2" />
      <div className="space-y-3 p-4">
        <h1 className="text-3xl font-bold">{username}</h1>
        <h3>
          <span className="text-lg font-semibold">Joined: </span>
          <span className="text-lg">
            {displayHumanDate(createatedAt!.toLocaleDateString())}
          </span>
        </h3>
      </div>
    </section>
  );
}

async function List(props: { userId: string }) {
  const { userId } = props;

  const series = await myLatestSeries(userId, 10);

  return (
    <section className="h-fit">
      {series.map((serie) => {
        const serieData = serie.serie.serie_data;
        const { poster_path, name } = serieData;
        const updateAt = serie.updatedAt;

        return (
          <Link
            className="h-[80px]"
            href={`/detail/tv/${serie.serieId}`}
            key={serie.id}
          >
            <div
              key={serie.id}
              className="flex flex-row hover:border-2 hover:border-white hover:p-2 sm:hover:border-0 sm:hover:p-0"
            >
              <div className="h-[80px] w-[75px] overflow-hidden">
                <Image
                  src={TMDB_IMAGE_URL(poster_path)}
                  alt={name}
                  width={100}
                  height={100}
                  className="h-full w-full p-1 sm:hover:scale-125"
                />
              </div>
              <div className="mx-2 flex w-full flex-col">
                <p>{name}</p>
                <div className="bottom-0 mb-4 mt-auto flex justify-between">
                  <p>{updateAt.toLocaleDateString()}</p>
                  <p className="lowercase">{serie.status}</p>
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </section>
  );
}

async function Stats(props: { user: User }) {
  const { user } = props;
  const userId = user.id;
  const info = await myInfo(userId);
  if (info === undefined) {
    return (
      <section>
        <h1>For some reason you don&apos;t have info</h1>
      </section>
    );
  }
  const { tvDurationTotal, movieDurationTotal } = info;
  const [months, days, hours, minutes] = convertMinute(
    tvDurationTotal + movieDurationTotal,
  );

  function TotalRuntime() {
    return (
      <div className="space-x-1 bg-red-500">
        {months !== 0 ? <span>{months}M</span> : null}
        {days !== 0 ? <span>{days}D</span> : null}
        {hours !== 0 ? <span>{hours}H</span> : null}
        {minutes !== 0 ? <span>{minutes}m</span> : null}
      </div>
    );
  }

  return (
    <section className="mx-auto mt-8 flex w-[90%] flex-col gap-4 sm:mx-0 sm:w-[800px] sm:flex-row">
      <div className="bg-sky-600 p-8 text-center text-3xl">
        <TotalRuntime />
        <RadarGraph info={info} />
      </div>
      <div>
        <List userId={userId} />
      </div>
    </section>
  );
}

export default async function Page() {
  const user = await getUser();

  if (user === null) {
    return (
      <main className="flex h-screen w-screen items-center justify-center">
        <div className="-mt-40 h-[50%] w-[90%] rounded-sm bg-white text-black">
          <p className="space-x-2 p-8 text-center text-3xl">
            You need an account to access this area, you will be redirected in
          </p>
          <div className="text-center text-6xl">
            <LoginRedirect time={3} />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="mb-8 flex flex-col gap-4 sm:flex-row">
      <Summary user={user} />

      <div>
        <Stats user={user} />
      </div>
    </main>
  );
}
