// (auth) group layout — intentionally has NO AdminGuard and NO AdminSidebar.
// All unauthenticated admin routes (currently just /admin/login) render here.
export default function AdminAuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
