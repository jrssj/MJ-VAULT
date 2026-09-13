export default function StoreLoading() {
  return (
    <div className="container-page py-16">
      <div className="flex animate-pulse flex-col items-center justify-center py-20 text-center">
        <p className="eyebrow text-[var(--gold)]">MJ Vault</p>
        <h2 className="display mt-3 text-3xl font-light">Cargando selección…</h2>
        <div className="mt-8 flex gap-2">
          <span className="size-2 rounded-full bg-[var(--gold)] animate-bounce" />
          <span className="size-2 rounded-full bg-[var(--gold)] animate-bounce [animation-delay:0.2s]" />
          <span className="size-2 rounded-full bg-[var(--gold)] animate-bounce [animation-delay:0.4s]" />
        </div>
      </div>
    </div>
  );
}
