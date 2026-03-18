"use client";

import Link from "next/link";
import React from "react";
import { AutoTranslate } from "./AutoTranslate";

const SidebarLink = ({
  href,
  icon,
  label,
  isOpen,
}: {
  icon: React.ReactNode;
  href: string;
  label: string;
  isOpen: boolean;
}) => {
  return (
    <AutoTranslate>
    <Link
      href={href}
      className={`flex gap-3 items-center ${!isOpen && "justify-center rounded-full"} px-4 py-2 hover:bg-[#cfe8e8] transition rounded-r-full cursor-pointer`}
    >
      <div className="">{icon}</div>
      {isOpen && <span className="text-sm">{label}</span>}
    </Link>
    </AutoTranslate>
  );
};

export default SidebarLink;
