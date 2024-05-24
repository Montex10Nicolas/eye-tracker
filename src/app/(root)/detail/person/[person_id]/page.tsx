import Image from "next/image";
import Link from "next/link";
import {
  NOT_FOUND_POSTER,
  TMDB_IMAGE_URL,
  ageCalculator,
  displayHumanDate,
} from "~/_utils/utils";
import { queryTMDBPersonDetail } from "~/server/queries";
import {
  type MovieCredits,
  type PersonsCast,
  type TvCredits,
} from "~/types/tmdb_detail";

function mergeCredits(movie: MovieCredits, tv: TvCredits): PersonsCast[] {
  const all = [...movie.cast, ...movie.crew, ...tv.cast, ...tv.crew];

  if (all[0] === undefined) return all;
  const removed_duplicate = [all[0]];
  for (let i = 1; i < all.length; i++) {
    const new_item = all[i];

    if (new_item === undefined) continue;

    const found = removed_duplicate.find((a) => {
      if (a.id === new_item.id) return a;
    });
    if (found === undefined) {
      removed_duplicate.push(new_item);
    }
  }

  // Check the data using the movie or tv proprierty
  function getData(person: PersonsCast) {
    return person.first_air_date
      ? new Date(person.first_air_date)
      : person.release_date
        ? new Date(person.release_date)
        : new Date();
  }

  const sorted = removed_duplicate.sort((a, b) => {
    const date_a: Date = getData(a),
      date_b: Date = getData(b);

    return date_b.getTime() - date_a.getTime();
  });

  return sorted;
}

export default async function PersonDetail(props: {
  params: { person_id: number };
}) {
  const person = await queryTMDBPersonDetail(props.params.person_id);
  const credits = mergeCredits(person.movie_credits, person.tv_credits);

  return (
    <div className="m-4">
      <div className="flex flex-row gap-4">
        <Image
          className="max-h-[300px] shrink-0"
          src={`${TMDB_IMAGE_URL(person.profile_path)}`}
          alt={`Profile ${person.name}`}
          width={200}
          height={300}
        />
        <div className="w-full shrink rounded-md bg-white p-4 text-xl text-black">
          <div>{person.name}</div>
          <div>
            {displayHumanDate(person.birthday)}
            <span className="ml-2">
              {person.deathday === null
                ? ageCalculator(new Date(person.birthday), new Date())
                : displayHumanDate(person.deathday)}
            </span>
          </div>
          <div>{person.biography}</div>
        </div>
      </div>
      <div className="my-6 flex flex-row flex-wrap items-stretch gap-4 rounded-md bg-white p-4 text-base text-black">
        {credits.map((cred) => {
          const movie = cred.release_date !== undefined;
          const url_image = cred.poster_path
            ? TMDB_IMAGE_URL(cred.poster_path)
            : NOT_FOUND_POSTER;

          return (
            <Link
              key={cred.id}
              href={
                movie ? `/detail/movie/${cred.id}` : `/detail/tv/${cred.id}`
              }
            >
              <div className="border-red flex h-full max-w-48 cursor-pointer flex-col border p-2">
                <Image
                  src={url_image}
                  width={192}
                  height={250}
                  alt={`${cred.original_title}`}
                  className="min-h-[250px]"
                />
                <div className="font-bold">
                  {cred.title ?? cred.title} {cred.name ?? cred.name} {"\n"}
                </div>
                <div className="max-w bottom-0 flex flex-col">
                  <span>{cred.character}</span>
                  <div className="flex justify-between">
                    <span>
                      {cred.release_date !== undefined
                        ? displayHumanDate(cred.release_date)
                        : cred.first_air_date !== undefined
                          ? displayHumanDate(cred.first_air_date)
                          : null}
                    </span>
                    <span>{cred.vote_average.toFixed(1)}</span>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
