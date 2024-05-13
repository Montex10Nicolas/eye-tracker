import Image from "next/image";
import Link from "next/link";
import { TMDB_IMAGE_URL, displayHumanDate } from "~/_utils/utils";
import { Badge } from "~/components/ui/badge";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import {
  type Credits,
  type Genre,
  type MovieResultType,
  type PersonSearchType,
  type TVResultType,
} from "~/types/tmdb_detail";
import { DisplayCastCrew } from "./Summary";

function convertGender(gender: number) {
  switch (gender) {
    case 0:
      return "Male";
    case 1:
      return "Female";
    default:
      return "Not known";
  }
}

export function DisplayTV(props: {
  result: TVResultType;
  background_url: string;
}) {
  const { result: found, background_url } = props;
  return (
    <Link href={`/detail/tv/${found.id}`}>
      <div className="max-w-[200px] cursor-pointer overflow-hidden bg-sky-600 hover:border-yellow-600">
        <Image
          src={TMDB_IMAGE_URL(background_url)}
          width={500}
          height={300}
          alt={`Poster ${found.name}`}
          className="image min-h-[300px] min-w-[200px] overflow-hidden rounded-b-3xl object-cover transition-all duration-200 ease-in-out hover:relative hover:top-[-16px] hover:scale-110"
        />
        <div className="p-2">
          <div>{found.name}</div>
          <div className="flex justify-between">
            <span>First episode: {displayHumanDate(found.first_air_date)}</span>
            <span>{found.origin_country}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function DisplayPerson(props: {
  result: PersonSearchType;
  background_url: string;
}) {
  const { result: person, background_url } = props;

  return (
    <Link href={`/detail/person/${person.id}`}>
      <div className="max-w-[200px] cursor-pointer overflow-hidden bg-sky-600">
        <Image
          src={TMDB_IMAGE_URL(background_url)}
          width={200}
          height={300}
          alt={`Poster ${person.name}`}
          className="image object-fit min-h-[300px] min-w-[200px] overflow-hidden rounded-b-3xl transition-all duration-200 ease-in-out hover:relative hover:top-[-16px] hover:scale-110"
        />
        <div className="z-10 overflow-hidden p-2">
          <div>{person.name}</div>
          <div className="flex justify-between">
            <span>{convertGender(person.gender)}</span>
            <span>{person.known_for_department}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function DisplayMovies(props: {
  result: MovieResultType;
  background_url: string;
}) {
  const { result: found, background_url } = props;
  return (
    <Link href={`/detail/movie/${found.id}`}>
      <div className="min-h-[300px] max-w-[200px] cursor-pointer overflow-hidden bg-sky-600 hover:border-yellow-600 ">
        <Image
          src={TMDB_IMAGE_URL(background_url)}
          width={500}
          height={300}
          alt={`Poster ${found.title}`}
          className="image min-h-[300px] min-w-[200px] overflow-hidden rounded-b-3xl object-cover transition-all duration-200 ease-in-out hover:relative hover:top-[-16px] hover:scale-110"
        />
        <div className="p-2">
          <div>{found.title}</div>
          <div className="flex justify-between">
            <span>Released in: {displayHumanDate(found.release_date)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function DisplayCredits(props: { credits: Credits }) {
  const {
    credits: { cast, crew },
  } = props;
  const hasCast = cast.length > 0,
    hasCrew = crew.length > 0;
  return (
    <section className="mt-4 flex flex-col rounded-md bg-white p-4 text-black">
      <h1 className="">Credits</h1>
      <hr className="mb-4" />
      <Tabs defaultValue="cast" className="relative mt-6 w-full">
        <TabsList className="flex w-full flex-row bg-black">
          <TabsTrigger value="cast" className="w-full">
            Cast
          </TabsTrigger>
          <TabsTrigger value="crew" className="w-full">
            Crew
          </TabsTrigger>
        </TabsList>
        <ScrollArea className="h-[500] w-full">
          <TabsContent value="cast" className="mt-6">
            {hasCast ? (
              <DisplayCastCrew persons={cast} cast={true} />
            ) : (
              <div>No info about this cast</div>
            )}
          </TabsContent>
          <TabsContent value="crew" className="mt-6">
            {hasCrew ? (
              <DisplayCastCrew persons={crew} cast={false} />
            ) : (
              <div>No info about this crew</div>
            )}
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </section>
  );
}

export function DisplayGenres(props: { genres: Genre[] }) {
  const { genres } = props;
  return (
    <div className="flex gap-2 text-center">
      {genres.map((genre) => {
        return <Badge key={genre.id}>{genre.name}</Badge>;
      })}
    </div>
  );
}
