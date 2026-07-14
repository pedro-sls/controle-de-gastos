import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { MobileNavigation } from "@/components/layout/app-navigation";

export default function AuthenticatedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="bg-muted/30 min-h-dvh lg:grid lg:grid-cols-[17rem_minmax(0,1fr)]">
      <a
        href="#conteudo-principal"
        className="bg-background focus-visible:ring-ring fixed top-3 left-3 z-[100] -translate-y-24 rounded-lg px-4 py-3 font-medium shadow-lg transition-transform outline-none focus:translate-y-0 focus-visible:ring-3"
      >
        Pular para o conteúdo
      </a>

      <AppSidebar />

      <div className="min-w-0">
        <AppHeader />
        <main
          id="conteudo-principal"
          tabIndex={-1}
          className="mx-auto w-full max-w-7xl px-4 py-6 pb-[calc(6rem+env(safe-area-inset-bottom))] outline-none sm:px-6 sm:py-8 lg:px-8 lg:pb-8"
        >
          {children}
        </main>
      </div>

      <MobileNavigation />
    </div>
  );
}
