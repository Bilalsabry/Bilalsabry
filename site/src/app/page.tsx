import TopBar from "@/components/TopBar";
import Intro from "@/components/Intro";
import Rows from "@/components/Rows";
import Footer from "@/components/Footer";
import { sections } from "@/lib/data";

export default function Home() {
  return (
    <>
      <TopBar />
      <main>
        <Intro />
        {sections.map((s, i) => (
          <Rows key={s.id} section={s} index={i} />
        ))}
      </main>
      <Footer />
    </>
  );
}
