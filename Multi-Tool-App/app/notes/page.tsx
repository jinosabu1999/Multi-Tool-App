"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Search, Trash2, Plus, Star } from "lucide-react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
// import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

type Note = {
  id: number
  title: string
  content: string
  category: string
  color: string
  createdAt: string
  tags: string[]
  isFavorite: boolean
}

const categories = ["personal", "work", "ideas", "tasks"]
const colors = ["default", "red", "green", "blue", "purple", "yellow"]
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"]

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([])
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [category, setCategory] = useState("personal")
  const [color, setColor] = useState("default")
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState("all")
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")
  const [sortBy, setSortBy] = useState<"date" | "title" | "category">("date")
  const [isAddNoteOpen, setIsAddNoteOpen] = useState(false)

  useEffect(() => {
    const savedNotes = localStorage.getItem("notes")
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("notes", JSON.stringify(notes))
  }, [notes])

  const addNote = () => {
    if (title.trim() && content.trim()) {
      setNotes([
        {
          id: Date.now(),
          title,
          content,
          category,
          color,
          createdAt: new Date().toISOString(),
          tags,
          isFavorite: false,
        },
        ...notes,
      ])
      setTitle("")
      setContent("")
      setColor("default")
      setTags([])
      setIsAddNoteOpen(false)
    }
  }

  const deleteNote = (id: number) => {
    setNotes(notes.filter((note) => note.id !== id))
  }

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()])
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const toggleFavorite = (id: number) => {
    setNotes(notes.map((note) => (note.id === id ? { ...note, isFavorite: !note.isFavorite } : note)))
  }

  const sortNotes = (notesToSort: Note[]) => {
    return [...notesToSort].sort((a, b) => {
      switch (sortBy) {
        case "title":
          return a.title.localeCompare(b.title)
        case "category":
          return a.category.localeCompare(b.category)
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
    })
  }

  const filteredNotes = sortNotes(
    notes.filter((note) => {
      const matchesFilter = filter === "all" || filter === note.category
      const matchesSearch =
        note.title.toLowerCase().includes(search.toLowerCase()) ||
        note.content.toLowerCase().includes(search.toLowerCase()) ||
        note.category.toLowerCase().includes(search.toLowerCase()) ||
        note.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase()))
      return matchesFilter && matchesSearch
    }),
  )

  const getColorClass = (noteColor: string) => {
    switch (noteColor) {
      case "red":
        return "bg-red-100 dark:bg-red-900/20 border-red-200 dark:border-red-800/30"
      case "green":
        return "bg-green-100 dark:bg-green-900/20 border-green-200 dark:border-green-800/30"
      case "blue":
        return "bg-blue-100 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800/30"
      case "purple":
        return "bg-purple-100 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800/30"
      case "yellow":
        return "bg-yellow-100 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800/30"
      default:
        return "bg-background border-border"
    }
  }

  const getCategoryData = () => {
    const categoryCount = notes.reduce(
      (acc, note) => {
        acc[note.category] = (acc[note.category] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    return Object.entries(categoryCount).map(([category, count]) => ({
      name: category,
      value: count,
    }))
  }

  return (
    <div className="space-y-4 pb-16">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Notes</h1>
          <Select value={sortBy} onValueChange={(value: "date" | "title" | "category") => setSortBy(value)}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="title">Title</SelectItem>
              <SelectItem value="category">Category</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Add New Note</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input type="text" placeholder="Note title" value={title} onChange={(e) => setTitle(e.target.value)} />
              <Textarea
                placeholder="Note content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={5}
              />
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Add tag"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addTag()}
                  className="flex-1"
                />
                <Button onClick={addTag} variant="outline" className="shrink-0">
                  Add Tag
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex gap-1 flex-wrap">
                  {tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="cursor-pointer text-xs"
                      onClick={() => removeTag(tag)}
                    >
                      {tag} ×
                    </Badge>
                  ))}
                </div>
              )}
              <div className="grid grid-cols-2 gap-2">
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
                <Select value={color} onValueChange={setColor}>
                  <SelectTrigger>
                    <SelectValue placeholder="Color" />
                  </SelectTrigger>
                  <SelectContent>
                    {colors.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c.charAt(0).toUpperCase() + c.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={addNote} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Add Note
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notes Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full h-[250px] sm:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={getCategoryData()}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius="80%"
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {getCategoryData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload
                        return (
                          <div className="bg-background border rounded p-2 shadow-md">
                            <p className="font-semibold">{data.name}</p>
                            <p>Count: {data.value}</p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4">
              <CardTitle>Notes</CardTitle>
              <div className="flex flex-col sm:flex-row gap-2">
                <Select value={filter} onValueChange={setFilter}>
                  <SelectTrigger className="w-full sm:w-[150px]">
                    <SelectValue placeholder="Filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search notes..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-8 w-full"
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {filteredNotes.map((note) => (
                <Card key={note.id} className={`${getColorClass(note.color)} border`}>
                  <CardHeader className="p-4">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg truncate">{note.title}</CardTitle>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <Badge variant="outline" className="text-xs">
                            {note.category}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(note.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleFavorite(note.id)}
                          className={note.isFavorite ? "text-yellow-500" : ""}
                        >
                          <Star className="h-4 w-4" fill={note.isFavorite ? "currentColor" : "none"} />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => deleteNote(note.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="px-4 pb-4">
                    <p className="whitespace-pre-wrap text-sm">{note.content}</p>
                    {note.tags.length > 0 && (
                      <div className="flex gap-1 flex-wrap mt-2">
                        {note.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
              {filteredNotes.length === 0 && (
                <p className="text-center text-muted-foreground py-4 col-span-full">No notes found</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

