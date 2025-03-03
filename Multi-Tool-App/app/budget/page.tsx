"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type Transaction = {
  id: number
  type: "income" | "expense"
  category: string
  amount: number
  description: string
  date: string
}

type Currency = {
  code: string
  symbol: string
}

const currencies: Currency[] = [
  { code: "INR", symbol: "₹" },
  { code: "USD", symbol: "$" },
  { code: "EUR", symbol: "€" },
  { code: "GBP", symbol: "£" },
]

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"]

export default function BudgetPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [type, setType] = useState<"income" | "expense">("expense")
  const [category, setCategory] = useState("")
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const [currency, setCurrency] = useState<Currency>(currencies[0])

  useEffect(() => {
    const savedTransactions = localStorage.getItem("budgetTransactions")
    const savedCurrency = localStorage.getItem("budgetCurrency")
    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions))
    }
    if (savedCurrency) {
      setCurrency(JSON.parse(savedCurrency))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("budgetTransactions", JSON.stringify(transactions))
  }, [transactions])

  useEffect(() => {
    localStorage.setItem("budgetCurrency", JSON.stringify(currency))
  }, [currency])

  const addTransaction = () => {
    if (!category.trim() || !amount.trim()) {
      return
    }

    const parsedAmount = Number.parseFloat(amount)
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return
    }

    setTransactions([
      {
        id: Date.now(),
        type,
        category: category.trim(),
        amount: parsedAmount,
        description: description.trim(),
        date: new Date().toISOString().split("T")[0],
      },
      ...transactions,
    ])

    // Reset form
    setCategory("")
    setAmount("")
    setDescription("")
    setType("expense")
  }

  const totalIncome = transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)
  const totalExpenses = transactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)
  const balance = totalIncome - totalExpenses

  const getCategoryData = () => {
    const categoryData = transactions.reduce(
      (acc, t) => {
        if (!acc[t.category]) {
          acc[t.category] = { income: 0, expense: 0 }
        }
        acc[t.category][t.type] += t.amount
        return acc
      },
      {} as Record<string, { income: number; expense: number }>,
    )

    return Object.entries(categoryData).map(([category, data]) => ({
      category,
      income: data.income,
      expense: data.expense,
    }))
  }

  const getMonthlyData = () => {
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
    <div className="space-y-6 pb-16">
      <h1 className="text-3xl font-bold">Budget Tracker</h1>

      {/* Transaction Form Card */}
      <Card>
        <CardHeader>
          <CardTitle>Add Transaction</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              addTransaction()
            }}
            className="space-y-4"
          >
            <div className="flex flex-col sm:flex-row gap-2">
              <Select
                value={currency.code}
                onValueChange={(value) => setCurrency(currencies.find((c) => c.code === value) || currencies[0])}
              >
                <SelectTrigger className="w-full sm:w-[100px]">
                  <SelectValue placeholder="Currency" />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((curr) => (
                    <SelectItem key={curr.code} value={curr.code}>
                      {curr.code} ({curr.symbol})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={type}
                onValueChange={(value: "income" | "expense") => setType(value)}
                className="w-full sm:flex-1"
              >
                <SelectTrigger>
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Input
              type="text"
              placeholder="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            />
            <Input
              type="number"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0.01"
              step="0.01"
              required
            />
            <Input
              type="text"
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <Button type="submit" className="w-full">
              Add Transaction
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Income</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">
              {currency.symbol}
              {totalIncome.toFixed(2)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">
              {currency.symbol}
              {totalExpenses.toFixed(2)}
            </p>
          </CardContent>
        </Card>
        <Card className="sm:col-span-2 lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${balance >= 0 ? "text-green-600" : "text-red-600"}`}>
              {currency.symbol}
              {balance.toFixed(2)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Analysis Section */}
      <Card>
        <CardHeader>
          <CardTitle>Budget Analysis</CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <Tabs defaultValue="monthly" className="w-full">
            <TabsList className="w-full h-auto grid grid-cols-1 sm:grid-cols-3 gap-1 bg-muted p-1 rounded-lg">
              <TabsTrigger
                value="monthly"
                className="rounded-md px-3 py-2 ring-offset-background transition-all hover:bg-background data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
              >
                Monthly Trend
              </TabsTrigger>
              <TabsTrigger
                value="category"
                className="rounded-md px-3 py-2 ring-offset-background transition-all hover:bg-background data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
              >
                Category Breakdown
              </TabsTrigger>
              <TabsTrigger
                value="income-expense"
                className="rounded-md px-3 py-2 ring-offset-background transition-all hover:bg-background data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
              >
                Income vs Expense
              </TabsTrigger>
            </TabsList>

            <div className="mt-4 sm:mt-6 p-4">
              <TabsContent value="monthly" className="h-[300px] sm:h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={getMonthlyData()} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={60} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="income" stroke="#8884d8" />
                    <Line type="monotone" dataKey="expense" stroke="#82ca9d" />
                  </LineChart>
                </ResponsiveContainer>
              </TabsContent>

              <TabsContent value="category" className="h-[300px] sm:h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getCategoryData()} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={60} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="income" fill="#8884d8" />
                    <Bar dataKey="expense" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </TabsContent>

              <TabsContent value="income-expense" className="h-[300px] sm:h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Income", value: totalIncome },
                        { name: "Expense", value: totalExpenses },
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {[
                        { name: "Income", value: totalIncome },
                        { name: "Expense", value: totalExpenses },
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {transactions
              .slice(-5)
              .reverse()
              .map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-2 bg-secondary rounded-md gap-2"
                >
                  <div>
                    <p className="font-semibold">{transaction.category}</p>
                    <p className="text-sm text-muted-foreground">{transaction.description}</p>
                  </div>
                  <p className={`${transaction.type === "income" ? "text-green-600" : "text-red-600"} font-semibold`}>
                    {currency.symbol}
                    {transaction.amount.toFixed(2)}
                  </p>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

