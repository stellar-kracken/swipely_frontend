/** Swipely brand mark — monochrome, adapts to surrounding text color. */
export default function SwipelyMark({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
      className="text-current"
    >
      <circle cx="32" cy="32" r="30" stroke="currentColor" strokeWidth="3" />
      <path
        d="M20 32C20 25.373 25.373 20 32 20C38.627 20 44 25.373 44 32"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M44 32C44 38.627 38.627 44 32 44C25.373 44 20 38.627 20 32"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeOpacity="0.55"
      />
      <circle cx="32" cy="32" r="4" fill="currentColor" />
    </svg>
  );
}
