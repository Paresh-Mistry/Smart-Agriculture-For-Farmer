// @component/_components/NavbarWrapper.tsx
"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";

export default function NavbarWrapper() {
  const pathname = usePathname();

  const isDashboard = pathname.startsWith("/with-sidebar");

  if (isDashboard) return null;

  return <Navbar />;
}
