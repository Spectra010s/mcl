import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import { sendFeedbackNotificationEmail } from '@/lib/email'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const type = formData.get('type') as string
    const description = formData.get('description') as string
    const screenshot = formData.get('screenshot') as File | null

    if (!type || !description) {
      return NextResponse.json({ error: 'Type and description are required' }, { status: 400 })
    }

    if (!['bug', 'feature'].includes(type)) {
      return NextResponse.json({ error: 'Invalid feedback type' }, { status: 400 })
    }

    // Check if user is authenticated
    const supabase = await createClient()
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser()

    let userName: string | null = null
    let userEmail: string | null = null

    if (authUser) {
      const { data: userData } = await supabase
        .from('users')
        .select('username, email')
        .eq('id', authUser.id)
        .single()

      if (userData) {
        userName = userData.username
        userEmail = userData.email
      }
    }

    // Upload screenshot if provided
    let screenshotUrl: string | null = null

    if (screenshot && screenshot.size > 0) {
      const fileExt = screenshot.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`

      const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
        .from('feedback-screenshots')
        .upload(fileName, screenshot, {
          contentType: screenshot.type,
          upsert: false,
        })

      if (uploadError) {
        console.error('[Feedback] Screenshot upload error:', uploadError)
      } else {
        const {
          data: { publicUrl },
        } = supabaseAdmin.storage.from('feedback-screenshots').getPublicUrl(uploadData.path)

        screenshotUrl = publicUrl
      }
    }

    // Insert feedback into database
    const { data, error } = await supabaseAdmin
      .from('feedback')
      .insert({
        type,
        description,
        screenshot_url: screenshotUrl,
        user_id: authUser?.id || null,
        user_name: userName,
        user_email: userEmail,
        status: 'open',
      })
      .select()
      .single()

    if (error) {
      console.error('[Feedback] Database insert error:', error)
      return NextResponse.json({ error: 'Failed to submit feedback' }, { status: 500 })
    }

    // Send email notification
    sendFeedbackNotificationEmail(type, description, screenshotUrl, userName, userEmail).catch(
      err => console.error('[Feedback] Email notification error:', err),
    )

    return NextResponse.json({ success: true, id: data.id }, { status: 201 })
  } catch (error) {
    console.error('[Feedback] Error:', error)
    return NextResponse.json({ error: 'Failed to submit feedback' }, { status: 500 })
  }
}
