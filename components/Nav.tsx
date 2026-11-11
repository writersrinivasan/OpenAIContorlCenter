export default function Nav() {
  const links = [
    ["#stack", "Control Stack"],
    ["#learn", "Learn"],
    ["#timeline", "Timeline"],
    ["#lab", "Guardrail Lab"],
    ["#compare", "Compare"],
    ["#sources", "Sources"],
  ];
  return (
    <nav className="nav">
      <div className="container nav-inner">
        <a href="#top" className="brand">
          <span className="brand-dot">🛰️</span> Agent Control Center Hub
        </a>
        <div className="nav-links">
          {links.map(([href, label]) => (
            <a key={href} href={href}>
              {label}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
}
