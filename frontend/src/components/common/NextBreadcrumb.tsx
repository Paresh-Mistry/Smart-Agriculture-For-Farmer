'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../ui/breadcrumb"
import React from "react"

export default function AppBreadcrumb() {
  const pathname = usePathname()
  const segments = pathname.split("/").filter(Boolean)

  const formatLabel = (label: string) =>
    label.charAt(0).toUpperCase() + label.slice(1)

  // If no extra segments — only show Home
  if (segments.length === 0) {
    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>Home</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    )
  }

  // If only 1 segment, show Home -> Last
  if (segments.length === 1) {
    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{formatLabel(segments[0])}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    )
  }

  // Get last two segments
  const secondLastSegment = segments[segments.length - 2]
  const lastSegment = segments[segments.length - 1]

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {/* Home */}
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/">Home</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {/* Ellipsis if more than 2 segments */}
        {segments.length > 2 && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbEllipsis className="size-4" />
            </BreadcrumbItem>
          </>
        )}

        {/* Second last segment */}
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href={`/${segments.slice(0, segments.length - 1).join("/")}`}>
                {formatLabel(secondLastSegment)}
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {/* Last segment */}
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>{formatLabel(lastSegment)}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}
