'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Bug, Lightbulb, ExternalLink, User } from 'lucide-react'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'

type Feedback = {
  id: number
  type: 'bug' | 'feature'
  description: string
  screenshot_url: string | null
  user_id: string | null
  user_name: string | null
  user_email: string | null
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  created_at: string
}

const statusColors: Record<string, string> = {
  open: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  in_progress: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  resolved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  closed: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
}

const statusLabels: Record<string, string> = {
  open: 'Open',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  closed: 'Closed',
}

export default function AdminFeedback({ initialFeedback }: { initialFeedback: Feedback[] }) {
  const [feedback, setFeedback] = useState<Feedback[]>(initialFeedback)
  const [updatingId, setUpdatingId] = useState<number | null>(null)

  const updateStatus = async (id: number, status: string) => {
    setUpdatingId(id)
    try {
      const res = await fetch('/api/admin/feedback', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      })

      if (!res.ok) throw new Error('Failed to update status')

      setFeedback(prev =>
        prev.map(f => (f.id === id ? { ...f, status: status as Feedback['status'] } : f)),
      )
      toast.success(`Status updated to ${statusLabels[status]}`)
    } catch {
      toast.error('Failed to update status')
    } finally {
      setUpdatingId(null)
    }
  }

  const filterFeedback = (type?: 'bug' | 'feature') => {
    if (!type) return feedback
    return feedback.filter(f => f.type === type)
  }

  const renderTable = (items: Feedback[]) => (
    <Card>
      <CardContent className="p-0">
        {items.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">No feedback items found.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="w-[140px]">User</TableHead>
                <TableHead className="w-[130px]">Status</TableHead>
                <TableHead className="w-[100px]">Date</TableHead>
                <TableHead className="w-[60px]">Media</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map(item => (
                <TableRow key={item.id}>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        item.type === 'bug'
                          ? 'border-red-300 text-red-600 dark:text-red-400'
                          : 'border-amber-300 text-amber-600 dark:text-amber-400'
                      }
                    >
                      {item.type === 'bug' ? (
                        <Bug className="w-3 h-3 mr-1" />
                      ) : (
                        <Lightbulb className="w-3 h-3 mr-1" />
                      )}
                      {item.type === 'bug' ? 'Bug' : 'Feature'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm line-clamp-2 max-w-md">{item.description}</p>
                  </TableCell>
                  <TableCell>
                    {item.user_name ? (
                      <div className="flex items-center gap-1.5">
                        <User className="w-3 h-3 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{item.user_name}</p>
                          <p className="text-xs text-muted-foreground">{item.user_email}</p>
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground italic">Anonymous</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Select
                      defaultValue={item.status}
                      onValueChange={value => updateStatus(item.id, value)}
                      disabled={updatingId === item.id}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(statusLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            <span
                              className={`inline-flex items-center gap-1.5 px-1.5 py-0.5 rounded text-xs font-medium ${statusColors[value]}`}
                            >
                              {label}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                    </span>
                  </TableCell>
                  <TableCell>
                    {item.screenshot_url && (
                      <a
                        href={item.screenshot_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary/80"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )

  const openCount = feedback.filter(f => f.status === 'open').length
  const bugCount = feedback.filter(f => f.type === 'bug').length
  const featureCount = feedback.filter(f => f.type === 'feature').length

  return (
    <main className="p-6 max-w-7xl mx-auto">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Feedback
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{feedback.length}</p>
          </CardContent>
        </Card>
        <Card className="border-red-200/50 dark:border-red-900/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-600 dark:text-red-400 flex items-center gap-1.5">
              <Bug className="w-4 h-4" />
              Bug Reports
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{bugCount}</p>
          </CardContent>
        </Card>
        <Card className="border-amber-200/50 dark:border-amber-900/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4" />
              Feature Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{featureCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Feedback Tabs */}
      <Tabs defaultValue="all">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All ({feedback.length})</TabsTrigger>
          <TabsTrigger value="bugs">Bugs ({bugCount})</TabsTrigger>
          <TabsTrigger value="features">Features ({featureCount})</TabsTrigger>
        </TabsList>

        <TabsContent value="all">{renderTable(filterFeedback())}</TabsContent>
        <TabsContent value="bugs">{renderTable(filterFeedback('bug'))}</TabsContent>
        <TabsContent value="features">{renderTable(filterFeedback('feature'))}</TabsContent>
      </Tabs>
    </main>
  )
}
