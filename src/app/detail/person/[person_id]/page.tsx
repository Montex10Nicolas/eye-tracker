import Image from "next/image";
import Link from "next/link";
import { DateDiff, TMDB_IMAGE_URL, displayHumanDate } from "~/_utils/utils";
import { GetPersonDetail } from "~/server/queries";
import {
  type MovieCredits,
  type PersonsCast,
  type PersonsCrew,
  type TvCredits,
} from "~/types/tmdb";

function mergeCredits(movie: MovieCredits, tv: TvCredits): PersonsCast[] {
  const all = [...movie.cast, ...movie.crew, ...tv.cast, ...tv.crew];

  const merged = all.sort((a, b) => {
    let date_a: Date = new Date(),
      date_b: Date = new Date();

    if (a.release_date === undefined && a.first_air_date !== undefined) {
      date_a = new Date(a.first_air_date);
    } else if (a.release_date !== undefined && a.first_air_date === undefined) {
      date_a = new Date(a.release_date);
    }
    if (b.release_date === undefined && b.first_air_date !== undefined) {
      date_b = new Date(b.first_air_date);
    } else if (b.release_date !== undefined && b.first_air_date === undefined) {
      date_b = new Date(b.release_date);
    }

    return date_b.getTime() - date_a.getTime();
  });

  if (merged[0] === undefined) {
    return merged;
  }

  const final: PersonsCast[] = [merged[0]];
  for (let i = 1; i < merged.length; i++) {
    if (merged[i] === undefined || merged[i - 1] === undefined) continue;
    if (merged[i]?.id === merged[i - 1]?.id) {
      continue;
    }

    final.push(merged[i]);
  }

  return final;
}

export default async function PersonDetail(props: {
  params: { person_id: number };
}) {
  const person = await GetPersonDetail(props.params.person_id);

  const credits = mergeCredits(person.movie_credits, person.tv_credits);

  return (
    <div className="m-4">
      <div className="flex flex-row gap-4">
        <Image
          className="max-h-[300] shrink-0"
          src={`${TMDB_IMAGE_URL(person.profile_path)}`}
          alt={`Profile ${person.name}`}
          width={200}
          height={300}
        />
        <div className="w-full shrink rounded-md bg-white p-4 text-xl text-black">
          <div>{person.name}</div>
          <div>
            {displayHumanDate(person.birthday)}
            {person.deathday === null ? (
              <span className="ml-2">
                {DateDiff.inYears(new Date(person.birthday), new Date())}yo
              </span>
            ) : (
              displayHumanDate(person.deathday)
            )}
          </div>
          <div>{person.biography}</div>
        </div>
      </div>
      <div className="my-6 rounded-md bg-white p-4 text-black">
        <div className="flex flex-row flex-wrap gap-4">
          {credits.map((cred) => {
            const movie = cred.release_date !== undefined;
            return (
              <Link
                key={cred.id}
                href={
                  movie ? `/detail/movie/${cred.id}` : `/detail/tv/${cred.id}`
                }
              >
                <div className="border-red flex max-w-[150px] flex-col flex-wrap border p-2">
                  <Image
                    src={TMDB_IMAGE_URL(cred.poster_path)}
                    width={150}
                    height={200}
                    alt={`${cred.original_title}`}
                  />

                  <div className="max-w flex flex-col flex-wrap">
                    <span>
                      {cred.title ?? cred.title} {cred.name ?? cred.name} {"\n"}
                      {cred.character}
                    </span>
                    <div className="flex justify-between">
                      <span>
                        {cred.release_date ??
                          displayHumanDate(cred.release_date)}
                        {cred.first_air_date ??
                          displayHumanDate(cred.first_air_date)}
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
    </div>
  );
}
