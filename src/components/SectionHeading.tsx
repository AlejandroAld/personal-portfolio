export default function SectionHeading({
  eyebrow,
  title,
  intro,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
}) {
  return (
    <div>
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="mt-3 text-2xl font-semibold tracking-tight text-balance sm:text-3xl">{title}</h2>
      {intro && <p className="mt-4 max-w-2xl leading-relaxed text-muted text-pretty">{intro}</p>}
    </div>
  );
}
