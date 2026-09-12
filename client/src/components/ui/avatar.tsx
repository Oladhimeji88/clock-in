const palette = [
  "bg-indigo-500/20 text-indigo-300",
  "bg-emerald-500/20 text-emerald-300",
  "bg-rose-500/20 text-rose-300",
  "bg-amber-500/20 text-amber-300",
  "bg-sky-500/20 text-sky-300",
  "bg-violet-500/20 text-violet-300",
];

function hashName(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return Math.abs(hash);
}

export function Avatar({ name, size = 36 }: { name: string; size?: number }) {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const colorClass = palette[hashName(name) % palette.length];

  return (
    <div
      style={{ width: size, height: size }}
      className={`flex shrink-0 items-center justify-center rounded-full font-semibold ${colorClass}`}
    >
      <span style={{ fontSize: size * 0.38 }}>{initials}</span>
    </div>
  );
}
