type Props = {
  children: React.ReactNode;
};

export default function HorizontalScroller({ children }: Props) {
  return (
    <div className="flex gap-4 overflow-x-auto scrollbar-hide">
      {children}
    </div>
  );
}
