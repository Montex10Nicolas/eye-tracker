import Image from "next/image";
import {
  NOT_FOUND_POSTER,
  TMDB_IMAGE_URL,
  displayHumanDate,
} from "~/_utils/utils";
import { Badge } from "~/components/ui/badge";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Separator } from "~/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { GetMovieDetail } from "~/server/queries";
import { type MovieDetail } from "~/types/tmdb";
import Provider from "../../_components/Providers";
import { RenderCastCrew } from "../../_components/Summary";

export default async function MovieDetail(props: {
  params: { movie_id: number };
}) {
  const id = props.params.movie_id;

  if (Number.isNaN(id)) {
    throw new Error("Not a number");
  }
  const movie = await GetMovieDetail(id);
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
        <div className="flex flex-row">
          <div className="flex flex-col gap-2">
            <Image
              src={TMDB_IMAGE_URL(movie.poster_path)}
              width={300}
              height={300}
              alt={`Poster ${movie.title}`}
              className="w-[250px] shrink-0"
            />
            <Provider id={id} type="movie" />
          </div>
          <div className="ml-2 flex h-full flex-col gap-2">
            <h2 className="flex flex-row gap-2">
              <span className="font-semibold">{movie.title}</span> |{" "}
              <span className="italic text-slate-400">
                {movie.status} {displayHumanDate(movie.release_date)}
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
            <div className="mt-auto">
              Rating {movie.vote_average.toFixed(1)} with {movie.vote_count}{" "}
              votes
            </div>
          </div>
        </div>
      </section>
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
            <RenderCastCrew persons={movie.credits.cast} cast={true} />
          </TabsContent>
          <TabsContent value="crew" className="mt-6">
            <RenderCastCrew persons={movie.credits.crew} cast={false} />
          </TabsContent>
        </ScrollArea>
      </Tabs>
      <Separator className="my-3" />
    </main>
  );
}
