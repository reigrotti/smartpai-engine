"use client"

import { TrendingUp, TrendingDown } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface KPICardProps {
  title: string
  value: string
  change?: {
    value: string
    trend: "up" | "down"
  }
  subtitle?: string
  icon?: React.ReactNode
}

export function KPICard({ title, value, change, subtitle, icon }: KPICardProps) {
  return (
    <Card className="bg-card border-border">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold text-foreground">{value}</p>
            {change && (
              <div className="flex items-center gap-1">
                {change.trend === "up" ? (
                  <TrendingUp className="h-4 w-4 text-[#008529]" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
                <span
                  className={cn(
                    "text-sm font-medium",
                    change.trend === "up" ? "text-[#008529]" : "text-red-500"
                  )}
                >
                  {change.value}
                </span>
                {subtitle && (
                  <span className="text-sm text-muted-foreground">{subtitle}</span>
                )}
              </div>
            )}
            {!change && subtitle && (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>
          {icon && (
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#008529]/10">
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
