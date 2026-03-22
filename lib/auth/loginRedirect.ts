export function buildLoginRedirect(returnTo: string, toastMessage: string) {
  const params = new URLSearchParams({
    returnTo,
    toast_message: toastMessage,
  })

  return `/login?${params.toString()}`
}
