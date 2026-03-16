import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Nova B2B Portal",
  description: "A modern credit-based B2B trading portal.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <div className="app-shell">
          <header className="app-nav">
            <div className="app-nav-inner">
              <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
                <div className="app-logo-mark">
                  <div className="app-logo-inner">B2B</div>
                </div>
                <div className="app-logo-text">
                  <span className="app-logo-title">Nova Trade</span>
                  <span className="app-logo-subtitle">Credit-first B2B portal</span>
                </div>
              </div>

              <div className="app-nav-meta">
                <div className="app-nav-pill">
                  <span
                    style={{
                      display: "inline-flex",
                      width: 8,
                      height: 8,
                      borderRadius: "999px",
                      background:
                        "radial-gradient(circle at center, #22c55e 0, #22c55e 40%, transparent 70%)",
                      boxShadow: "0 0 0 4px rgba(34,197,94,0.18)",
                    }}
                  />
                  <span>Realtime credit & pricing</span>
                </div>
                <span>Admin • Company • Orders</span>
              </div>
            </div>
          </header>

          <main className="app-main">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
