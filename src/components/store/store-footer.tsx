export function StoreFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-store-charcoal/10 bg-store-cream py-10">
      <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
        <p className="font-store-serif text-lg tracking-[0.06em] text-store-charcoal">
          Luperini
        </p>
        <p className="mt-3 font-store-sans text-[10px] uppercase tracking-[0.15em] text-store-charcoal/50">
          © {year} Luperini Store. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}
