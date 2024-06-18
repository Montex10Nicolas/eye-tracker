"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { TMDB_IMAGE_URL } from "~/_utils/utils";
import { type Cast, type Credits, type Crew } from "~/types/tmdb_detail";

function RenderCrew(props: { crew: Crew[] }) {
  const { crew: crews } = props;
  return (
    <>
      {crews.map((crew) => {
        const { profile_path, name, department, id } = crew;

        return (
          <div key={crew.id} className="text-black">
            <a href={`/detail/person/${id}`}>
              <div className="h-[130px] w-[80px] sm:h-[220px] sm:w-[150px]">
                <Image
                  className="h-full w-full"
                  src={TMDB_IMAGE_URL(profile_path ?? null)}
                  height={100}
                  width={200}
                  alt={name}
                />
              </div>
              <div className="w-full text-xs sm:text-base">
                <h3>{name}</h3>
                <h4>{department}</h4>
              </div>
            </a>
          </div>
        );
      })}
    </>
  );
}
function RenderCast(props: { cast: Cast[] }) {
  const { cast: casts } = props;
  return (
    <>
      {casts.map((cast) => {
        const { profile_path, name, character, id } = cast;

        return (
          <div key={cast.id} className="text-black">
            <a href={`/detail/person/${id}`}>
              <div className="h-[130px] w-[80px] sm:h-[220px] sm:w-[150px]">
                <Image
                  className="h-full w-full"
                  src={TMDB_IMAGE_URL(profile_path ?? null)}
                  height={100}
                  width={200}
                  alt={name}
                />
              </div>
              <div className="w-full text-xs sm:text-base">
                <h3>{name}</h3>
                <h4>{character}</h4>
              </div>
            </a>
          </div>
        );
      })}
    </>
  );
}

export function ClientCredits(props: { credits: Credits }) {
  const { credits } = props;

  const [state, setState] = useState<"crew" | "cast">("cast");

  const { cast, crew } = credits;

  return (
    <section className="left-0 flex h-[250px] w-full flex-col border-y-2 border-secondary bg-foreground sm:h-[350px]">
      <div className="min-w-full basis-12 bg-secondary text-center">
        <div className="mx-auto flex h-full w-3/4 items-center justify-between px-4">
          <span
            className={`cursor-pointer text-lg font-bold hover:text-primary ${state === "cast" ? "text-primary" : "text-slate-600"}`}
            onClick={() => setState("cast")}
          >
            Cast
          </span>
          <span className="my-auto text-xl font-bold">Credits</span>
          <span
            className={`cursor-pointer text-lg font-bold hover:text-primary ${state === "crew" ? "text-primary" : "text-slate-600"}`}
            onClick={() => setState("crew")}
          >
            Crew
          </span>
        </div>
      </div>

      <div className="mx-2 mt-1 flex h-full w-full snap-x snap-proximity flex-row gap-4 overflow-y-hidden overflow-x-scroll scroll-smooth bg-foreground pr-6 sm:mx-auto sm:mt-6 sm:w-3/4 sm:pr-0 md:gap-12">
        {state === "cast" ? (
          <RenderCast cast={cast} />
        ) : (
          <RenderCrew crew={crew} />
        )}
      </div>
    </section>
  );
}
