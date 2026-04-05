import "./globals.css";
import { Sidebar } from "@/components/sidebar";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const themeScript = `
    (function () {
      try {
        var stored = localStorage.getItem("theme");
        var systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        var shouldUseDark = stored ? stored === "dark" : systemDark;
        document.documentElement.classList.toggle("dark", shouldUseDark);
      } catch (e) {}
    })();
  `;

  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
          <Sidebar />

          <main className="flex-1 bg-slate-50 p-6 dark:bg-slate-950">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}