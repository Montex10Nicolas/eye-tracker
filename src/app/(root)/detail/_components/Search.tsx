"use client";

import { useRouter } from "next/navigation";
import { useState, type ChangeEvent, type KeyboardEvent } from "react";
import { SearchIcon } from "./Icons";

export function DisplaySearchMultiple() {
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [search, setSearch] = useState("");

  function redirectToSearch() {
    setVisible(false);
    router.push(`/search/${search}`);
  }

  function handleClick() {
    // Normal screen size search
    if (window.innerWidth > 640) {
      redirectToSearch();
      return;
    }

    // Mobile screen size open
    setVisible((c) => !c);
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    setSearch(e.target.value);
  }

  function keyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      redirectToSearch();
    }
  }

  return (
    <div className="h-11/12 flex items-center overflow-visible rounded-sm bg-foreground py-2">
      <input
        type="text"
        name="search"
        placeholder={"Search a TV Series a Movie or a Person"}
        className="hidden appearance-none px-1 text-black  !outline-none sm:block"
        value={search}
        onChange={handleChange}
        onKeyDown={keyDown}
      />
      <div
        onClick={handleClick}
        className="flex h-full w-10 cursor-pointer justify-center border-primary sm:border-l-2"
      >
        <SearchIcon />
      </div>
      {visible ? (
        <div className="absolute bottom-0 left-0 grid h-full w-screen translate-y-[100%] place-content-center bg-primary">
          <input
            type="text"
            className="m-auto h-full w-full bg-foreground px-12 py-4"
            placeholder={"Search a TV Series a Movie or a Person"}
            value={search}
            onChange={handleChange}
            onKeyDown={keyDown}
          />
        </div>
      ) : null}
    </div>
  );
}
