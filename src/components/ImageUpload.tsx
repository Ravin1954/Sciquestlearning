'use client'

import { useRef, useState } from 'react'

interface ImageUploadProps {
  value: string
  onChange: (url: string) => void
  label?: string
}

export default function ImageUpload({ value, onChange, label = 'Course Image' }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) { setError('Please select an image file.'); return }
    if (file.size > 5 * 1024 * 1024) { setError('Image must be under 5 MB.'); return }

    setUploading(true)
    setError('')
    const formData = new FormData()
    formData.append('file', file)

    const res = await fetch('/api/upload', { method: 'POST', body: formData })
    const data = await res.json()
    if (res.ok) {
      onChange(data.url)
    } else {
      setError(data.error || 'Upload failed. Please try again.')
    }
    setUploading(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  return (
    <div>
      <label style={{ color: '#2d4a6b', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.375rem', display: 'block' }}>
        {label} <span style={{ color: '#5a7a96', fontWeight: 400 }}>(optional)</span>
      </label>

      {value ? (
        <div style={{ position: 'relative', borderRadius: '10px', overflow: 'hidden', border: '1px solid #C5D5E4' }}>
          <img src={value} alt="Course image" style={{ width: '100%', height: '200px', objectFit: 'cover', display: 'block' }} />
          <div style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              style={{ backgroundColor: '#0B1A2E', color: '#fff', border: 'none', padding: '0.375rem 0.75rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', opacity: 0.9 }}
            >
              {uploading ? 'Uploading...' : 'Change'}
            </button>
            <button
              type="button"
              onClick={() => onChange('')}
              style={{ backgroundColor: '#f87171', color: '#fff', border: 'none', padding: '0.375rem 0.75rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
          style={{
            border: '2px dashed #C5D5E4',
            borderRadius: '10px',
            padding: '2rem',
            textAlign: 'center',
            cursor: 'pointer',
            backgroundColor: '#EEF3F8',
            transition: 'border-color 0.15s',
          }}
        >
          <p style={{ fontSize: '2rem', margin: '0 0 0.5rem' }}>🖼️</p>
          <p style={{ color: '#2d4a6b', fontWeight: 600, fontSize: '0.875rem', margin: '0 0 0.25rem' }}>
            {uploading ? 'Uploading...' : 'Click or drag & drop an image'}
          </p>
          <p style={{ color: '#5a7a96', fontSize: '0.775rem', margin: 0 }}>PNG, JPG, WEBP · max 5 MB · recommended 1200×630</p>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
      />

      {error && <p style={{ color: '#f87171', fontSize: '0.775rem', marginTop: '0.375rem' }}>{error}</p>}
    </div>
  )
}
