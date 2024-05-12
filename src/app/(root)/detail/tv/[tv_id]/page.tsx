import Image from "next/image";
import { TMDB_IMAGE_URL } from "~/_utils/utils";
import { getUser } from "~/app/(user)/user_action";
import { GetTVDetail } from "~/server/queries";
import { type Season, type TVDetail, type User } from "~/types/tmdb_detail";
import { Buttons } from "../../_components/Buttons";
import Provider from "../../_components/Providers";
import { addSeasonToWatched } from "../../actions";

async function DisplayInfo(props: { tv: TVDetail }) {
  const { tv } = props;
  const back_url = tv.backdrop_path;
  const poster_url = tv.poster_path;

  return (
    <section className="relative flex flex-row gap-4 overflow-hidden rounded-md border border-white bg-transparent p-4 text-white">
      <div className="flex max-w-40 shrink-0 flex-col gap-2">
        <div className="min-w-[50%]">
          <Image
            src={TMDB_IMAGE_URL(poster_url)}
            width={150}
            height={150}
            alt={tv.name}
            priority
          />
          <div className="mt-2 grid w-full grid-flow-col gap-5 [&>*]:overflow-hidden [&>*]:rounded-md">
            <Provider id={tv.id} type="tv" />
          </div>
        </div>
      </div>

      <div className="">
        <div className="space-x-2">
          <span className="font-bold">{tv.name}</span>
          <span>|</span>
          <span className="italic text-slate-400">{tv.status}</span>
        </div>

        <div>
          <p>
            <span className="text-slate-300">Overview: </span> {tv.overview}
          </p>
        </div>
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
  seasons: Season[];
  user: User | null;
  tvId: string;
}) {
  const { seasons, user, tvId } = props;
  const loggedIn = user !== null;

  return (
    <div className="relative mt-4 flex flex-row flex-wrap gap-4 rounded-md bg-white p-4 text-black">
      {seasons.map((season) => {
        const seasonId = season.id.toString();
        return (
          <div
            key={season.id}
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
              <div className="flex w-full flex-row gap-2 p-1">
                <Buttons
                  addSeason={addSeasonToWatched}
                  season={season}
                  userId={user.id}
                  serieId={tvId}
                />
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

export default async function Page(props: { params: { tv_id: string } }) {
  const tv_id = props.params.tv_id;

  const tv = await GetTVDetail(tv_id);
  const user = await getUser();

  return (
    <div className="m-4 text-black">
      <DisplayInfo tv={tv} />
      <DisplaySeason seasons={tv.seasons} user={user} tvId={tv_id} />
    </div>
  );
}
