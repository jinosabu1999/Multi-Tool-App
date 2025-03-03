"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, Search, CalendarIcon, CheckCircle2 } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Progress } from "@/components/ui/progress"

type Todo = {
  id: number
  text: string
  completed: boolean
  category: string
  priority: "low" | "medium" | "high"
  dueDate?: string
  completedAt?: string
}

const priorities = {
  low: { label: "Low", color: "bg-green-500/20 text-green-700 dark:bg-green-500/30 dark:text-green-400" },
  medium: { label: "Medium", color: "bg-yellow-500/20 text-yellow-700 dark:bg-yellow-500/30 dark:text-yellow-400" },
  high: { label: "High", color: "bg-red-500/20 text-red-700 dark:bg-red-500/30 dark:text-red-400" },
}

export default function TodoPage() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [newTodo, setNewTodo] = useState("")
  const [category, setCategory] = useState("personal")
  const [priority, setPriority] = useState<"low" | "medium" | "high">("low")
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined)
  const [filter, setFilter] = useState("all")
  const [search, setSearch] = useState("")

  useEffect(() => {
    const savedTodos = localStorage.getItem("todos")
    if (savedTodos) {
      setTodos(JSON.parse(savedTodos))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("todos", JSON.stringify(todos))
  }, [todos])

  const addTodo = () => {
    if (newTodo.trim()) {
      setTodos([
        ...todos,
        {
          id: Date.now(),
          text: newTodo,
          completed: false,
          category,
          priority,
          dueDate: dueDate ? dueDate.toISOString().split("T")[0] : undefined,
        },
      ])
      setNewTodo("")
      setDueDate(undefined)
    }
  }

  const toggleTodo = (id: number) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id
          ? {
              ...todo,
              completed: !todo.completed,
              completedAt: !todo.completed ? new Date().toISOString() : undefined,
            }
          : todo,
      ),
    )
  }

  const deleteTodo = (id: number) => {
    setTodos(todos.filter((todo) => todo.id !== id))
  }

  const filteredTodos = todos.filter((todo) => {
    const matchesFilter =
      filter === "all" ||
      (filter === "completed" && todo.completed) ||
      (filter === "active" && !todo.completed) ||
      filter === todo.category

    const matchesSearch =
      todo.text.toLowerCase().includes(search.toLowerCase()) ||
      todo.category.toLowerCase().includes(search.toLowerCase())

    return matchesFilter && matchesSearch
  })

  const categories = ["personal", "work", "shopping", "health"]

  const getCompletionRate = () => {
    const completedTodos = todos.filter((todo) => todo.completed).length
    return todos.length > 0 ? (completedTodos / todos.length) * 100 : 0
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Todo List</h1>
        <p className="text-muted-foreground">Manage your tasks and stay organized</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Add New Task</CardTitle>
            <CardDescription>Create a new task with details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <Input
                  type="text"
                  placeholder="What needs to be done?"
                  value={newTodo}
                  onChange={(e) => setNewTodo(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addTodo()}
                  className="flex-1"
                />
                <Button onClick={addTodo} className="whitespace-nowrap">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Task
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={priority} onValueChange={(value: "low" | "medium" | "high") => setPriority(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(priorities).map(([key, { label }]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn("w-full justify-start text-left font-normal", !dueDate && "text-muted-foreground")}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dueDate ? format(dueDate, "PPP") : <span>Due date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={dueDate} onSelect={setDueDate} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Progress Overview</CardTitle>
            <CardDescription>Track your task completion</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Completion rate</span>
                <span className="text-sm font-medium">{getCompletionRate().toFixed(0)}%</span>
              </div>
              <Progress value={getCompletionRate()} className="h-2" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg border p-3">
                <div className="text-xs font-medium text-muted-foreground">Total Tasks</div>
                <div className="mt-1 text-2xl font-bold">{todos.length}</div>
              </div>
              <div className="rounded-lg border p-3">
                <div className="text-xs font-medium text-muted-foreground">Completed</div>
                <div className="mt-1 text-2xl font-bold">{todos.filter((t) => t.completed).length}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="sticky top-0 z-10 bg-background">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <CardTitle>Tasks</CardTitle>
            <div className="flex gap-2">
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tasks..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {filteredTodos.map((todo) => (
              <div
                key={todo.id}
                className={`flex items-center space-x-4 p-3 rounded-lg border ${todo.completed ? "bg-muted/50" : ""}`}
              >
                <Checkbox
                  id={`todo-${todo.id}`}
                  checked={todo.completed}
                  onCheckedChange={() => toggleTodo(todo.id)}
                  className="data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                />
                <div className="flex-1 min-w-0">
                  <label
                    htmlFor={`todo-${todo.id}`}
                    className={`block font-medium ${todo.completed ? "line-through text-muted-foreground" : ""}`}
                  >
                    {todo.text}
                  </label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {todo.category}
                    </Badge>
                    <Badge className={`text-xs ${priorities[todo.priority].color}`}>
                      {priorities[todo.priority].label}
                    </Badge>
                    {todo.dueDate && (
                      <Badge variant="outline" className="text-xs">
                        Due: {format(new Date(todo.dueDate), "MMM d")}
                      </Badge>
                    )}
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => deleteTodo(todo.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {filteredTodos.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <CheckCircle2 className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium">No tasks found</h3>
                <p className="text-muted-foreground">Add a new task or change your filters</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

