import Image from "next/image";
import Link from "next/link";
import { TMDB_IMAGE_URL, displayHumanDate } from "~/_utils/utils";
import { type TVResultType } from "~/types/tmdb_detail";

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
