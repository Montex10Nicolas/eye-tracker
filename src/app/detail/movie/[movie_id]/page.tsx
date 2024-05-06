import Image from "next/image";
import { TMDB_IMAGE_URL, displayHumanDate } from "~/_utils/utils";
import { Badge } from "~/components/ui/badge";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Separator } from "~/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { GetMovieDetail } from "~/server/queries";
import { type Cast, type Crew, type MovieDetail } from "~/types/tmdb";
import {
  PersonSummaryCast,
  PersonSummaryCrew,
  RenderCastCrew,
} from "../../_components/Summary";

export default async function MovieDetail(props: {
  params: { movie_id: number };
}) {
  const id = props.params.movie_id;

  if (Number.isNaN(id)) {
    throw new Error("Not a number");
  }
  const movie = await GetMovieDetail(id);

  return (
    <main className="px-8 py-2">
      <Image
        src={TMDB_IMAGE_URL(movie.poster_path)}
        width={200}
        height={100}
        alt={`Poster ${movie.title}`}
      />
      <h2>{movie.title}</h2>
      <div>{movie.status}</div>
      <div>{displayHumanDate(movie.release_date)}</div>
      <div>{movie.overview}</div>
      <div>
        {movie.genres.map((genre) => {
          return <Badge key={genre.id}>{genre.name}</Badge>;
        })}
      </div>
      <div>
        {movie.vote_average.toFixed(1)} | {movie.vote_count}
      </div>
      <ScrollArea className="h-[500] w-full overflow-hidden">
        <Tabs defaultValue="cast" className="relative">
          <TabsList className="flex w-full flex-row">
            <TabsTrigger value="cast" className="w-full">
              Cast
            </TabsTrigger>
            <TabsTrigger value="crew" className="w-full">
              Crew
            </TabsTrigger>
          </TabsList>
          <TabsContent value="cast" className="mt-6">
            <RenderCastCrew persons={movie.credits.cast} cast={true} />
          </TabsContent>
          <TabsContent value="crew" className="mt-6">
            <RenderCastCrew persons={movie.credits.crew} cast={false} />
          </TabsContent>
        </Tabs>
      </ScrollArea>
      <Separator className="my-3" />
    </main>
  );
}
