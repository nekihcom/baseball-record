export function Footer() {
  return (
    <footer className="border-t py-4 text-center text-sm text-muted-foreground">
      <div className="container mx-auto max-w-[1024px] px-4">
        <p>© {new Date().getFullYear()} （仮称）草野球レポート</p>
      </div>
    </footer>
  );
}
