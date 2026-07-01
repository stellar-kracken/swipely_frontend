/** Swipely brand mark — matches public/favicon.svg. */
export default function SwipelyMark({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <circle cx="32" cy="32" r="30" stroke="#0057FF" strokeWidth="3" fill="#0B0E1A" />
      <path
        d="M20 32C20 25.373 25.373 20 32 20C38.627 20 44 25.373 44 32"
        stroke="#0057FF"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M44 32C44 38.627 38.627 44 32 44C25.373 44 20 38.627 20 32"
        stroke="#00D4AA"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx="32" cy="32" r="4" fill="#0057FF" />
    </svg>
  );
}
