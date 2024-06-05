import { redirect } from "next/navigation";

export async function DisplaySearchMultiple() {
  async function searchMovieSeries(formData: FormData) {
    "use server";
    const search = formData.get("search") as string;

    redirect(`/search/${search}`);
  }

  return (
    <form action={searchMovieSeries} className="">
      <input
        type="text"
        name="search"
        placeholder={"Search a TV Series a Movie or a Person"}
        className="w-16 rounded-md border border-slate-900 px-4 py-2 sm:w-56"
      />
    </form>
  );
}
