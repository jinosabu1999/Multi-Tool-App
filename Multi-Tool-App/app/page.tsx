import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ListTodo, FileText, BarChart, Image, Music, PieChart, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

const tools = [
  {
    href: "/todo",
    icon: ListTodo,
    title: "Todo List",
    description: "Manage your tasks and to-dos with categories, priorities, and due dates.",
    color: "bg-blue-500/10 text-blue-500",
  },
  {
    href: "/notes",
    icon: FileText,
    title: "Notes",
    description: "Take and organize your notes with categories, tags, and rich formatting.",
    color: "bg-green-500/10 text-green-500",
  },
  {
    href: "/budget",
    icon: BarChart,
    title: "Budget Tracker",
    description: "Track your income and expenses with detailed charts and analysis.",
    color: "bg-purple-500/10 text-purple-500",
  },
  {
    href: "/image-editor",
    icon: Image,
    title: "Image Editor",
    description: "Edit and enhance your images with filters, resizing, and transformations.",
    color: "bg-orange-500/10 text-orange-500",
  },
  {
    href: "/audio-cutter",
    icon: Music,
    title: "Audio Cutter",
    description: "Cut and edit audio files with precision and apply effects.",
    color: "bg-red-500/10 text-red-500",
  },
  {
    href: "/analytics",
    icon: PieChart,
    title: "Analytics",
    description: "View insights and statistics about your activities across all tools.",
    color: "bg-teal-500/10 text-teal-500",
  },
]

export default function Home() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Multi-Tool App</h1>
        <p className="text-muted-foreground">A collection of productivity tools in one place.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map((tool) => (
          <Card key={tool.href} className="overflow-hidden transition-all hover:shadow-md">
            <CardHeader className="pb-3">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${tool.color}`}>
                <tool.icon className="w-6 h-6" />
              </div>
              <CardTitle className="mt-4">{tool.title}</CardTitle>
              <CardDescription>{tool.description}</CardDescription>
            </CardHeader>
            <CardFooter>
              <Button asChild variant="ghost" className="p-0 h-auto font-normal text-sm">
                <Link href={tool.href} className="flex items-center">
                  Open tool
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}

