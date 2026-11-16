import { HomeView } from "@/components/home/home-view";

export default function HomePage() {
  return (
    <main id="main" className="flex-1">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <HomeView />
      </div>
    </main>
  );
}
