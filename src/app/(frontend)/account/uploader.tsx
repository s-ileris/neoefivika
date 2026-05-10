'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { CheckIcon, UploadSimpleIcon, XIcon } from '@phosphor-icons/react/dist/ssr'
import type { Profile, UserMedia } from '@/payload-types'
import Image from 'next/image'

type ProfileValue = Profile['profile']

function getProfileUrl(profile: any): string | null {
  if (!profile) return null

  if (typeof profile === 'object' && profile?.url) {
    return profile.url
  }
  return null
}

export default function Uploader({ initial }: { initial: UserMedia }) {
  const router = useRouter()

  const [profile, setProfile] = useState<ProfileValue | null | 'delete'>(initial ?? null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    setProfile(initial ?? null)
  }, [initial])

  const previewUrl = useMemo(() => {
    if (!selectedFile) return null
    return URL.createObjectURL(selectedFile)
  }, [selectedFile])

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const imageToShow = useMemo(() => {
    if (profile === 'delete') return null
    return previewUrl || getProfileUrl(profile) || getProfileUrl(initial) || null
  }, [previewUrl, profile, initial])

  const uploadFile = useCallback(
    async (file: File) => {
      setUploading(true)
      setProgress(0)
      setSelectedFile(file)

      try {
        const urlResponse = await fetch('/api/front/media/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            collection: 'user-media',
            filename: file.name,
            contentType: file.type,
          }),
        })

        if (!urlResponse.ok) {
          toast.error('Η εικόνα προφίλ δεν άλλαξε', {
            description: 'Σφάλμα: NORESSIGURL',
          })
          return
        }

        const { signedUrl, key, alias } = await urlResponse.json()

        if (!signedUrl || !key) {
          toast.error('Η εικόνα προφίλ δεν άλλαξε', {
            description: `Σφάλμα:${!key && ' NOKEY'}${!signedUrl && ' NOSIGURL'}`,
          })
          return
        }

        setProgress(35)

        const putResponse = await fetch(signedUrl, {
          method: 'PUT',
          body: file,
          headers: { 'Content-Type': file.type },
        })

        if (!putResponse.ok) {
          toast.error('Η εικόνα προφίλ δεν άλλαξε', {
            description: 'Σφάλμα: FAILUPLOAD',
          })
          return
        }

        setProgress(70)

        const createResponse = await fetch('/api/front/media/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            key,
            alias,
            filename: file.name,
            mimeType: file.type,
            filesize: file.size,
            collection: 'user-media',
          }),
        })

        if (!createResponse.ok) {
          toast.error('Η εικόνα προφίλ δεν άλλαξε', {
            description: 'Σφάλμα: DBNOCR',
          })
          return
        }
        const { id } = await createResponse.json()

        setProgress(85)

        const updateResponse = await fetch('/api/front/account/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id,
          }),
        })

        if (!updateResponse.ok) {
          toast.error('Η εικόνα προφίλ δεν άλλαξε', {
            description: 'Σφάλμα: DBNOUP',
          })
          return
        }

        const profile = await updateResponse.json()

        setProgress(100)

        if (profile.profile) {
          setProfile(profile.profile)
          setSelectedFile(null)
          router.refresh()
        } else {
          toast.error('Η εικόνα προφίλ δεν άλλαξε', {
            description: 'Σφάλμα: NORESPRO',
          })
          return
        }
      } catch {
        toast.dismiss()
        toast.error('Η εικόνα προφίλ δεν άλλαξε', {
          description: 'Σφάλμα: UNKNOWN',
        })
      } finally {
        setUploading(false)
        setProgress(0)
      }
    },
    [router],
  )

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles && acceptedFiles[0]) {
        const file = acceptedFiles[0]

        if (!file.type.startsWith('image/')) {
          toast.error('Μπορείς να ανεβάσεις μόνο εικόνες')
          return
        }

        if (file.size > 4 * 1024 * 1024) {
          toast.error('Το μέγιστο μέγεθος είναι 4MB')
          return
        }
        setSelectedFile(acceptedFiles[0])
      }
    },
    [uploadFile],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    disabled: uploading,
  })

  // Manual fallback upload trigger
  const handleUpload = useCallback(() => {
    if (!selectedFile) return
    void uploadFile(selectedFile)
  }, [selectedFile, uploadFile])

  // Διαγραφή
  const handleRemove = useCallback(async () => {
    if (selectedFile) {
      setSelectedFile(null)
      return
    }

    setUploading(true)

    try {
      const res = await fetch('/api/front/account/profile', {
        method: 'DELETE',
      })

      if (!res.ok) {
        toast.error('Αποτυχία διαγραφής')
        return
      }

      setProfile('delete')
      setSelectedFile(null)
      router.refresh()
    } catch {
      toast.error('Σφάλμα διαγραφής')
    } finally {
      setUploading(false)
    }
  }, [selectedFile, router])

  return (
    <div
      {...getRootProps()}
      className="group relative aspect-square w-full overflow-hidden rounded-2xl border bg-neutral-100 cursor-pointer"
    >
      <input {...getInputProps()} />

      {/* Εικόνα */}
      {imageToShow ? (
        <Image
          unoptimized
          width={1024}
          height={1024}
          placeholder={!previewUrl && !profile && initial.lqip ? 'blur' : 'empty'}
          blurDataURL={!previewUrl && !profile && initial.lqip ? initial.lqip : ''}
          src={imageToShow}
          className="absolute inset-0 w-full h-full object-cover"
          alt=""
        />
      ) : (
        <div className="absolute inset-0 grid place-items-center text-neutral-400">
          <div className="space-y-4 text-center flex flex-col items-center">
            <UploadSimpleIcon size={32} />
            <span className="text-sm">Ανέβασε εικόνα</span>
          </div>
        </div>
      )}

      {/* Drag overlay */}
      <div
        className={`absolute inset-0 flex items-center justify-center transition
        ${isDragActive ? 'bg-black/40 backdrop-blur-sm' : 'bg-black/0'}
        `}
      >
        {isDragActive && <span className="text-white text-sm">Άφησε την εικόνα εδώ</span>}
      </div>

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition" />

      {/* Buttons */}
      <div className="absolute top-3 right-3 flex gap-2 opacity-0 max-md:opacity-100 group-hover:opacity-100 transition">
        {(profile || selectedFile) && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleRemove()
            }}
            className="h-8 w-8 grid place-items-center rounded-full bg-white shadow"
          >
            <XIcon size={16} />
          </button>
        )}

        {selectedFile && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleUpload()
            }}
            className="h-8 w-8 grid place-items-center rounded-full bg-white shadow"
          >
            <CheckIcon size={16} />
          </button>
        )}
      </div>

      {/* Progress bar */}
      {uploading && (
        <div className="absolute bottom-0 left-0 w-full h-2 bg-black/10">
          <div className="h-full bg-purple-600 transition-all" style={{ width: `${progress}%` }} />
        </div>
      )}

      {/* Status */}
      {selectedFile && !uploading && (
        <div className="absolute bottom-3 left-3 text-xs bg-white/90 px-3 py-1 rounded-full shadow">
          Προεπισκόπηση
        </div>
      )}
    </div>
  )
}
