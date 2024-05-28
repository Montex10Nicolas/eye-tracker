"use client";
import { useState, type ChangeEvent } from "react";
import { TMDB_IMAGE_URL } from "~/_utils/utils";
import { cn } from "~/lib/utils";
import { type FlatRentBuy, type ProviderResult } from "~/types/tmdb_detail";

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

function DisplayProvider(props: { provider: ProviderResult | undefined }) {
  const { provider } = props;

  if (provider === undefined) return <div>Not available in your country</div>;

  const { flatrate, buy, rent } = provider;
  const final = fixProvider(flatrate, buy, rent);

  let colLen = final.length;
  if (colLen > 4) colLen = 4;
  const gridCol = `grid gap-2 ${colLen === 4 ? "grid-cols-4" : "grid-cols-2"} grid-cols-2`;

  return (
    <div className={gridCol}>
      {final.map((prov) => {
        return (
          <div key={prov.provider_id} className="grid-cols-1">
            <img
              className="rounded-sm border border-slate-800 object-fill"
              src={TMDB_IMAGE_URL(prov.logo_path)}
              alt={prov.provider_name}
            />
          </div>
        );
      })}
    </div>
  );
}

export default function Provider(props: {
  providers: Record<string, ProviderResult>;
}) {
  const { providers } = props;

  const [country, setCountry] = useState<string>("IT");
  const providerData = providers[country];

  function handleChange(event: ChangeEvent<HTMLSelectElement>) {
    const value = event.target.value;
    setCountry(value.toUpperCase());
  }

  const keys = Object.keys(providers);

  return (
    <div className="flex flex-col gap-2">
      <select
        onChange={handleChange}
        value={country}
        className="cursor-pointer rounded-sm bg-white px-4 py-2 text-center text-black"
      >
        {keys.map((key) => {
          const provider = providers[key];
          if (provider === undefined)
            return <div key={key}>{key} undefined</div>;
          return <option key={key}>{key}</option>;
        })}
      </select>
      <DisplayProvider provider={providerData} />
    </div>
  );
}
