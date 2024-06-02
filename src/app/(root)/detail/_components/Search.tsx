import { redirect } from "next/navigation";

export async function DisplaySearchMultiple() {
  async function searchMovieSeries(formData: FormData) {
    "use server";
    const search = formData.get("search") as string;

    redirect(`/search/${search}`);
  }

  return (
    <form action={searchMovieSeries} className="-mt-2 flex justify-center">
      <input
        type="text"
        name="search"
        placeholder={"Search a TV Series a Movie or a Person"}
        className="border-3 m-4 w-96 rounded-sm border border-slate-900 px-4 py-2 text-lg text-black "
      />
    </form>
  );
}
