import Navbar from "@/components/landing/navbar";
import Footer from "@/components/landing/footer";
import { HydrateClient } from "@/trpc/server";

export const metadata = {
  title: "Contacto comercial · OficiosYa",
};

export default function ContactPage() {
  return (
    <HydrateClient>
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="mdx-auto max-w-3xl flex-1 px-4 py-10 md:px-8 md:py-14">
          <h1 className="mb-3 text-3xl font-bold tracking-tight text-gray-900">
            Contacto comercial
          </h1>
          <p className="text-sm text-gray-700">
            Si sos administrador de consorcios o querés integrar tus servicios a
            OficiosYa, escribinos a{" "}
            <a
              className="text-emerald-700 underline hover:text-emerald-800"
              href="mailto:comercial@oficiosya.com"
            >
              comercial@oficiosya.com
            </a>{" "}
            y un ejecutivo se pondrá en contacto.
          </p>
        </main>
        <Footer />
      </div>
    </HydrateClient>
  );
}
