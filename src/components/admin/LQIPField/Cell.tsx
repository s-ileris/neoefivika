'use client'

import React from 'react'
import { DefaultCellComponentProps } from 'payload'

const CellComponent: React.FC<DefaultCellComponentProps> = ({ cellData, field, rowData }) => {
  if (!cellData) {
    return <span style={{ color: '#6B7280', fontSize: 12 }}>—</span>
  }

  const lqip = cellData

  if (!lqip) return <span style={{ color: '#6B7280', fontSize: 12 }}>—</span>

  const base64Data = lqip.split(',')[1] || lqip
  const byteSize = Math.round((base64Data.length * 3) / 4)

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <img
        src={lqip}
        alt="LQIP"
        style={{
          width: 32,
          height: 32,
          objectFit: 'cover',
          borderRadius: 4,
          border: '1px solid #374151',
        }}
      />
      <span
        style={{
          fontSize: 11,
          color: byteSize <= 500 ? '#10B981' : '#F59E0B',
          fontFamily: 'monospace',
        }}
      >
        {byteSize}B
      </span>
    </div>
  )
}

export default CellComponent
