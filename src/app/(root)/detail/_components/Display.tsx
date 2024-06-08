import Image from "next/image";
import Link from "next/link";
import {
  TMDB_IMAGE_URL,
  displayHumanDate,
  numberToGender,
} from "~/_utils/utils";
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

export function DisplayTV(props: {
  result: TVResultType;
  background_url: string;
}) {
  const { result: found, background_url } = props;
  return (
    <Link href={`/detail/tv/${found.id}`} className="h-full w-full">
      <div className="">
        <div className="relative h-full overflow-hidden">
          <Image
            src={TMDB_IMAGE_URL(background_url)}
            width={200}
            height={100}
            alt={`Poster ${found.name}`}
            className="h-[200px] w-[150px] duration-300 ease-in-out hover:scale-125"
          />
          <div className="absolute right-1 top-1 rounded-sm bg-white px-2 py-1 font-semibold uppercase text-black">
            TV
          </div>
        </div>
        <div className="">
          <div className="font-semibold">{found.name}</div>
          <div className="flex justify-between">
            <code>{displayHumanDate(found.first_air_date ?? null)}</code>
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
      <div className="">
        <div className="overflow-hidden">
          <Image
            src={TMDB_IMAGE_URL(background_url)}
            width={200}
            height={300}
            alt={`Poster ${person.name}`}
            className="h-[200px] w-[150px] duration-300 ease-in-out hover:scale-125"
          />
        </div>
        <div className="">
          <div className="">{person.name}</div>
          <div className="">
            <span>{numberToGender(person.gender)}</span>
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
      <div className="">
        <div className="relative overflow-hidden">
          <Image
            src={TMDB_IMAGE_URL(background_url)}
            width={500}
            height={300}
            alt={`Poster ${found.title}`}
            className="h-[200px] w-[150px] duration-300 ease-in-out hover:scale-125"
          />
          <div className="absolute right-1 top-1 rounded-sm bg-white px-2 py-1 font-semibold uppercase text-black">
            Movie
          </div>
        </div>
        <div className="space-y-2">
          <div className="font-bold">{found.title}</div>
          <p className="">{displayHumanDate(found.release_date)}</p>
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
      <h1 className="text-xl font-semibold">Credits:</h1>
      <hr className="h-2 w-full bg-black fill-black" />

      <Tabs defaultValue="cast" className="relative mt-6 w-full">
        <TabsList className="flex w-full flex-row bg-black">
          <TabsTrigger value="cast" className="w-full">
            Cast
          </TabsTrigger>
          <TabsTrigger value="crew" className="w-full">
            Crew
          </TabsTrigger>
        </TabsList>
        <ScrollArea className="h-[500px] w-full">
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
