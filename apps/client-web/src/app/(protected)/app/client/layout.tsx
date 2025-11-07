import ClientSidebar from "@/components/app/client/sidebar";

export default async function ClientLayout({
  children,
}: React.PropsWithChildren) {
  return (
    <div className="grid grid-cols-1 gap-6 px-5 py-6 md:grid-cols-[260px_1fr] md:gap-8 md:px-10 lg:px-16">
      <ClientSidebar />
      <section className="flex flex-col gap-6 md:gap-7">{children}</section>
    </div>
  );
}
