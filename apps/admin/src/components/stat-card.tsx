import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LucideIcon } from "lucide-react"
import AnimatedNumber from "@/components/animated-number"

interface StatCardProps {
    title: string
    value: string | number
    icon: LucideIcon
    gradient?: string
}

export function StatCard({ title, value, icon: Icon, gradient = "from-primary/10 to-primary/5" }: StatCardProps) {
    // Check if value contains pipe separator for two-line display
    const hasTwoLines = typeof value === 'string' && value.includes('|');
    const [mainValue, unit] = hasTwoLines ? (value as string).split('|') : [value, null];

    return (
        <Card className="relative overflow-hidden">
            {/* Background gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-80`} />

            {/* Large tilted icon as background */}
            <div className="absolute -right-8 -top-8 opacity-10">
                <Icon className="h-32 w-32 rotate-12 text-primary" strokeWidth={1.5} />
            </div>

            {/* Content */}
            <CardHeader className="relative pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground/80">
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent className="relative">
                {hasTwoLines ? (
                    <div className="flex flex-col">
                        <div className="text-5xl font-bold text-foreground leading-none">
                            {mainValue}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                            {unit}
                        </div>
                    </div>
                ) : (
                    <div className="text-5xl font-bold text-foreground">
                        {typeof value === 'number' ? (
                            <AnimatedNumber value={value} duration={1000} />
                        ) : (
                            value
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
