import { SOURCES } from "@/lib/data";

export default function Sources() {
  return (
    <section id="sources">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow">References</span>
          <h2>Sources</h2>
          <p>Everything in this hub links back to one of these. OpenAI&apos;s own pages first, then press and analysis.</p>
        </div>
        <ul className="sources">
          {SOURCES.map((s) => (
            <li key={s.id}>
              <a href={s.url} target="_blank" rel="noreferrer">↗ {s.title}</a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
