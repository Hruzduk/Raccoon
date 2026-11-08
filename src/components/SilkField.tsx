export function SilkField({
  colors,
  image,
  alt,
}: {
  colors: [string, string, string];
  image?: string;
  alt: string;
}) {
  if (image) {
    return <img src={image} alt={alt} className="h-full w-full object-cover" />;
  }

  return (
    <div
      className="relative h-full w-full"
      role="img"
      aria-label={alt}
      style={{
        background: `radial-gradient(120% 90% at 12% 8%, ${colors[0]}, transparent 52%), radial-gradient(80% 70% at 88% 92%, ${colors[1]}, transparent 46%), linear-gradient(155deg, ${colors[2]}, ${colors[0]} 72%)`,
      }}
    >
      <div
        className="absolute inset-0 opacity-35"
        style={{
          background:
            "repeating-linear-gradient(118deg, transparent 0 16px, rgba(255,255,255,.28) 16px 17px)",
        }}
      />
    </div>
  );
}
