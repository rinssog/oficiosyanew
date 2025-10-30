export type Zone = { province: string; focus: string };

export default function Zones({ items }: { items: Zone[] }) {
  return (
    <section className="space-y-6 py-6">
      <header>
        <h2 className="text-2xl font-semibold text-gray-900">Cobertura federal</h2>
        <p className="text-sm text-gray-600">Sumamos cuadrillas en las provincias y cordones urbanos con mayor demanda.</p>
      </header>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((zone) => (
          <div key={zone.province} className="rounded-lg border bg-white p-4 shadow-sm">
            <strong className="block text-emerald-800">{zone.province}</strong>
            <span className="text-sm text-gray-600">{zone.focus}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
