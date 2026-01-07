type GridProps = {
  columns?: number;
  children: React.ReactNode;
  responsive?: boolean;
};

export default function Grid({ columns = 4, children, responsive = true }: GridProps) {
  if (responsive) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {children}
      </div>
    );
  }

  return (
    <div
      className="grid gap-4"
      style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
    >
      {children}
    </div>
  );
}