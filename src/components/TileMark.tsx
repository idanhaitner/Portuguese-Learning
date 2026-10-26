/** The app's mark: a four-by-four patch of the Copacabana wave with one sun stone being laid. */
const PATCH = [
  [1, 1, 0, 0],
  [0, 1, 1, 0],
  [0, 0, 1, 1],
  [1, 0, 0, 2],
];

export function TileMark({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" className="flex-none">
      <rect width="24" height="24" rx="5" fill="#2b2a26" />
      {PATCH.flatMap((row, r) =>
        row.map((value, c) => (
          <rect key={`${r}-${c}`} x={2.4 + c * 5} y={2.4 + r * 5} width="4.2" height="4.2" rx="0.9" fill={value === 2 ? "#ffc531" : value ? "#f3f3f0" : "#050505"} />
        )),
      )}
    </svg>
  );
}
