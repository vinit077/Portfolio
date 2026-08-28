import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin — vinit.dev",
  robots: { index: false, follow: false }, // Don't index admin pages
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
