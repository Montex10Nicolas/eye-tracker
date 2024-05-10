import { revalidatePath } from "next/cache";
import Image from "next/image";
import {
  NOT_FOUND_POSTER,
  TMDB_IMAGE_URL,
  displayHumanDate,
} from "~/_utils/utils";
import { DisplayMovies } from "~/app/(root)/search/[query]/page";
import { getUser } from "~/app/(user)/action";
import { Badge } from "~/components/ui/badge";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Separator } from "~/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { GetMovieDetail, getMovieRecomendation } from "~/server/queries";
import Provider from "../../_components/Providers";
import { RenderCastCrew } from "../../_components/Summary";
import {
  addToMovieWatched,
  checkMovieWatched,
  removeFromMovieWatched,
} from "../../actions";

export default async function Page(props: { params: { movie_id: number } }) {
  const id = props.params.movie_id;

  const movie = await GetMovieDetail(id);
  const reccomendations = await getMovieRecomendation(id, 1);
  const user = await getUser();

  const isLogged = user !== null;
  let watched = false;
  if (isLogged) {
    watched = await checkMovieWatched(user.id, id.toString());
  }

  async function addMovie() {
    "use server";
    if (!user) {
      return "need to be logged in";
    }
    await addToMovieWatched(user?.id, movie, false);
    revalidatePath(`/detail/movie${movie.id}`);
  }

  async function removeMovie() {
    "use server";

    console.log("remove movie");

    if (!user) {
      console.log("no user");
      return "need to be logged in";
    }
    await removeFromMovieWatched(user?.id, movie);
    revalidatePath(`/detail/movie${movie.id}`);
  }

  if (Number.isNaN(id)) {
    throw new Error("Not a number");
  }
  let background_image = movie.backdrop_path ? movie.backdrop_path : null;
  if (background_image === null) background_image = NOT_FOUND_POSTER;

  return (
    <main className="p-4">
      <section className="relative overflow-hidden rounded-md border border-white bg-transparent p-4 text-white">
        <img
          src={TMDB_IMAGE_URL(background_image)}
          alt={`bakcground image ${movie.title}`}
          className="absolute left-0 top-0 z-[-1] h-full w-full object-cover opacity-45"
        />
        <div className="flex h-full flex-row gap-6">
          <div className="flex flex-col gap-2">
            <Image
              src={TMDB_IMAGE_URL(movie.poster_path)}
              width={300}
              height={300}
              alt={`Poster ${movie.title}`}
              className="min-w-28 shrink-0"
              priority={true}
            />
            <div className="flex flex-row justify-around gap-1 lg:sr-only">
              <Provider id={id} type="movie" width={100} height={100} />
            </div>
          </div>
          <div className="ml-2 flex h-full flex-col gap-6">
            <h2 className="flex flex-row gap-2">
              <span className="font-semibold">{movie.title}</span> |{" "}
              <span className="italic text-slate-400">
                {movie.status} {displayHumanDate(movie.release_date)}
              </span>
              <span className="semibold">
                {movie.adult ? "18+" : "everyone"}
              </span>
            </h2>
            <div>{movie.overview}</div>
            <div className="flex flex-row gap-1">
              {movie.genres.map((genre) => {
                return (
                  <Badge key={genre.id}>
                    <span className="text-md uppercase">{genre.name}</span>
                  </Badge>
                );
              })}
            </div>
            <div className="mb-2 mt-auto flex">
              <div className="space-x-2">
                Rating <span>{movie.vote_average.toFixed(1)}</span> with
                <span>{movie.vote_count}</span>
                votes
              </div>
              {isLogged ? (
                <div className="ml-auto">
                  <>
                    {!watched ? (
                      <form action={addMovie}>
                        <button
                          type="submit"
                          className="rounded-sm bg-sky-700 px-4 py-2 font-semibold uppercase"
                        >
                          add
                        </button>
                      </form>
                    ) : (
                      <div className="flex gap-2">
                        <form action={addMovie}>
                          <button
                            type="submit"
                            className="rounded-sm bg-sky-700 px-4 py-2 font-semibold uppercase"
                          >
                            rewatch
                          </button>
                        </form>
                        <form action={removeMovie}>
                          <button
                            type="submit"
                            className="rounded-sm bg-red-700 px-4 py-2 font-semibold uppercase"
                          >
                            remove
                          </button>
                        </form>
                      </div>
                    )}
                  </>
                </div>
              ) : null}
            </div>
            <div className="invisible absolute bottom-3 flex flex-row gap-4 lg:visible">
              <Provider id={id} type="movie" width={55} height={55} />
            </div>
          </div>
        </div>
      </section>
      <section>
        <Tabs
          defaultValue="cast"
          className="relative mt-4 rounded-md border bg-white p-4 text-black"
        >
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
              <RenderCastCrew cast={true} persons={movie.credits.cast} />
            </TabsContent>
            <TabsContent value="crew" className="mt-6">
              <RenderCastCrew cast={false} persons={movie.credits.crew} />
            </TabsContent>
          </ScrollArea>
        </Tabs>
        <Separator className="my-3" />
      </section>
      <section>
        <h2>Reccomendations</h2>
        <div className="flex flex-row flex-wrap gap-4 bg-white p-4 text-black">
          {/* <code>{JSON.stringify(reccomendations, null, 2)}</code> */}
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
      </section>
    </main>
  );
}
