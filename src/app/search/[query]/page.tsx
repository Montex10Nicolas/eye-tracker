import Image from "next/image";
import { TMDB_IMAGE_URL, searchTV } from "~/server/queries";
import { type ResultSearchTV } from "~/types/tmdb";

function displayHumanDate(date: string) {
  const parts = date.split("-");

  if (parts.length < 3) {
    return date;
  }

  return `${parts[1]}/${parts[2]}/${parts[0]}`;
}

function DisplayResult(props: { result: ResultSearchTV }) {
  const serie = props.result;

  return (
    <div className="max-w-[200px] cursor-pointer bg-sky-600 hover:border-yellow-600">
      <Image
        src={TMDB_IMAGE_URL(50, 150, serie.poster_path)}
        width={200}
        height={300}
        alt={`Poster ${serie.name}`}
        className="image object-fit min-h-[300px] min-w-[200px] rounded-b-3xl"
      />
      <div className="p-2">
        <div>{serie.name}</div>
        <div className="flex justify-between">
          <span>{displayHumanDate(serie.first_air_date)}</span>
          <span>{serie.origin_country}</span>
        </div>
      </div>
    </div>
  );
}

export default async function SearchPage(props: { params: { query: string } }) {
  const results = await searchTV(props.params.query);

  return (
    <div className="m-4 flex flex-row flex-wrap justify-center gap-10">
      {results.results.map((res) => (
        <DisplayResult key={res.id} result={res} />
      ))}
    </div>
  );
}
