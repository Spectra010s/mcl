'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader } from '@/components/ui/loader'
import { Upload } from 'lucide-react'
import { toast } from 'sonner'
import * as uploadApi from '@/lib/api/upload'
import { useUser } from '@/hooks/useUser'

type InputEvent = React.ChangeEvent<HTMLInputElement>

export default function UploadClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [formData, setFormData] = useState({
    title: searchParams.get('title') || '',
    description: searchParams.get('description') || '',
    facultyId: searchParams.get('facultyId') || '',
    departmentId: searchParams.get('departmentId') || '',
    levelId: searchParams.get('levelId') || '',
    courseId: searchParams.get('courseId') || '',
  })
  const [file, setFile] = useState<File | null>(null)
  const [dragging, setDragging] = useState(false)
  const hasRestoredToast = useRef(false)

  const { user } = useUser()

  useEffect(() => {
    const hasData =
      searchParams.get('title') ||
      searchParams.get('fileName') ||
      searchParams.get('facultyId') ||
      searchParams.get('description')

    // If we have data in the URL and haven't shown the toast yet
    if (hasData && !hasRestoredToast.current) {
      hasRestoredToast.current = true
      const fileName = searchParams.get('fileName')

      const restorationMessage = fileName
        ? `We've restored your form. Please re-select "${fileName}" to finish your upload.`
        : "We've restored your form progress. You can now complete your upload."

      toast.info('Welcome back!', {
        description: restorationMessage,
        duration: 8000,
      })

      // Clean up URL parameters to prevent re-triggering if component remounts
      const newParams = new URLSearchParams(searchParams.toString())
      newParams.delete('title')
      newParams.delete('description')
      newParams.delete('facultyId')
      newParams.delete('departmentId')
      newParams.delete('levelId')
      newParams.delete('courseId')
      newParams.delete('fileName')
      const newQuery = newParams.toString()
      const newUrl = `${window.location.pathname}${newQuery ? `?${newQuery}` : ''}`
      window.history.replaceState(null, '', newUrl)
    }
  }, [searchParams])

  const { data: faculties = [], isLoading: isLoadingFaculties } = useQuery<uploadApi.Faculty[]>({
    queryKey: ['faculties'],
    queryFn: uploadApi.fetchFaculties,
  })

  const { data: departmentsData = [], isFetching: isFetchingDepartments } = useQuery<
    uploadApi.Department[]
  >({
    queryKey: ['departments', formData.facultyId],
    queryFn: () => uploadApi.fetchDepartments(formData.facultyId),
    enabled: !!formData.facultyId,
  })

  const { data: levelsData = [], isFetching: isFetchingLevels } = useQuery<uploadApi.Level[]>({
    queryKey: ['levels', formData.departmentId],
    queryFn: () => uploadApi.fetchLevels(formData.departmentId),
    enabled: !!formData.departmentId,
  })

  const { data: coursesData = [], isFetching: isFetchingCourses } = useQuery<uploadApi.Course[]>({
    queryKey: ['courses', formData.levelId],
    queryFn: () => uploadApi.fetchCourses(formData.levelId),
    enabled: !!formData.levelId,
  })

  const departments = formData.facultyId ? departmentsData : []
  const levels = formData.departmentId ? levelsData : []
  const courses = formData.levelId ? coursesData : []

  const handleFacultyChange = (facultyId: string) => {
    setFormData(prev => ({
      ...prev,
      facultyId,
      departmentId: '',
      levelId: '',
      courseId: '',
    }))
  }

  const handleDeptChange = (departmentId: string) => {
    setFormData(prev => ({
      ...prev,
      departmentId,
      levelId: '',
      courseId: '',
    }))
  }

  const handleLevelChange = (levelId: string) => {
    setFormData(prev => ({
      ...prev,
      levelId,
      courseId: '',
    }))
  }

  const getFileTypeFromExtension = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase() || ''
    const typeMap: { [key: string]: string } = {
      pdf: 'pdf',
      doc: 'document',
      docx: 'document',
      ppt: 'presentation',
      pptx: 'presentation',
      txt: 'text',
      jpg: 'image',
      jpeg: 'image',
      png: 'image',
      gif: 'image',
      mp3: 'audio',
      mp4: 'video',
      avi: 'video',
      mov: 'video',
    }
    return typeMap[ext] || 'other'
  }

  const isFileSupported = (filename: string) => {
    return getFileTypeFromExtension(filename) !== 'other'
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const uploadedFile = e.target.files[0]

      if (isFileSupported(uploadedFile.name)) {
        setFile(uploadedFile)
      } else {
        setFile(null)
        toast.error(
          `Unsupported file type: ${uploadedFile.name.split('.').pop()}. Please upload a document, presentation, or image.`,
        )
        e.target.value = ''
      }
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    if (isUploading) return
    e.preventDefault()
    setDragging(true)
  }

  const handleDragLeave = () => {
    if (isUploading) return
    setDragging(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    if (isUploading) return
    e.preventDefault()
    setDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0]
      if (isFileSupported(droppedFile.name)) {
        setFile(droppedFile)
      } else {
        setFile(null)
        toast.error(
          `Unsupported file type: ${droppedFile.name.split('.').pop()}. Please drop a document, presentation, or image.`,
        )
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      const message = file
        ? `Please login to continue uploading ${file.name}`
        : 'Please login to complete your upload and contribute to the community.'

      const params = new URLSearchParams()
      if (formData.title) params.set('title', formData.title)
      if (formData.description) params.set('description', formData.description.slice(0, 200))
      if (formData.facultyId) params.set('facultyId', formData.facultyId)
      if (formData.departmentId) params.set('departmentId', formData.departmentId)
      if (formData.levelId) params.set('levelId', formData.levelId)
      if (formData.courseId) params.set('courseId', formData.courseId)
      if (file) params.set('fileName', file.name)

      const returnPath = `/upload?${params.toString()}`
      const loginUrl = `/login?returnTo=${encodeURIComponent(returnPath)}&toast_message=${encodeURIComponent(message)}`

      router.push(loginUrl)
      return
    }

    if (
      !formData.title ||
      !formData.facultyId ||
      !formData.departmentId ||
      !formData.levelId ||
      !formData.courseId ||
      !file
    ) {
      toast.error('Please fill in all required fields')
      return
    }
    uploadMutation.mutate()
  }

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated')

      const autoDetectedType = getFileTypeFromExtension(file!.name)
      await uploadApi.uploadResource({
        title: formData.title,
        description: formData.description,
        courseId: formData.courseId,
        file: file!,
        fileType: autoDetectedType,
        userId: user.id,
      })
    },
    onSuccess: () => {
      toast.success('Success', {
        description: `File uploaded successfully! It will appear after approval.
         Thanks for Contributing to MCL `,
      })
      setFormData({
        title: '',
        description: '',
        facultyId: '',
        departmentId: '',
        levelId: '',
        courseId: '',
      })
      setFile(null)
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed'
      toast.error('Upload Error', { description: errorMessage })
    },
  })

  const isUploading = uploadMutation.isPending

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-primary mb-2">Upload Resource</h1>
      <p className="text-muted-foreground mb-6">Share academic materials with the community</p>

      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle>New Upload</CardTitle>
          <CardDescription>Fill in the details and upload your file</CardDescription>
        </CardHeader>
        <CardContent className="relative">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information Section */}
            <div className="space-y-4">
              <h3 className="font-semibold text-primary">Basic Information</h3>

              <div className="grid gap-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e: InputEvent) =>
                    setFormData(prev => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="Enter the title for the file"
                  className="border-primary/30"
                  disabled={isUploading}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setFormData(prev => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="A short description on the content (e.g. Lecture notes covering modules 1-3)."
                  rows={4}
                  className="border-primary/30"
                  disabled={isUploading}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-primary">Classification</h3>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="faculty">Faculty *</Label>
                  <Select
                    value={formData.facultyId}
                    onValueChange={handleFacultyChange}
                    disabled={isLoadingFaculties || isUploading}
                  >
                    <SelectTrigger className="w-full border-primary/30">
                      <SelectValue placeholder="Select Faculty" />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingFaculties && (
                        <div className="flex items-center justify-center py-2">
                          <Loader size={16} className="text-primary" />
                        </div>
                      )}
                      {!isLoadingFaculties && faculties.length === 0 && (
                        <div className="px-3 py-2 text-sm text-muted-foreground">
                          No faculties available
                        </div>
                      )}
                      {faculties.map(f => (
                        <SelectItem key={f.id} value={String(f.id)}>
                          <span className="truncate block max-w-[260px] md:max-w-sm">
                            {f.full_name}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department">Department *</Label>
                  <Select
                    value={formData.departmentId}
                    onValueChange={handleDeptChange}
                    disabled={!formData.facultyId || isUploading}
                  >
                    <SelectTrigger className="w-full border-primary/30">
                      <SelectValue
                        placeholder={
                          formData.facultyId ? 'Select Department' : 'Select faculty first'
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {isFetchingDepartments && !formData.departmentId && formData.facultyId && (
                        <div className="flex items-center justify-center py-2">
                          <Loader size={16} className="text-primary" />
                        </div>
                      )}
                      {!isFetchingDepartments && formData.facultyId && departments.length === 0 && (
                        <div className="px-3 py-2 text-sm text-muted-foreground">
                          No departments available
                        </div>
                      )}
                      {departments.map(d => (
                        <SelectItem key={d.id} value={String(d.id)}>
                          <span className="truncate block max-w-[260px] md:max-w-sm">
                            {d.full_name}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="level">Academic Level *</Label>
                  <Select
                    value={formData.levelId}
                    onValueChange={handleLevelChange}
                    disabled={!formData.departmentId || isUploading}
                  >
                    <SelectTrigger className="w-full border-primary/30">
                      <SelectValue
                        placeholder={
                          formData.departmentId ? 'Select Level' : 'Select department first'
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {isFetchingLevels && !formData.levelId && formData.departmentId && (
                        <div className="flex items-center justify-center py-2">
                          <Loader size={16} className="text-primary" />
                        </div>
                      )}
                      {!isFetchingLevels && formData.departmentId && levels.length === 0 && (
                        <div className="px-3 py-2 text-sm text-muted-foreground">
                          No levels available
                        </div>
                      )}
                      {levels.map(l => (
                        <SelectItem key={l.id} value={String(l.id)}>
                          {l.level_number}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="course">Course *</Label>
                  <Select
                    value={formData.courseId}
                    onValueChange={value => setFormData(prev => ({ ...prev, courseId: value }))}
                    disabled={!formData.levelId || isUploading}
                  >
                    <SelectTrigger className="w-full border-primary/30">
                      <SelectValue
                        placeholder={formData.levelId ? 'Select Course' : 'Select level first'}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {isFetchingCourses && !formData.courseId && formData.levelId && (
                        <div className="flex items-center justify-center py-2">
                          <Loader size={16} className="text-primary" />
                        </div>
                      )}
                      {!isFetchingCourses && formData.levelId && courses.length === 0 && (
                        <div className="px-3 py-2 text-sm text-muted-foreground">
                          No courses available
                        </div>
                      )}
                      {courses.map(c => (
                        <SelectItem key={c.id} value={String(c.id)}>
                          <span className="truncate block max-w-[260px] md:max-w-sm">
                            {c.course_code}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* File Upload Section */}
            <div className="space-y-4">
              <h3 className="font-semibold text-primary">File Upload *</h3>

              <div className="grid gap-2">
                <div
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                    dragging ? 'border-primary/100 bg-primary/10' : 'border-primary/30'
                  } ${isUploading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onDragLeave={handleDragLeave}
                >
                  <input
                    id="file"
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={isUploading}
                  />
                  <label htmlFor="file" className="cursor-pointer block">
                    <Upload className="w-8 h-8 text-primary/40 mx-auto mb-2" />
                    {file ? (
                      <div className="max-w-[240px] w-full mx-auto px-2 overflow-hidden text-center">
                        <p className="font-semibold text-primary truncate w-full" title={file.name}>
                          {file.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {(file.size / 1024 / 1024).toFixed(2)} MB - Type:{' '}
                          {getFileTypeFromExtension(file.name)}
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="font-semibold text-primary">Click to upload</p>
                        <p className="text-sm text-muted-foreground">or drag and drop</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-secondary text-white"
              disabled={uploadMutation.isPending}
            >
              {uploadMutation.isPending ? (
                <span className="inline-flex items-center gap-2">
                  <Loader size={16} className="text-white" />
                  Uploading...
                </span>
              ) : (
                'Upload File'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
