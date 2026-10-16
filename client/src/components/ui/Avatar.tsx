import { cn } from '../../utils/cn';

interface AvatarProps {
  name: string;
  tone: string;
  avatarUrl?: string | null;
  size?: number;
  className?: string;
}

export function Avatar({ name, tone, avatarUrl, size = 36, className }: AvatarProps) {
  const initials = name.
  split(' ').
  filter(Boolean).
  slice(0, 2).
  map((p) => p[0]?.toUpperCase() ?? '').
  join('');

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        style={{ width: size, height: size }}
        className={cn('shrink-0 rounded-full object-cover', className)} />

    );
  }

  return (
    <span
      style={{ width: size, height: size, fontSize: Math.max(10, size * 0.38) }}
      className={cn('grid shrink-0 place-items-center rounded-full font-semibold', tone, className)}>

      {initials}
    </span>);

}
