export default async function Page() {
  return (
    <main className="">
      <div className="mx-auto mt-10 flex h-96 w-[90%] flex-col bg-white sm:flex-row lg:w-[80%] xl:w-[70%]">
        <div className="h-full w-full border-b-4 border-slate-900 bg-blue-700 sm:w-[50%] sm:border-b-0 sm:border-r-4">
          <div className="bg-slate-700 p-2 text-xl">
            <h2>Serie</h2>
          </div>
        </div>
        <div className="h-full w-full bg-red-700 sm:w-[50%]">
          <div className="bg-slate-700 p-2 text-xl">
            <h2>Movie</h2>
          </div>
        </div>
      </div>
    </main>
  );
}
