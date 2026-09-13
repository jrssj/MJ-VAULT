export default function AdminLoading() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center py-20 text-center">
      <div className="size-8 animate-spin rounded-full border-2 border-[var(--ink)] border-t-[var(--gold)]" />
      <p className="muted mt-4 text-xs tracking-wider uppercase">
        Cargando datos administrativos…
      </p>
    </div>
  );
}
