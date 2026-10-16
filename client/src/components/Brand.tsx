import { cn } from '../utils/cn';
import logo from '../assets/logo.svg';

interface BrandProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  inverted?: boolean;
}

const HEIGHT = { sm: 'h-6', md: 'h-8', lg: 'h-11' };

export function Brand({ size = 'md', className, inverted }: BrandProps) {
  return (
    <img
      src={logo}
      alt="tech4mation"
      className={cn(HEIGHT[size], 'w-auto object-contain', inverted && 'brightness-0 invert', className)} />

  );
}
