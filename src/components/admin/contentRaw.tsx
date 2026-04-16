'use client'
import { useDocumentInfo } from '@payloadcms/ui'
export default function ArticlePreview() {
  const { data } = useDocumentInfo()
  if (!data || !data.contentRaw) return
  return (
    <div>
      <p className="field-label" style={{ marginBottom: 10 }}>
        Content
      </p>
      <div className="">
        <div dangerouslySetInnerHTML={{ __html: data.contentRaw }}></div>
      </div>
    </div>
  )
}
