'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
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
import { Upload } from 'lucide-react'
import { toast } from 'sonner'

interface Level {
  id: number
  level_number: number
}

interface Course {
  id: number
  course_code: string
}

interface Department {
  id: number
  full_name: string
}

interface Faculty {
  id: number
  full_name: string
}

export default function UploadPage() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [faculty, setFaculty] = useState('')
  const [department, setDepartment] = useState('')
  const [level, setLevel] = useState('')
  const [course, setCourse] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [faculties, setFaculties] = useState<Faculty[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [levels, setLevels] = useState<Level[]>([])
  const [courses, setCourses] = useState<Course[]>([])

  const supabase = createClient()

  useEffect(() => {
    const getFaculty = async () => {
      const { data: facultyData } = await supabase
        .from('faculties')
        .select('id, full_name')
        .order('full_name')

      if (facultyData) {
        setFaculties(facultyData)
      }
    }
    getFaculty()
  }, [supabase])

  const handleFacultyChange = async (facultyId: string) => {
    setFaculty(facultyId)
    setDepartment('')
    setLevel('')

    if (facultyId) {
      const { data: deptData } = await supabase
        .from('departments')
        .select('id, full_name')
        .eq('faculty_id', facultyId)
        .order('full_name')

      if (deptData) {
        setDepartments(deptData)
      }
    }
  }

  const handleDeptChange = async (departmentId: string) => {
    setDepartment(departmentId)
    setLevel('')

    if (departmentId) {
      const { data: levelData } = await supabase
        .from('academic_levels')
        .select('id, level_number')
        .eq('department_id', departmentId)
        .order('level_number')

      if (levelData) {
        setLevels(levelData)
      }
    }
  }

  const handleLevelChange = async (levelId: string) => {
    setLevel(levelId)
    setCourse('')

    if (levelId) {
      const { data: CourseData } = await supabase
        .from('courses')
        .select('id, course_code')
        .eq('academic_level_id', levelId)
        .order('course_code')

      if (CourseData) {
        setCourses(CourseData)
      }
    }
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
    e.preventDefault()
    setDragging(true)
  }

  const handleDragLeave = () => setDragging(false)

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
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

    if (!title || !description || !faculty || !department || !level || !course || !file) {
      toast.error('Please fill in all required fields')
      return
    }

    setLoading(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const autoDetectedType = getFileTypeFromExtension(file.name)

      const filePath = `${user.id}/${Date.now()}-${file.name}`

      const { error: uploadError } = await supabase.storage.from('mclib').upload(filePath, file)

      if (uploadError) {
        throw new Error('An Error Occured, Upload Failed.')
      }

      const { error: insertError } = await supabase.from('resources').insert({
        title,
        description,
        course_id: course,
        file_type: autoDetectedType,
        file_url: filePath,
        file_size_bytes: file.size,
        is_approved: false,
        uploaded_by: user.id,
      })

      if (insertError) {
        throw new Error('Upload Failed, Please try again')
      }

      toast.success('Success', {
        description: `File uploaded successfully! It will appear after approval.
         Thanks for Contributing to MCL `,
      })
      setTitle('')
      setDescription('')
      setFaculty('')
      setDepartment('')
      setLevel('')
      setCourse('')
      setFile(null)
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed'
      toast.error('Upload Error', { description: errorMessage })
    } finally {
      setLoading(false)
    }
  }

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
          {loading && (
            <div className="absolute inset-0 bg-white/50 z-50 flex flex-col items-center justify-center">
              <div className="animate-spin border-4 border-primary/50 border-t-primary rounded-full w-12 h-12 mb-2"></div>
              <p className="text-primary font-semibold">Uploading...</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information Section */}
            <div className="space-y-4">
              <h3 className="font-semibold text-primary">Basic Information</h3>

              <div className="grid gap-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Enter the title for the file"
                  className="border-primary/30"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="A short description on the content (e.g. Lecture notes covering modules 1-3)."
                  rows={4}
                  className="border-primary/30"
                  required
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-primary">Classification</h3>

              <div className="grid gap-2">
                <Label htmlFor="faculty">Select Faculty *</Label>
                <Select value={faculty} onValueChange={handleFacultyChange}>
                  <SelectTrigger className="border-primary/30">
                    <SelectValue placeholder="Select faculty" />
                  </SelectTrigger>
                  <SelectContent>
                    {faculties.map(f => (
                      <SelectItem key={f.id} value={String(f.id)}>
                        {f.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="department">Select Department *</Label>
                <Select value={department} onValueChange={handleDeptChange} disabled={!faculty}>
                  <SelectTrigger className="border-primary/30">
                    <SelectValue
                      placeholder={faculty ? 'choose department' : 'Select faculty first'}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map(d => (
                      <SelectItem key={d.id} value={String(d.id)}>
                        {d.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="level">Select Academic Level *</Label>
                <Select value={level} onValueChange={handleLevelChange} disabled={!department}>
                  <SelectTrigger className="border-primary/30">
                    <SelectValue
                      placeholder={department ? 'choose level' : 'Select department first'}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {levels.map(l => (
                      <SelectItem key={l.id} value={String(l.id)}>
                        {l.level_number}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="courses">Select Course *</Label>
                <Select value={course} onValueChange={setCourse} disabled={!level}>
                  <SelectTrigger className="border-primary/30">
                    <SelectValue placeholder={level ? 'choose course' : 'Select level first'} />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map(c => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.course_code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* File Upload Section */}
            <div className="space-y-4">
              <h3 className="font-semibold text-primary">File Upload *</h3>

              <div className="grid gap-2">
                <div
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
                    dragging ? 'border-primary/100 bg-primary/10' : 'border-primary/30'
                  }`}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onDragLeave={handleDragLeave}
                >
                  <input
                    id="file"
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                    required
                  />
                  <label htmlFor="file" className="cursor-pointer">
                    <Upload className="w-8 h-8 text-primary/40 mx-auto mb-2" />
                    {file ? (
                      <div>
                        <p className="font-semibold text-primary">{file.name}</p>
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

            <Button type="submit" className="w-full bg-primary hover:bg-secondary text-white">
              Upload File
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
