import { revalidatePath } from "next/cache";
import Image from "next/image";
import { TMDB_IMAGE_URL, displayHumanDate } from "~/_utils/utils";
import { getUser } from "~/app/(user)/user_action";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Separator } from "~/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { GetMovieDetail, getMovieRecomendation } from "~/server/queries";
import { type MovieDetail, type Serie, type User } from "~/types/tmdb_detail";
import { DisplayGenres, DisplayMovies } from "../../_components/Display";
import Provider from "../../_components/Providers";
import { DisplayCastCrew } from "../../_components/Summary";
import {
  addToMovieWatched,
  checkMovieWatched,
  removeFromMovieWatched,
} from "../../actions";

async function DisplayInfo(props: { movie: MovieDetail; user: User | null }) {
  const { movie, user } = props;
  const background_url = movie.backdrop_path;
  const isLogged = user !== null;

  let watched = false;
  if (isLogged) {
    watched = await checkMovieWatched(user.id, movie.id.toString());
  }

  async function addMovie() {
    "use server";

    if (!user) {
      return "need to be logged in";
    }
    await addToMovieWatched(user.id, movie, false);
    revalidatePath(`/detail/movie${movie.id}`);
  }

  async function removeMovie() {
    "use server";

    if (!user) {
      return "need to be logged in";
    }
    await removeFromMovieWatched(user.id, movie);
    revalidatePath(`/detail/movie${movie.id}`);
  }
  return (
    <section className="relative flex flex-row gap-4 overflow-hidden rounded-md border border-white bg-transparent p-4 text-white">
      <div className="flex max-w-40 shrink-0 flex-col gap-2">
        <div className="min-w-[50%]">
          <Image
            src={TMDB_IMAGE_URL(movie.poster_path)}
            width={130}
            height={130}
            alt={`Poster ${movie.title}`}
            priority
            className="w-full object-cover"
          />
          <div className="flex  gap-2 p-1 [&>*]:overflow-hidden">
            <Provider id={movie.id} type="movie" />
          </div>
        </div>
      </div>

      <div className="flex flex-col">
        <div className="space-x-2">
          <span className="font-bold">{movie.title}</span>
          <span>|</span>
          <span className="italic text-slate-400">{movie.status}</span>
        </div>

        <div className="flex flex-col flex-wrap gap-1">
          <div>
            <div className="flex flex-row gap-2 italic text-slate-300">
              <span>Language(s):</span>
              <div>
                {movie.spoken_languages.map((lang, index) => (
                  <span key={lang.iso_639_1}>
                    {index > 0 ? "-" : ""}
                    {lang.english_name}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <p>
            <span className="italic text-slate-300">Runtime: </span>
            <span>{movie.runtime}</span>m
          </p>
          <p className="">
            <span className="italic text-slate-300">Released: </span>
            <span>{displayHumanDate(movie.release_date)}</span>
          </p>
          <div>
            <DisplayGenres genres={movie.genres} />
          </div>
        </div>
        <p className="mb-4 mt-auto">
          <span className=" text-slate-300">Overview: </span> {movie.overview}
        </p>
        <form className="flex flex-row items-center justify-around gap-4">
          {!watched ? (
            <button
              className="uppser w-full rounded-sm bg-green-700 px-4 py-2
          font-semibold uppercase"
              formAction={addMovie}
            >
              Add
            </button>
          ) : (
            <>
              <button
                className="uppser w-full rounded-sm bg-green-700 px-4 py-2
          font-semibold uppercase"
                formAction={addMovie}
              >
                rewatch
              </button>
              <button
                className="uppser w-full rounded-sm bg-red-700 px-4 py-2
          font-semibold uppercase"
                formAction={removeMovie}
              >
                remove
              </button>
            </>
          )}
        </form>
      </div>

      <img
        src={TMDB_IMAGE_URL(background_url)}
        alt={movie.title}
        className="absolute left-0 top-0 -z-10 h-full w-full object-cover opacity-40"
      />
    </section>
  );
}

async function DisplayCredits(props: { movie: MovieDetail }) {
  const { movie } = props;
  return (
    <section className="mt-4 rounded-md border bg-white p-4 text-black">
      <Tabs defaultValue="cast" className="relative">
        <h1 className="text-xl font-semibold">Credits</h1>
        <TabsList className="mt-2 flex w-full flex-row border bg-black">
          <TabsTrigger value="cast" className="w-full uppercase">
            <span>cast</span>
          </TabsTrigger>
          <TabsTrigger value="crew" className="w-full uppercase">
            <span>crew</span>
          </TabsTrigger>
        </TabsList>
        <ScrollArea className="h-[500] w-full overflow-hidden pt-2">
          <TabsContent value="cast" className="mt-6">
            <DisplayCastCrew cast={true} persons={movie.credits.cast} />
          </TabsContent>
          <TabsContent value="crew" className="mt-6">
            <DisplayCastCrew cast={false} persons={movie.credits.crew} />
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </section>
  );
}

async function DisplayReccomendation(props: { movie: MovieDetail }) {
  const { movie } = props;
  const id = movie.id;
  const reccomendations = await getMovieRecomendation(id, 1);
  return (
    <section className="my-6 flex-col rounded-md bg-white p-4 text-black">
      <h1 className="text-xl font-semibold">
        Movie similar to
        <span className="ml-1 italic">&quot;{movie.title}&quot;</span>
      </h1>
      <ScrollArea className="h-[500px] w-full overflow-hidden pt-2">
        <div className="mt-6 flex flex-row flex-wrap justify-between gap-4">
          {reccomendations.results.map((tv_reccomend) => {
            return (
              <DisplayMovies
                key={tv_reccomend.id}
                result={tv_reccomend}
                background_url={tv_reccomend.backdrop_path}
              />
            );
          })}
        </div>
      </ScrollArea>
    </section>
  );
}

export default async function Page(props: { params: { movie_id: number } }) {
  const id = props.params.movie_id;

  const movie = await GetMovieDetail(id);
  const user = await getUser();

  if (Number.isNaN(id)) {
    throw new Error("Not a number");
  }

  return (
    <main className="mx-auto w-[80%]">
      <DisplayInfo movie={movie} user={user} />
      <DisplayCredits movie={movie} />
      <DisplayReccomendation movie={movie} />
    </main>
  );
}
