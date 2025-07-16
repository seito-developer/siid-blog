"use client"

import type React from "react"
import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"
import { cn } from "@/libs/utils"

export interface BreadcrumbItem {
  label: string
  href?: string
  isCurrentPage?: boolean
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
  showHome?: boolean
  separator?: React.ReactNode
  className?: string
}

export default function Breadcrumbs({
  items,
  showHome = true,
  separator = <ChevronRight className="h-4 w-4" />,
  className,
}: BreadcrumbsProps) {
  const allItems = showHome ? [{ label: "Home", href: "/" }, ...items] : items

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("flex items-center space-x-2 text-sm p-2", className)}
      style={{ fontFamily: "Noto Sans JP, sans-serif" }}
    >
      <ol className="flex items-center space-x-2">
        {allItems.map((item, index) => {
          const isLast = index === allItems.length - 1
          const isHome = showHome && index === 0

          return (
            <li key={index} className="flex items-center">
              {index > 0 && (
                <span className="mx-2 text-gray-400" aria-hidden="true">
                  {separator}
                </span>
              )}

              {item.href && !item.isCurrentPage ? (
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center transition-colors duration-200",
                    isHome ? "text-[#289B8F] hover:text-[#214a4a]" : "text-[#214a4a] hover:text-[#289B8F]",
                  )}
                  aria-current={isLast ? "page" : undefined}
                >
                  {isHome ? (
                    <>
                      <Home className="h-4 w-4 mr-1" />
                      <span className="sr-only">{item.label}</span>
                    </>
                  ) : (
                    item.label
                  )}
                </Link>
              ) : (
                <span
                  className={cn(
                    "flex items-center",
                    isLast || item.isCurrentPage ? "text-[#EE7D2B] font-medium" : "text-gray-600",
                  )}
                  aria-current={isLast || item.isCurrentPage ? "page" : undefined}
                >
                  {isHome ? (
                    <>
                      <Home className="h-4 w-4 mr-1" />
                      <span className="sr-only">{item.label}</span>
                    </>
                  ) : (
                    item.label
                  )}
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
