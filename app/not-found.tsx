import Link from "next/link";

// Root fallback (rendered outside a locale layout, so it ships its own shell).
export default function RootNotFound() {
  return (
    <html lang="en">
      <body
        style={{
          fontFamily: "system-ui, sans-serif",
          display: "grid",
          placeItems: "center",
          minHeight: "100vh",
          margin: 0,
          background: "#0B1F45",
          color: "#fff",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <h1 style={{ fontSize: "4rem", margin: 0 }}>404</h1>
          <p style={{ opacity: 0.8 }}>Page not found</p>
          <Link href="/uz" style={{ color: "#5CA8FF" }}>
            Home
          </Link>
        </div>
      </body>
    </html>
  );
}
