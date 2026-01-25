'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { CheckCircle, XCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { format } from 'date-fns'
import { toast } from 'sonner'

interface PendingResource {
  id: number
  title: string
  description: string
  file_type: string
  courses: {
    academic_levels: {
      level_number: string
    }
  }
  file_size_bytes: number
  upload_date: string
  users?: {
    email: string
    username: string
  } | null
}

const rejectionReasons = [
  'Poor file quality or corrupted',
  'Inappropriate or offensive content',
  'Duplicate submission',
  'Incorrect classification',
  'Other - please specify',
]

interface AdminResourceProps {
  initialResources: PendingResource[]
}

export default function AdminResource({ initialResources }: AdminResourceProps) {
  const [pendingFiles, setPendingFiles] = useState<PendingResource[]>(initialResources)
  const [selectedFile, setSelectedFile] = useState<PendingResource | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [rejectionNotes, setRejectionNotes] = useState('')
  const [processing, setProcessing] = useState(false)

  const handleApprove = async (resourceId: string) => {
    setProcessing(true)

    try {
      const response = await fetch(`/api/resources/${resourceId}/approve`, {
        method: 'POST',
      })

      if (!response.ok) throw new Error('Response Approval failed')

      toast.success('success', { description: 'File approved successfully' })
      setPendingFiles(pendingFiles.filter(r => r.id.toString() !== resourceId))
    } catch (error: unknown) {
      toast.error('Error', {
        description: error instanceof Error ? error.message : 'Approval failed',
      })
    } finally {
      setProcessing(false)
    }
  }

  const handleReject = async () => {
    if (!selectedFile) return

    if (!rejectionReason) {
      toast.error('Error', { description: 'Please select a rejection reason' })
      return
    }

    setProcessing(true)

    try {
      const fullReason =
        rejectionReason === 'Other - please specify' ? rejectionNotes : rejectionReason

      const response = await fetch(`/api/resources/${selectedFile.id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: fullReason }),
      })

      if (!response.ok) throw new Error('Rejection failed')

      toast.success('Success', { description: 'Resource rejected. User will be notified.' })
      setPendingFiles(pendingFiles.filter(r => r.id !== selectedFile.id))
      setSelectedFile(null)
      setRejectionReason('')
      setRejectionNotes('')
    } catch (error: unknown) {
      toast.error('Error', {
        description: error instanceof Error ? error.message : 'Rejection failed',
      })
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        <Link href="/admin">
          <span className="flex text-sm mb-4 text-primary ">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </span>
        </Link>

        <h1 className="text-4xl font-bold text-foreground mb-2">Pending Reviews</h1>
        <p className="text-muted-foreground mb-8">
          {pendingFiles.length} file{pendingFiles.length !== 1 ? 's' : ''} waiting for approval
        </p>

        {pendingFiles.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">No pending reviews</h3>
              <p className="text-muted-foreground">All resources have been reviewed!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {pendingFiles.map(resource => (
              <Card key={resource.id} className="hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl">{resource.title}</CardTitle>
                      <CardDescription>
                        {resource.users
                          ? `Uploaded by ${resource.users.username || 'Unknown'} (${resource.users.email || 'No email'})`
                          : 'Uploaded by MCL Team'}
                      </CardDescription>
                    </div>
                    <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded">
                      {format(new Date(resource.upload_date), 'yyyy-MM-dd')}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground mb-1">Description</p>
                    <p className="text-sm text-foreground whitespace-pre-wrap break-all">
                      {resource.description || 'No description provided'}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground">File Type</p>
                      <p className="text-sm text-foreground capitalize">{resource.file_type}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground">File Size</p>
                      <p className="text-sm text-foreground">
                        {(resource.file_size_bytes / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground">Level</p>
                      <p className="text-sm text-foreground">
                        {resource.courses?.academic_levels?.level_number}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground">Status</p>
                      <p className="text-sm text-foreground font-semibold">Pending</p>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={() => handleApprove(resource.id.toString())}
                      disabled={processing}
                      className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4" />
                      {processing ? 'Approving...' : 'Approve'}
                    </Button>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          onClick={() => setSelectedFile(resource)}
                          disabled={processing}
                          className="flex items-center gap-2 text-destructive border-destructive hover:bg-red-50"
                        >
                          <XCircle className="w-4 h-4" />
                          Reject
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>Reject Resource</DialogTitle>
                          <DialogDescription>
                            Provide a reason for rejecting this resource. The user will be notified.
                          </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-semibold mb-2 block">
                              Rejection Reason *
                            </label>
                            <Select value={rejectionReason} onValueChange={setRejectionReason}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select reason" />
                              </SelectTrigger>
                              <SelectContent>
                                {rejectionReasons.map(reason => (
                                  <SelectItem key={reason} value={reason}>
                                    {reason}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {rejectionReason === 'Other - please specify' && (
                            <div>
                              <label className="text-sm font-semibold mb-2 block">
                                Additional Notes
                              </label>
                              <Textarea
                                placeholder="Explain why this resource is being rejected..."
                                value={rejectionNotes}
                                onChange={e => setRejectionNotes(e.target.value)}
                                rows={4}
                              />
                            </div>
                          )}

                          <Button
                            onClick={handleReject}
                            disabled={processing || !rejectionReason}
                            className="w-full bg-destructive hover:bg-destructive/90"
                          >
                            {processing ? 'Processing...' : 'Send Rejection'}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
