import React, { useState, useEffect, useRef } from "react"
import {
  Save,
  AlertCircle,
  CheckCircle,
  Loader2,
  X,
  Music,
  FileText,
  Hash,
  BookOpen,
  Upload,
  Trash2,
  VolumeX,
} from "lucide-react"
import { updatePart } from "../../../../service/partService.js"

interface Choice {
  _id: string
  label: "A" | "B" | "C" | "D"
  text: string
  isCorrect: boolean
}

interface QuestionGroup {
  groupId: string
  text: string
  audio: string
  image: string[]
}

interface Question {
  _id: string
  questionNumber: number
  globalQuestionNumber: number
  question: string
  choices: Choice[]
  correctAnswer: "A" | "B" | "C" | "D"
  explanation: string
  group: QuestionGroup
}

interface Part {
  _id: string
  testId: string
  partNumber: number
  category: "Listening" | "Reading"
  instructions: string
  description: string
  audioFile: string
  totalQuestions: number
  questions: Question[]
}

interface DefaultConfig {
  timeLimit: number
  parts: number[]
  shuffleQuestions: boolean
  showResult: boolean
  allowReview: boolean
}


// ─── Part Edit Modal ──────────────────────────────────────────────────────────

interface PartEditModalProps {
  part: Part
  onClose: () => void
  onSave: (updatedPart: Partial<Part>) => void
}

const LISTENING_PARTS = [1, 2, 3, 4]

