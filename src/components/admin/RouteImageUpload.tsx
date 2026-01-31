'use client'

import { useRef, useState } from 'react'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { ImagePlus, X } from 'lucide-react'

const ACCEPT = 'image/jpeg,image/png,image/webp,image/gif'
const MAX_SIZE_MB = 5

type Props = {
  name: string
  currentImageUrl?: string | null
  /** When set, clearing the image sets this hidden input to "1" so server can remove image */
  removeImageName?: string
  disabled?: boolean
}

export function RouteImageUpload({
  name,
  currentImageUrl,
  removeImageName,
  disabled = false,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [removeImage, setRemoveImage] = useState(false)

  const displayUrl = !removeImage ? (preview || currentImageUrl) : null

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null)
    setRemoveImage(false)
    const file = e.target.files?.[0]
    if (!file) {
      setPreview(null)
      return
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`Image must be under ${MAX_SIZE_MB}MB`)
      setPreview(null)
      e.target.value = ''
      return
    }
    const type = file.type
    if (!ACCEPT.split(',').map((s) => s.trim()).includes(type)) {
      setError('Use JPEG, PNG, WebP or GIF')
      setPreview(null)
      e.target.value = ''
      return
    }
    const url = URL.createObjectURL(file)
    setPreview(url)
  }

  const clearImage = () => {
    setPreview(null)
    setError(null)
    setRemoveImage(!!removeImageName)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="space-y-2">
      <Label>Cover image</Label>
      <div className="flex flex-col sm:flex-row gap-4 items-start">
        <div className="relative w-full sm:w-48 h-36 rounded-lg border border-input bg-muted/30 overflow-hidden flex items-center justify-center">
          {displayUrl ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={displayUrl}
                alt="Route cover"
                className="w-full h-full object-cover"
              />
              {!disabled && (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="absolute top-1 right-1 h-7 w-7 p-0 rounded-full"
                  onClick={clearImage}
                  title="Remove image"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
              <ImagePlus className="h-8 w-8" />
              <span className="text-xs">No image</span>
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <input
            ref={inputRef}
            type="file"
            name={name}
            accept={ACCEPT}
            onChange={handleFileChange}
            disabled={disabled}
            className="text-sm file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
          />
          <p className="text-xs text-muted-foreground">
            JPEG, PNG, WebP or GIF. Max {MAX_SIZE_MB}MB. Used as product-like cover.
          </p>
          {error && (
            <p className="text-xs text-destructive">{error}</p>
          )}
          {removeImageName && (
            <input
              type="hidden"
              name={removeImageName}
              value={removeImage ? '1' : ''}
              readOnly
            />
          )}
        </div>
      </div>
    </div>
  )
}
