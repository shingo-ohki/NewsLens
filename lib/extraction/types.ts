export type ExtractionResultStatus = 'success' | 'fail'

export type ExtractionResult = {
  status: ExtractionResultStatus
  content: string
  contentLength: number
  warnings: string[]
  metadata?: {
    title?: string
    byline?: string
    siteName?: string
    publishedTime?: string
  }
}
