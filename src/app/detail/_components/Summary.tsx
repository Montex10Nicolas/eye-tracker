import Image from "next/image";
import Link from "next/link";
import { TMDB_IMAGE_URL } from "~/_utils/utils";
import { type Cast, type Crew } from "~/types/tmdb";

export function PersonSummaryCast(props: { person: Cast }) {
  const person = props.person;
  return (
    <Link href={`/detail/person/${person.id}`}>
      <Image
        src={TMDB_IMAGE_URL(person.profile_path ? person.profile_path : "")}
        width={100}
        height={300}
        alt={`${person.name}`}
      />
      <div>{person.name}</div>
      {person.name !== person.original_name ? (
        <div>{person.original_name}</div>
      ) : null}
      <div>{person.character ?? person.character}</div>
    </Link>
  );
}

export function PersonSummaryCrew(props: { person: Crew }) {
  const person = props.person;
  return (
    <Link href={`/detail/person/${person.id}`}>
      <Image
        src={TMDB_IMAGE_URL(person.profile_path ? person.profile_path : "")}
        width={100}
        height={300}
        alt={`${person.name}`}
      />
      <div>{person.name}</div>
      {person.name !== person.original_name ? (
        <div>{person.original_name}</div>
      ) : null}
      <div>{person.department ?? person.department}</div>
    </Link>
  );
}
