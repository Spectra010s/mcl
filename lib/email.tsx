import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendRejectionEmail(
  userEmail: string,
  firstName: string,
  resourceTitle: string,
  rejectionReason: string,
) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'My Campus Library <onboarding@resend.dev>',
      to: userEmail,
      replyTo: 'spectra010s@gmail.com',
      subject: `Your file upload was not approved - "${resourceTitle}"`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #182b5c;">Resource Upload Review</h2>
          
          <h1>Hi, ${firstName}</h1>
          <p>Thank you for uploading to My Campus Library.</p>
          
          <p>Unfortunately, your file <strong>"${resourceTitle}"</strong> did not meet our approval criteria.</p>
          
          <div style="background-color: #f5f5f5; padding: 15px; border-left: 4px solid #d32f2f; margin: 20px 0;">
            <h4 style="margin-top: 0; color: #d32f2f;">Reason for Rejection</h4>
            <p style="margin: 10px 0;">${escapeHtml(rejectionReason)}</p>
          </div>
          
          <h4>What you can do:</h4>
          <ul>
            <li>Review the provided reason above</li>
            <li>Make necessary corrections to your file</li>
            <li>Re-upload the corrected version</li>
            <li>Contact our support team if you have questions</li>
          </ul>
          
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            Best regards,<br/>
            My Campus Library Team
          </p>
          
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;" />
          
          <p style="color: #999; font-size: 12px;">
            If you believe this decision was made in error, please contact us at spectra010s@gmail.com
          </p>
        </div>
      `,
    })

    if (error) {
      console.error('[Email] Error sending rejection email:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('[Email] Exception sending rejection email:', error)
    return false
  }
}

export async function sendApprovalEmail(
  userEmail: string,
  firstName: string,
  resourceTitle: string,
  resourceId: string,
) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'My Campus Library <onboarding@resend.dev>',
      to: userEmail,
      replyTo: 'spectra010s@gmail.com',
      subject: `Your resource was approved! - "${resourceTitle}"`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0256a5;">Resource Approved!</h2>
          
         <h1>Hi, ${firstName}</h1>
          <p>Great news! Your file <strong>"${resourceTitle}"</strong> has been approved and is now live on My Campus Library.</p>
          
          <div style="background-color: #e8f5e9; padding: 15px; border-left: 4px solid #4caf50; margin: 20px 0;">
            <h4 style="margin-top: 0; color: #2e7d32;">Status: Published</h4>
            <p style="margin: 10px 0;">Your resource is now available for students and the faculty to browse and download.</p>
          </div>
          
          <h4>View your resource:</h4>
          <p>
            <a href="https://mycampuslibrary.com/resource/${resourceId}" 
               style="background-color: #0256a5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">
              View Resource
            </a>
          </p>
          
          <h4>Track your contribution:</h4>
          <ul>
            <li>Monitor download counts</li>
            <li>See user ratings and feedback</li>
            <li>Upload more materials anytime</li>
          </ul>
          
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            Thank you for contributing to our academic community!<br/>
            Best regards,<br/>
            My Campus Library Team
          </p>
        </div>
      `,
    })

    if (error) {
      console.error('[Email] Error sending approval email:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('[Email] Exception sending approval email:', error)
    return false
  }
}

function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }
  return text.replace(/[&<>"']/g, char => map[char])
}
