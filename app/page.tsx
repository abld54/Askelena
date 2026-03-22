import { Navbar } from "@/components/navbar";
import { Hero } from "@/components/hero";
import { Categories } from "@/components/categories";
import { Listings } from "@/components/listings";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <main className="flex-1">
      <Navbar />
      <Hero />
      <Categories />
      <Listings />
      <Footer />
    </main>
  );
}