const PartEditModal: React.FC<PartEditModalProps> = ({
  part,
  onClose,
  onSave,
}) => {
  const hasAudio = LISTENING_PARTS.includes(part.partNumber)

  const [form, setForm] = useState({
    instructions: part.instructions,
    description: part.description,
    audioFile: part.audioFile,
    totalQuestions: part.totalQuestions,
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null)
  // Lưu File object thực tế để gửi lên API (khác với audioFile URL chỉ dùng để preview)
  const [audioFileObject, setAudioFileObject] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleChange = (field: string, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith("audio/")) return
    // Lưu File object để gửi FormData khi save
    setAudioFileObject(file)
    setUploadedFileName(file.name)
    // Tạo object URL chỉ để preview trong audio player
    const previewUrl = URL.createObjectURL(file)
    handleChange("audioFile", previewUrl)
  }

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFileSelect(file)
  }

  const handleClearAudio = () => {
    // Huỷ object URL cũ để tránh memory leak
    if (form.audioFile?.startsWith("blob:")) {
      URL.revokeObjectURL(form.audioFile)
    }
    setAudioFileObject(null)
    setUploadedFileName(null)
    handleChange("audioFile", "")
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setSaveError(null)

      // Tạo FormData để gửi cả file lẫn text fields trong 1 request
      const formData = new FormData()
      formData.append("instructions", form.instructions)
      formData.append("description", form.description)
      formData.append("totalQuestions", String(form.totalQuestions))

      // Chỉ append file nếu người dùng đã chọn file mới
      if (audioFileObject) {
        formData.append("file", audioFileObject)
      }

      const updatedPart = await updatePart(part._id, formData)

      // Dọn dẹp object URL preview sau khi upload thành công
      if (form.audioFile?.startsWith("blob:")) {
        URL.revokeObjectURL(form.audioFile)
      }

      // Trả lên TestEditor data mới nhất từ server (có audioFile URL thật từ S3)
      onSave(updatedPart)
      setSaved(true)
      setTimeout(() => {
        setSaved(false)
        onClose()
      }, 900)
    } catch (err) {
      setSaveError("Lưu thất bại, vui lòng thử lại.")
    } finally {
      setSaving(false)
    }
  }

  const categoryColor =
    part.category === "Listening"
      ? {
          bg: "bg-violet-50",
          badge: "bg-violet-100 text-violet-700",
          border: "border-violet-200",
          ring: "focus:ring-violet-400",
          accent: "#7c3aed",
        }
      : {
          bg: "bg-sky-50",
          badge: "bg-sky-100 text-sky-700",
          border: "border-sky-200",
          ring: "focus:ring-sky-400",
          accent: "#0284c7",
        }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        backgroundColor: "rgba(15, 15, 30, 0.55)",
        backdropFilter: "blur(4px)",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden"
        style={{ animation: "modalIn 0.22s cubic-bezier(0.34,1.56,0.64,1)" }}
      >
        {/* Header */}
        <div
          className={`${categoryColor.bg} px-6 py-5 border-b ${categoryColor.border}`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg ${categoryColor.badge}`}
              >
                {part.partNumber}
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900 leading-tight">
                  Chỉnh sửa Part {part.partNumber}
                </h2>
                <span
                  className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full mt-0.5 ${categoryColor.badge}`}
                >
                  {part.category === "Listening" ? (
                    <Music className="w-3 h-3" />
                  ) : (
                    <BookOpen className="w-3 h-3" />
                  )}
                  {part.category}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-white transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Instructions */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              <FileText className="w-3.5 h-3.5" /> Hướng dẫn (Instructions)
            </label>
            <textarea
              rows={3}
              value={form.instructions}
              onChange={(e) => handleChange("instructions", e.target.value)}
              placeholder="Nhập hướng dẫn cho phần thi này..."
              className={`w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 ${categoryColor.ring} focus:border-transparent transition-shadow`}
            />
          </div>

          {/* Description */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              <FileText className="w-3.5 h-3.5" /> Mô tả (Description)
            </label>
            <textarea
              rows={2}
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Mô tả ngắn về phần thi..."
              className={`w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 ${categoryColor.ring} focus:border-transparent transition-shadow`}
            />
          </div>

          {/* ── Audio Section ── */}
          {hasAudio ? (
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                <Music className="w-3.5 h-3.5" /> File Audio
              </label>

              {/* Drop zone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault()
                  setDragOver(true)
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleFileDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative flex flex-col items-center justify-center gap-2 w-full px-4 py-6 rounded-xl border-2 border-dashed cursor-pointer transition-all
                  ${
                    dragOver
                      ? "border-violet-400 bg-violet-50 scale-[1.01]"
                      : form.audioFile
                        ? "border-green-300 bg-green-50"
                        : "border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-gray-100"
                  }`}
              >
                {form.audioFile ? (
                  <CheckCircle className="w-7 h-7 text-green-500" />
                ) : (
                  <Upload
                    className={`w-7 h-7 ${dragOver ? "text-violet-500" : "text-gray-400"}`}
                  />
                )}
                <p className="text-sm font-medium text-gray-600">
                  {form.audioFile
                    ? (uploadedFileName ?? "File đã được chọn")
                    : "Kéo thả file vào đây hoặc click để chọn"}
                </p>
                <p className="text-xs text-gray-400">
                  Hỗ trợ: MP3, WAV, M4A, OGG
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) handleFileSelect(f)
                  }}
                />
              </div>

              {/* Audio preview + clear */}
              {form.audioFile && (
                <div className="mt-3 flex items-center gap-2">
                  <audio
                    controls
                    src={form.audioFile}
                    className="flex-1 h-9 rounded-lg"
                    style={{ accentColor: categoryColor.accent }}
                  />
                  <button
                    onClick={handleClearAudio}
                    title="Xoá audio"
                    className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-lg border border-red-200 text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* No-audio notice for parts 5, 6, 7 */
            <div className="flex items-start gap-3 px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl">
              <VolumeX className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Không có file audio
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Part {part.partNumber} thuộc phần Reading — không yêu cầu file
                  audio.
                </p>
              </div>
            </div>
          )}

          {/* Total Questions */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              <Hash className="w-3.5 h-3.5" /> Tổng số câu hỏi
            </label>
            <input
              type="number"
              min={1}
              value={form.totalQuestions}
              onChange={(e) =>
                handleChange("totalQuestions", parseInt(e.target.value) || 1)
              }
              className={`w-32 px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 ${categoryColor.ring} focus:border-transparent transition-shadow`}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-3">
          {saveError ? (
            <div className="flex items-center gap-1.5 text-xs text-red-600">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              {saveError}
            </div>
          ) : (
            <span />
          )}
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            disabled={saving || saved}
            className={`flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white rounded-xl transition-all disabled:cursor-not-allowed
              ${
                saved
                  ? "bg-green-500"
                  : part.category === "Listening"
                    ? "bg-violet-600 hover:bg-violet-700"
                    : "bg-sky-600 hover:bg-sky-700"
              }`}
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Đang lưu...
              </>
            ) : saved ? (
              <>
                <CheckCircle className="w-4 h-4" /> Đã lưu!
              </>
            ) : (
              <>
                <Save className="w-4 h-4" /> Lưu thay đổi
              </>
            )}
          </button>
        </div>
      </div>

      {/* Keyframe animation */}
      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.92) translateY(10px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  )
}

export default PartEditModal