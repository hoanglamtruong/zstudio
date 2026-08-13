import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ZVIDEO",
  description: "Quản lý sản xuất video — Zteam/Zudio",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="vi" className="h-full">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
