import Image from "next/image";
import Link from "next/link";
import { TMDB_IMAGE_URL } from "~/server/queries";
import { type Cast, type Crew } from "~/types/tmdb";

export default function PersonSummary(props: { person: Cast & Crew }) {
  const person = props.person;
  return (
    <Link href={`/detail/person/${person.id}`}>
      <Image
        src={TMDB_IMAGE_URL(
          50,
          50,
          person.profile_path ? person.profile_path : "",
        )}
        width={100}
        height={300}
        alt={`${person.name}`}
      />
      <div>{person.name}</div>
      {person.name !== person.original_name ? (
        <div>{person.original_name}</div>
      ) : null}
      <div>{person.character ? person.character : person.department}</div>
    </Link>
  );
}
