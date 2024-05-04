import Image from "next/image";
import { TMDB_IMAGE_URL, displayHumanDate } from "~/_utils/utils";
import { Badge } from "~/components/ui/badge";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Separator } from "~/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { GetMovieDetail } from "~/server/queries";
import { type Cast, type Crew, type MovieDetail } from "~/types/tmdb";
import PersonSummary from "../../_components/Summary";

function RenderCastCrew(props: { persons: Crew[] | Cast[] }) {
  return (
    <div className="flex flex-row flex-wrap gap-4">
      {props.persons.map((person) => {
        return <PersonSummary key={person.id} person={person} />;
      })}
    </div>
  );
}

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
            <RenderCastCrew persons={movie.credits.cast} />
          </TabsContent>
          <TabsContent value="crew" className="mt-6">
            <RenderCastCrew persons={movie.credits.crew} />
          </TabsContent>
        </Tabs>
      </ScrollArea>
      <Separator className="my-3" />
    </main>
  );
}

function bho() {
  const movie: MovieDetail = {};
  return (
    <div>
      {movie.images.logos.map((image, idx) => {
        return (
          <div key={image.file_path + idx}>
            <p>
              Logos {image.width} {image.height} {image.aspect_ratio}{" "}
              {image.iso_639_1}
            </p>
            <Image
              src={`${TMDB_IMAGE_URL(image.file_path)}`}
              width={image.width}
              height={image.height}
              alt={image.file_path}
            />
          </div>
        );
      })}
      {movie.images.backdrops.map((image, idx) => {
        return (
          <>
            <p>
              Backdrops {image.width} {image.height} {image.aspect_ratio}{" "}
              {image.iso_639_1}
            </p>
            <Image
              key={image.file_path + idx}
              src={`${TMDB_IMAGE_URL(image.file_path)}`}
              width={image.width}
              height={image.height}
              alt={image.file_path}
            />
          </>
        );
      })}
      {movie.images.posters.map((image, idx) => {
        return (
          <div key={image.file_path + idx}>
            <p>
              Poster {image.width} {image.height} {image.aspect_ratio}{" "}
              {image.iso_639_1}
            </p>
            <Image
              src={`${TMDB_IMAGE_URL(image.file_path)}`}
              width={image.width}
              height={image.height}
              alt={image.file_path}
            />
          </div>
        );
      })}
    </div>
  );
}
