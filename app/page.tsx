import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import ControlStack from "@/components/ControlStack";
import LearnHub from "@/components/LearnHub";
import Timeline from "@/components/Timeline";
import GuardrailLab from "@/components/GuardrailLab";
import Compare from "@/components/Compare";
import Sources from "@/components/Sources";
import Assistant from "@/components/Assistant";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <ControlStack />
        <LearnHub />
        <Timeline />
        <GuardrailLab />
        <Compare />
        <Sources />
      </main>
      <footer>
        <div className="container">
          Independent learning resource · Not affiliated with OpenAI or any vendor listed · Research compiled 11 Nov 2026 ·
          Items marked <span className="conf conf-secondary">secondary</span> come from blogs/aggregators — verify before relying on them.
        </div>
      </footer>
      <Assistant />
    </>
  );
}
