"use client"

import { Lightbulb, Sparkles } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface InsightCardProps {
  title: string
  description: string
  actionLabel: string
  onAction?: () => void
}

export function InsightCard({ title, description, actionLabel, onAction }: InsightCardProps) {
  return (
    <Card className="relative overflow-hidden border-[#36103A]/40 bg-gradient-to-br from-[#36103A]/10 via-card to-card">
      {/* Glow effect */}
      <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-[#36103A]/25 blur-3xl" />
      <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-[#36103A]/15 blur-2xl" />
      
      <CardContent className="relative p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#36103A]/30">
            <Lightbulb className="h-6 w-6 text-[#36103A]" />
          </div>
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-foreground">{title}</h3>
              <Sparkles className="h-4 w-4 text-[#36103A]" />
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {description}
            </p>
            <Button 
              onClick={onAction}
              size="sm" 
              className="bg-[#008529] hover:bg-[#008529]/90 text-white"
            >
              {actionLabel}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
