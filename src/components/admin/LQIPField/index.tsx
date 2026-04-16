'use client'

import { useField } from '@payloadcms/ui'
import { TextFieldClientComponent } from 'payload'

const LQIPField: TextFieldClientComponent = ({ path }) => {
  const { value } = useField<string>({ path })
  const lqip = value
  if (!lqip) {
    return (
      <div style={{ padding: '8px 0', color: '#9BA3AF', fontSize: 13 }}>No LQIP generated yet</div>
    )
  }

  const base64Data = lqip.split(',')[1] || lqip
  const byteSize = Math.round((base64Data.length * 3) / 4)
  const sizeColor = byteSize <= 500 ? '#10B981' : byteSize <= 1000 ? '#F59E0B' : '#EF4444'
  const sizeLabel = byteSize <= 500 ? 'Good' : byteSize <= 1000 ? 'Large' : 'Too large'

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: '12px 0',
      }}
    >
      <div
        style={{
          position: 'relative',
          width: 80,
          height: 80,
          overflow: 'hidden',
          flexShrink: 0,
          backgroundColor: '#1F2937',
        }}
      >
        <img
          src={lqip}
          alt="LQIP preview"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            imageRendering: 'pixelated',
          }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: sizeColor,
              backgroundColor: `${sizeColor}20`,
              padding: '2px 8px',
              borderRadius: 99,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            {sizeLabel}
          </span>
        </div>

        <div
          style={{
            fontSize: 12,
            color: '#6B7280',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <span>
            Size: {byteSize < 1000 ? `${byteSize} B` : `${(byteSize / 1024).toFixed(1)} KB`}
          </span>
          <span>String length: {lqip.length.toLocaleString()} chars</span>
        </div>

        {byteSize > 500 && (
          <span style={{ fontSize: 11, color: '#F59E0B' }}>
            ⚠ Target is under 500B — try resizing to 16px or lowering quality
          </span>
        )}
      </div>
    </div>
  )
}

export default LQIPField
