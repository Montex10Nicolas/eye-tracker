import Image from "next/image";
import Link from "next/link";
import { MISSING_PERSON, TMDB_IMAGE_URL } from "~/_utils/utils";
import { type Cast, type Crew } from "~/types/tmdb_detail";

export function PersonSummaryCast(props: { person: Cast }) {
  const { person } = props;
  let person_url = person.profile_path ? person.profile_path : null;
  if (person_url === null) person_url = MISSING_PERSON;

  return (
    <Link
      href={`/detail/person/${person.id}`}
      className="flex-flex-col h-full w-32 items-center justify-center"
    >
      <Image
        src={TMDB_IMAGE_URL(person_url)}
        width={100}
        height={300}
        alt={`${person.name}`}
        className=""
      />
      <div className="mt-auto">
        <span className="font-semibold">{person.name}</span>
        {person.name !== person.original_name ? (
          <span>{person.original_name}</span>
        ) : null}
        <div className="italic">{person.character ?? person.character}</div>
      </div>
    </Link>
  );
}

export function PersonSummaryCrew(props: { person: Crew }) {
  const { person } = props;
  let person_url = person.profile_path ? person.profile_path : null;
  if (person_url === null) person_url = MISSING_PERSON;

  return (
    <Link href={`/detail/person/${person.id}`} className="">
      <div className="flex h-full w-32 flex-col items-center justify-center">
        <Image
          src={TMDB_IMAGE_URL(person_url)}
          width={100}
          height={300}
          alt={`${person.name}`}
        />
        <div className="mt-auto">
          <div className="font-semibold">{person.name}</div>
          {person.name !== person.original_name ? (
            <div>{person.original_name}</div>
          ) : null}
          <div>{person.department ?? person.department}</div>
        </div>
      </div>
    </Link>
  );
}

export function DisplayCastCrew(props: {
  persons: Crew[] | Cast[];
  cast: boolean;
}) {
  const { persons, cast } = props;

  return (
    <div className="flex flex-row flex-wrap gap-2">
      {persons.map((person) => {
        if (cast) {
          return <PersonSummaryCast person={person as Cast} key={person.id} />;
        } else {
          return <PersonSummaryCrew person={person as Crew} key={person.id} />;
        }
      })}
    </div>
  );
}
