import React from 'react';

/**
 * Reusable SVG wrapper for Simple Icons.
 * - icon: object from 'simple-icons' (e.g., siYoutube)
 * - size: number or string (px if number)
 * - color: CSS color string. Defaults to 'currentColor' (so you can style via CSS).
 * - useBrandColor: if true, uses the icon's official brand color.
 * - title: accessible label. Defaults to icon.title if not decorative.
 * - decorative: if true, hides from screen readers.
 */
export default function BrandIcon({
  icon,
  size = 24,
  color,
  useBrandColor = false,
  title,
  decorative = false,
  className,
  ...rest
}) {
  const ariaLabel = decorative ? undefined : (title || icon.title);
  const finalColor = useBrandColor ? `#${icon.hex}` : (color || 'currentColor');

  const sizeProps =
    typeof size === 'number'
      ? { width: size, height: size }
      : { width: size, height: size };

  return (
    <svg
      role="img"
      aria-hidden={decorative ? 'true' : undefined}
      aria-label={ariaLabel}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...sizeProps}
      {...rest}
    >
      <path d={icon.path} fill={finalColor} />
    </svg>
  );
}