import { CheckCircle, Trash2, Upload } from "lucide-react"
import { useEffect, useRef, useState } from "react"

interface AudioUploaderProps {
  currentUrl: string // URL hiện tại (từ S3 hoặc blob preview)
  onFileChange: (file: File, previewUrl: string) => void
  onClear: () => void
  accentColor?: string
}

function AudioUploader({
  currentUrl,
  onFileChange,
  onClear,
  accentColor = "#7c3aed",
}: AudioUploaderProps) {
  const [dragOver, setDragOver] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Khi component mount với URL có sẵn từ S3, hiển thị tên file từ URL
  useEffect(() => {
    if (currentUrl && !currentUrl.startsWith("blob:")) {
      const name = decodeURIComponent(currentUrl.split("/").pop() ?? "")
      setFileName(name || null)
    }
  }, [])

  const processFile = (file: File) => {
    if (!file.type.startsWith("audio/")) return
    const previewUrl = URL.createObjectURL(file)
    setFileName(file.name)
    onFileChange(file, previewUrl)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    // Dọn blob URL nếu có
    if (currentUrl?.startsWith("blob:")) URL.revokeObjectURL(currentUrl)
    setFileName(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
    onClear()
  }

  const hasFile = !!currentUrl

  return (
    <div className="space-y-2">
      {/* Drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center gap-2 w-full px-4 py-5 rounded-xl border-2 border-dashed cursor-pointer transition-all select-none
          ${
            dragOver
              ? "border-blue-400 bg-blue-50 scale-[1.01]"
              : hasFile
                ? "border-green-300 bg-green-50 hover:bg-green-100"
                : "border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-gray-100"
          }`}
      >
        {hasFile ? (
          <CheckCircle className="w-6 h-6 text-green-500" />
        ) : (
          <Upload
            className={`w-6 h-6 ${dragOver ? "text-blue-500" : "text-gray-400"}`}
          />
        )}
        <p className="text-sm font-medium text-gray-600 text-center max-w-xs truncate px-4">
          {hasFile
            ? (fileName ?? "File đã được chọn")
            : "Kéo thả file vào đây hoặc click để chọn"}
        </p>
        <p className="text-xs text-gray-400">Hỗ trợ: MP3, WAV, M4A, OGG</p>
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          className="hidden"
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) processFile(f)
          }}
        />
      </div>

      {/* Preview player + clear button */}
      {hasFile && (
        <div className="flex items-center gap-2">
          <audio
            controls
            src={currentUrl}
            className="flex-1 h-9 rounded-lg"
            style={{ accentColor }}
          />
          <button
            onClick={handleClear}
            title="Xoá audio"
            className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-lg border border-red-200 text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}

export default AudioUploader