'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, ArrowLeft, Users, Mail, Calendar, Shield } from 'lucide-react'
import Link from 'next/link'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'

interface User {
  id: string
  email: string
  full_name: string
  username: string
  role: 'user' | 'admin'
  created_at: string
}

export default function AdminUsersPage() {
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<User[]>([])
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null)

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users')

      if (!response.ok) {
        const userError = await response.json()
        throw new Error(`API responded with status: ${response.status}, ${userError.error}`)
      }

      const usersData = await response.json()

      setUsers(usersData || [])
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error('Error fetching users')
    }
  }

  useEffect(() => {
    fetchUsers().finally(() => {
      setLoading(false)
    })
  }, [])

  const updateUserRole = async (userId: string, newRole: 'user' | 'admin') => {
    setUpdatingUserId(userId)
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, newRole }),
      })

      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`)
      }
      toast.success('User role updated successfully!')
      await fetchUsers()
    } catch (error) {
      console.error('Error updating user role:', error)
      toast.error('Failed to update user role. Please try again.')
    } finally {
      setUpdatingUserId(null)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card">
        <div className="flex flex-col items-start justify-between  px-6 py-4">
          <Link href="/admin">
            <Button variant="ghost" className="text-primary" size="sm">
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">User Management</h1>
            <p className="text-sm text-muted-foreground">View and manage user accounts</p>
          </div>
        </div>
      </div>
      <main className="p-6 max-w-7xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              All Users ({users.length})
            </CardTitle>
            <CardDescription>Manage user accounts and permissions</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="text-center">
                  <p className="text-primary">Loading...</p>
                </div>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map(user => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          <div>
                            <p className="font-semibold">{user.full_name || 'Unavailable'}</p>
                            <p className="text-sm text-muted-foreground">@{user.username}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">{user.email}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                            {user.role === 'admin' && <Shield className="w-3 h-3 mr-1" />}
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            {new Date(user.created_at).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Select
                            value={user.role}
                            onValueChange={(value: 'user' | 'admin') =>
                              updateUserRole(user.id, value)
                            }
                            disabled={updatingUserId === user.id}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="user">User</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {users.length === 0 && (
                  <div className="text-center py-12">
                    <Users className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">No users found</p>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
