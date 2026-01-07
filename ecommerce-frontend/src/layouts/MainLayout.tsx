export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="relative min-h-screen bg-white">
      {children}
    </main>
  );
}