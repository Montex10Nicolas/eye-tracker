import Image from "next/image";
import { TMDB_IMAGE_URL } from "~/_utils/utils";
import { Headers, TMDB_URL } from "~/server/queries";
import { type FlatRentBuy, type WatchProvider } from "~/types/tmdb_detail";

export default async function Provider(props: {
  id: number;
  type: "tv" | "movie";
  width: number;
  height: number;
}) {
  const { id, type, width, height } = props;
  const url = new URL(`3/${type}/${id}/watch/providers`, TMDB_URL);
  const response = await fetch(url, {
    ...Headers,
  });

  const providers = (await response.json()) as WatchProvider;
  const {
    results: { IT },
  } = providers;

  if (IT === undefined) {
    return <div>Not available in your country</div>;
  }

  const { flatrate, buy, rent } = IT;

  let all: FlatRentBuy[] = [];
  if (flatrate != undefined) all = [...all, ...flatrate];
  if (buy != undefined) all = [...all, ...buy];
  if (rent != undefined) all = [...all, ...rent];

  let final: FlatRentBuy[] = [];
  for (const obj of all) {
    const found = final.find((a) => {
      if (a.provider_id === obj.provider_id) return obj;
    });

    if (found === undefined) {
      final = [...final, obj];
    } else {
      continue;
    }
  }
  final = final.sort((a, b) => a.display_priority - b.display_priority);

  // Empty element so I can apply style on parten div wrapper
  return (
    <>
      {final.map((provider) => {
        return (
          <div
            key={provider.provider_id}
            className="overflow-hidden rounded-sm"
          >
            <Image
              src={TMDB_IMAGE_URL(provider.logo_path)}
              width={width}
              height={height}
              alt={provider.provider_name}
            />
          </div>
        );
      })}
    </>
  );
}
