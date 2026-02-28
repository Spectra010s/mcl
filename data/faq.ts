export interface FAQItem {
  question: string
  answer: string
}

export const FAQData: FAQItem[] = [
  {
    question: 'How do I create an account?',
    answer: `Click the 'Sign up' button on the homepage, enter your email, create a password, follow the email confirmation link sent to your inbox Or Sign up using either your Google account or your Github account.`,
  },
  {
    question: 'How do I search for resources?',
    answer: `Use the Search page from the sidebar or the search buttok from the header to search by title, author, or keyword. You can also browse resources by department and general courses using the Browse page, or filter on the main page.`,
  },
  {
    question: 'Can I download files or any Materials i need?',
    answer: `Yes! Once you're logged in and viewing a resource detail page, click the 'Download' button. Your download will be tracked in your Activity history for future reference.`,
  },
  {
    question: 'How do I add a resource to bookmarks?',
    answer: `On any resource detail page, click the bookmark icon to add it to your bookmarks. You can view all your bookamrks from the Settings page in the sidebar.`,
  },
  {
    question: 'Can I upload my own resources?',
    answer: `Yes, every student and user of My Campus Libraryand authorized staff can upload resources using the Upload page. Submissions are reviewed for quality and appropriateness before being made available to the community.`,
  },
  {
    question: 'What are the View count for?',
    answer: `The view count shows the amount of time a resource has been viewed, you can use this to know which of the files are popular to all users.`,
  },
  {
    question: 'Is my data secure?',
    answer:
      'Yes, we use industry-standard encryption and security practices. Your personal information is protected by Row Level Security policies that ensure only you can access your data.',
  },
  {
    question: 'How do I change my profile information?',
    answer:
      'Go to your Settings page from the sidebar and you will be in the Profile tab, then you can update your name and other personal information.',
  },
  {
    question: 'What formats are supported for uploaded files?',
    answer:
      'We support PDF, DOCX, XLSX, PPTX, MP4, and other common academic formats. For security reasons, executable files are not permitted.',
  },
]
