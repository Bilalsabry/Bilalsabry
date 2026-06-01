import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Manifesto from "@/components/Manifesto";
import Stats from "@/components/Stats";
import Work from "@/components/Work";
import Approach from "@/components/Approach";
import Timeline from "@/components/Timeline";
import Contact from "@/components/Contact";

export default function Home() {
  return (
    <main>
      <Nav />
      <Hero />
      <Manifesto />
      <Stats />
      <Work />
      <Approach />
      <Timeline />
      <Contact />
    </main>
  );
}
