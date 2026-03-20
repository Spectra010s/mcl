import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

export interface Faculty {
  id: number
  full_name: string
}

export interface Department {
  id: number
  full_name: string
}

export interface Level {
  id: number
  level_number: number
}

export interface Course {
  id: number
  course_code: string
}

export interface UploadResourceData {
  title: string
  description: string
  courseId: string
  file: File
  fileType: string
  userId: string
}

export const fetchFaculties = async (): Promise<Faculty[]> => {
  const { data, error } = await supabase
    .from('faculties')
    .select('id, full_name')
    .order('full_name')

  if (error) throw error
  return data || []
}

export const fetchDepartments = async (facultyId: string): Promise<Department[]> => {
  if (!facultyId) return []
  const { data, error } = await supabase
    .from('departments')
    .select('id, full_name')
    .eq('faculty_id', facultyId)
    .order('full_name')

  if (error) throw error
  return data || []
}

export const fetchLevels = async (departmentId: string): Promise<Level[]> => {
  if (!departmentId) return []
  const { data, error } = await supabase
    .from('academic_levels')
    .select('id, level_number')
    .eq('department_id', departmentId)
    .order('level_number')

  if (error) throw error
  return data || []
}

export const fetchCourses = async (levelId: string): Promise<Course[]> => {
  if (!levelId) return []
  const { data, error } = await supabase
    .from('courses')
    .select('id, course_code')
    .eq('academic_level_id', levelId)
    .order('course_code')

  if (error) throw error
  return data || []
}

export const uploadResource = async (data: UploadResourceData) => {
  const { title, description, courseId, file, fileType, userId } = data

  const filePath = `${userId}/${Date.now()}-${file.name}`

  const { error: uploadError } = await supabase.storage.from('mclib').upload(filePath, file)

  if (uploadError) {
    throw new Error('Storage upload failed: ' + uploadError.message)
  }

  const { data: insertedData, error: insertError } = await supabase
    .from('resources')
    .insert({
      title,
      description,
      course_id: courseId,
      file_type: fileType,
      file_url: filePath,
      file_size_bytes: file.size,
      is_approved: false,
      uploaded_by: userId,
    })
    .select()
    .single()

  if (insertError) {
    await supabase.storage.from('mclib').remove([filePath])
    throw new Error('Database insertion failed: ' + insertError.message)
  }

  return insertedData
}
