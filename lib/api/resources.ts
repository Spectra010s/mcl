export const toggleResourceBookmark = async (resourceId: number) => {
  const response = await fetch(`/api/resources/${resourceId}/bookmark`, {
    method: 'POST',
  })

  if (!response.ok) throw new Error('Bookmark failed')
  return response.json() as Promise<{ bookmarked: boolean }>
}

export const fetchResourcePreview = async (resourceId: number) => {
  const response = await fetch(`/api/resources/${resourceId}/preview`)
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Preview failed')
  }

  return response.json() as Promise<{ signedUrl: string; fileType: string }>
}

export const getResourceDownloadUrl = (resourceId: number) => {
  return `/api/resources/${resourceId}/download`
}
