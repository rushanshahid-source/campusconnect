// Real brand logos bundled under /public/logos. Matched by substring so plan
// variants like "Spotify Premium" or "Adobe Creative Cloud" still resolve.
const serviceLogos = [
  { match: "netflix", logo: "/logos/netflix.svg", color: "#E50914" },
  { match: "spotify", logo: "/logos/spotify.svg", color: "#1DB954" },
  { match: "youtube", logo: "/logos/youtube.svg", color: "#FF0000" },
  { match: "canva", logo: "/logos/canva.svg", color: "#00C4CC" },
  { match: "adobe", logo: "/logos/adobe.svg", color: "#FF0000" },
  { match: "notion", logo: "/logos/notion.svg", color: "#000000" },
];

export function getServiceLogo(name: string): string | null {
  const n = name.toLowerCase();
  return serviceLogos.find((s) => n.includes(s.match))?.logo ?? null;
}

/**
 * Renders a service's brand logo on a white tile, falling back to a colored
 * tile with the first letter for services that have no bundled logo.
 */
export function ServiceIcon({
  name,
  tileClassName,
  imgClassName,
}: {
  name: string;
  tileClassName: string;
  imgClassName: string;
}) {
  const match = serviceLogos.find((s) => name.toLowerCase().includes(s.match));
  if (match) {
    return (
      <div
        className={`${tileClassName} bg-white flex items-center justify-center overflow-hidden`}
      >
        <img src={match.logo} alt={name} className={imgClassName} />
      </div>
    );
  }
  return (
    <div
      className={`${tileClassName} flex items-center justify-center text-white font-bold`}
      style={{ backgroundColor: "#6366F1" }}
    >
      {name[0]}
    </div>
  );
}
