"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts"

type Todo = {
  id: number
  text: string
  completed: boolean
  category: string
  priority: "low" | "medium" | "high"
  dueDate?: string
  completedAt?: string
}

type Note = {
  id: number
  title: string
  content: string
  category: string
  createdAt: string
  tags: string[]
}

type Transaction = {
  id: number
  type: "income" | "expense"
  category: string
  amount: number
  date: string
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"]

export default function AnalyticsPage() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [notes, setNotes] = useState<Note[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])

  useEffect(() => {
    const savedTodos = localStorage.getItem("todos")
    const savedNotes = localStorage.getItem("notes")
    const savedTransactions = localStorage.getItem("budgetTransactions")
    if (savedTodos) setTodos(JSON.parse(savedTodos))
    if (savedNotes) setNotes(JSON.parse(savedNotes))
    if (savedTransactions) setTransactions(JSON.parse(savedTransactions))
  }, [])

  const getCompletionRate = () => {
    const completedTodos = todos.filter((todo) => todo.completed).length
    return todos.length > 0 ? (completedTodos / todos.length) * 100 : 0
  }

  const getAverageCompletionTime = () => {
    const completedTodos = todos.filter((todo) => todo.completed && todo.completedAt)
    if (completedTodos.length === 0) return 0

    const totalTime = completedTodos.reduce((sum, todo) => {
      const createdAt = new Date(todo.id)
      const completedAt = new Date(todo.completedAt!)
      return sum + (completedAt.getTime() - createdAt.getTime())
    }, 0)

    return totalTime / completedTodos.length / (1000 * 60 * 60 * 24) // Convert to days
  }

  const getTodoData = () => {
    const categoryCount = todos.reduce(
      (acc, todo) => {
        acc[todo.category] = (acc[todo.category] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    return Object.entries(categoryCount).map(([category, count]) => ({
      category,
      count,
    }))
  }

  const getNoteData = () => {
    const categoryCount = notes.reduce(
      (acc, note) => {
        acc[note.category] = (acc[note.category] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    return Object.entries(categoryCount).map(([category, count]) => ({
      category,
      count,
    }))
  }

  const getTransactionData = () => {
    const monthlyData = transactions.reduce(
      (acc, t) => {
        const month = t.date.slice(0, 7) // YYYY-MM
        if (!acc[month]) {
          acc[month] = { income: 0, expense: 0 }
        }
        acc[month][t.type] += t.amount
        return acc
      },
      {} as Record<string, { income: number; expense: number }>,
    )

    return Object.entries(monthlyData)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, data]) => ({
        month,
        income: data.income,
        expense: data.expense,
      }))
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Analytics</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Overall Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{getCompletionRate().toFixed(1)}%</div>
            <p className="text-sm text-muted-foreground">Tasks completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Average Completion Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{getAverageCompletionTime().toFixed(1)}</div>
            <p className="text-sm text-muted-foreground">Days per task</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Data Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="todos">
            <TabsList>
              <TabsTrigger value="todos">Todos</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
              <TabsTrigger value="budget">Budget</TabsTrigger>
            </TabsList>
            <TabsContent value="todos">
              <ChartContainer
                config={{
                  count: {
                    label: "Count",
                    color: "hsl(var(--chart-1))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getTodoData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="count" fill="var(--color-count)" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </TabsContent>
            <TabsContent value="notes">
              <ChartContainer
                config={{
                  count: {
                    label: "Count",
                    color: "hsl(var(--chart-2))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={getNoteData()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {getNoteData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </TabsContent>
            <TabsContent value="budget">
              <ChartContainer
                config={{
                  income: {
                    label: "Income",
                    color: "hsl(var(--chart-3))",
                  },
                  expense: {
                    label: "Expense",
                    color: "hsl(var(--chart-4))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={getTransactionData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey="income" stroke="var(--color-income)" />
                    <Line type="monotone" dataKey="expense" stroke="var(--color-expense)" />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

