import { AppBrand } from "@/components/layout/app-brand";
import { CurrentPageLabel } from "@/components/layout/current-page-label";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { logoutAction } from "@/features/auth/actions";
import { LogoutButton } from "@/features/auth/components/logout-button";

export function AppHeader() {
  return (
    <header className="bg-background/95 supports-backdrop-filter:bg-background/85 sticky top-0 z-40 border-b backdrop-blur">
      <div className="flex min-h-16 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <div className="min-w-0">
          <AppBrand
            compact
            className="mb-1 lg:hidden [&>span:first-child]:hidden"
          />
          <CurrentPageLabel />
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <ThemeToggle />
          <form action={logoutAction}>
            <LogoutButton compact />
          </form>
        </div>
      </div>
    </header>
  );
}
