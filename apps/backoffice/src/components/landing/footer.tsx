"use client";

import Link from "next/link";

export default function Footer() {
  const year = new Date().getUTCFullYear();

  return (
    <footer className="mt-16 border-t bg-gray-50">
      <div className="mx-auto flex max-w-7xl flex-col items-end gap-4 px-4 py-8 md:px-8">
        <div className="text-right text-sm leading-relaxed text-gray-600">
          <strong className="text-base text-emerald-800">OficiosYa SAS</strong>
          <p className="mt-1">CUIT 30-71914721-2</p>
          <p>Echeverría 1437 PB, Belgrano, CABA · CP 1428</p>
          <p>atencion.oficiosya@gmail.com · +54 11 5555-5555</p>
        </div>
        <div className="flex flex-wrap justify-end gap-4 text-sm font-semibold text-emerald-700">
          <Link href="/terminos" className="hover:underline">
            Términos y condiciones
          </Link>
          <Link href="/politica-privacidad" className="hover:underline">
            Política de privacidad
          </Link>
          <Link href="/soporte" className="hover:underline">
            Centro de ayuda
          </Link>
          <Link href="/contacto" className="hover:underline">
            Contacto comercial
          </Link>
        </div>
        <small className="text-gray-500">
          © {year} OficiosYa SAS · Intermediación segura para clientes, prestadores y consorcios.
        </small>
      </div>
    </footer>
  );
}

