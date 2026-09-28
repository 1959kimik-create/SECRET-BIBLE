import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SECRET BIBLE",
  description: "성경속 숨겨진 이야기를 찾아서",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">
        <p id="sb-connect-status" hidden aria-hidden="true" />
        {children}
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script src="/boot-check.js" />
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script src="/secret-bible-actions.js" />
      </body>
    </html>
  );
}
