import { TMDB_IMAGE_URL } from "~/_utils/utils";
import { Headers, TMDB_URL } from "~/server/queries";
import { type FlatRentBuy, type WatchProvider } from "~/types/tmdb_detail";

function fixProvider(
  flatrate: FlatRentBuy[] | undefined,
  buy: FlatRentBuy[] | undefined,
  rent: FlatRentBuy[] | undefined,
) {
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
  return final;
}

async function getProvider(type: "tv" | "movie", id: number) {
  const url = new URL(`3/${type}/${id}/watch/providers`, TMDB_URL);
  const response = await fetch(url, {
    ...Headers,
  });

  return (await response.json()) as WatchProvider;
}

export default async function Provider(props: {
  id: number;
  type: "tv" | "movie";
}) {
  const { id, type } = props;

  const providers = await getProvider(type, id);
  const {
    results: { IT },
  } = providers;

  if (IT === undefined) {
    return <div>Not available in your country</div>;
  }

  const { flatrate, buy, rent } = IT;
  const final = fixProvider(flatrate, buy, rent);

  // Empty element so I can apply style on parten div wrapper
  return (
    <>
      {final.map((provider) => {
        return (
          <div key={provider.provider_id} className="border border-slate-700">
            <img
              src={TMDB_IMAGE_URL(provider.logo_path)}
              alt={provider.provider_name}
            />
          </div>
        );
      })}
    </>
  );
}
