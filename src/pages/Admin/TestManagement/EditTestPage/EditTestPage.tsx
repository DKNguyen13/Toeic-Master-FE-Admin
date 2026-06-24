import React, { useState, useEffect, useRef } from "react"
import { useNavigate, useParams } from "react-router-dom"
import {
  Save,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle,
  Loader2,
  ArrowLeft,
  Pencil,
  Music,
  BookOpen
} from "lucide-react"
import { getTestInfo, updateTest } from "../../../../service/testService.js"
import PartEditModal from "./PartEditModal.tsx"
import AudioUploader from "../../../../components/common/AudioUploader/AudioUploader.tsx"

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

interface Test {
  _id: string
  title: string
  testCode: string
  audio: string
  description: string
  isActive: boolean
  defaultConfig: DefaultConfig
}

interface TestData {
  test: Test
  parts: Part[]
}

interface UpdateData {
  testInfo: {
    title: string
    audio: string
    description: string
    isActive: boolean
    defaultConfig: DefaultConfig
  }
  parts: Array<{
    partId: string
    instructions: string
    description: string
    audioFile: string
    totalQuestions: number
  }>
  questions: Array<{
    questionId: string
    question: string
    choices: Choice[]
    correctAnswer: "A" | "B" | "C" | "D"
    explanation: string
    group: QuestionGroup
  }>
}

// ─── Reusable Audio Uploader ─────────────────────────────────────────────────



// ─── Main Component ───────────────────────────────────────────────────────────

const TestEditor: React.FC = () => {
  const navigate = useNavigate()
  const [testData, setTestData] = useState<TestData | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [saving, setSaving] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<boolean>(false)
  const [expandedParts, setExpandedParts] = useState<Record<string, boolean>>(
    {},
  )
  const [expandedQuestions, setExpandedQuestions] = useState<
    Record<string, boolean>
  >({})

  // Test audio upload state
  const [testAudioFile, setTestAudioFile] = useState<File | null>(null)
  const [testAudioPreviewUrl, setTestAudioPreviewUrl] = useState<string>("")

  // Part edit modal state
  const [editingPart, setEditingPart] = useState<Part | null>(null)

  const { slug } = useParams<{ slug: string }>()

  useEffect(() => {
    fetchTestData()
  }, [])

  const fetchTestData = async (): Promise<void> => {
    try {
      setLoading(true)
      setError(null)
      const response = await getTestInfo(slug)
      
      // Sanitize parts to clean up any "undefined" or "null" string values from database
      const sanitizedParts = response.parts?.map((part: any) => ({
        ...part,
        instructions: (part.instructions === "undefined" || part.instructions === "null") ? "" : (part.instructions || ""),
        description: (part.description === "undefined" || part.description === "null") ? "" : (part.description || ""),
        audioFile: (part.audioFile === "undefined" || part.audioFile === "null") ? "" : (part.audioFile || ""),
      })) || []

      setTestData({
        ...response,
        parts: sanitizedParts
      })
    } catch (err) {
      setError("Failed to load test data")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (): Promise<void> => {
    if (!testData) return
    try {
      setSaving(true)
      setError(null)
      setSuccess(false)

      const updateData: UpdateData = {
        testInfo: {
          title: testData.test.title,
          audio: testData.test.audio,
          description: testData.test.description,
          isActive: testData.test.isActive,
          defaultConfig: testData.test.defaultConfig,
        },
        parts: testData.parts.map((part) => ({
          partId: part._id,
          instructions: part.instructions,
          description: part.description,
          audioFile: part.audioFile,
          totalQuestions: part.totalQuestions,
        })),
        questions: testData.parts.flatMap((part) =>
          part.questions.map((q) => ({
            questionId: q._id,
            question: q.question,
            choices: q.choices,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
            group: q.group,
          })),
        ),
      }

      const response = await updateTest(slug, updateData)
      console.log("Save response:", response)
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError("Failed to save changes")
    } finally {
      setSaving(false)
    }
  }

  // ── Handlers ──

  const updateTestField = (
    field: keyof Test,
    value: string | boolean,
  ): void => {
    if (!testData) return
    setTestData((prev) =>
      prev ? { ...prev, test: { ...prev.test, [field]: value } } : prev,
    )
  }

  const updateTestConfig = (
    field: keyof DefaultConfig,
    value: number | number[] | boolean,
  ): void => {
    if (!testData) return
    setTestData((prev) =>
      prev
        ? {
            ...prev,
            test: {
              ...prev.test,
              defaultConfig: { ...prev.test.defaultConfig, [field]: value },
            },
          }
        : prev,
    )
  }

  /** Called when Part Edit Modal saves */
  const handlePartSave = (
    partId: string,
    updatedFields: Partial<Part>,
  ): void => {
    if (!testData) return
    setTestData((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        parts: prev.parts.map((p) =>
          p._id === partId ? { ...p, ...updatedFields } : p,
        ),
      }
    })
  }

  const updateQuestion = (
    partIndex: number,
    questionIndex: number,
    field: keyof Question,
    value: string,
  ): void => {
    if (!testData) return
    setTestData((prev) => {
      if (!prev) return prev
      const newParts = [...prev.parts]
      const newQuestions = [...newParts[partIndex].questions]
      newQuestions[questionIndex] = {
        ...newQuestions[questionIndex],
        [field]: value,
      }
      newParts[partIndex] = { ...newParts[partIndex], questions: newQuestions }
      return { ...prev, parts: newParts }
    })
  }

  const updateChoice = (
    partIndex: number,
    questionIndex: number,
    choiceIndex: number,
    text: string,
  ): void => {
    if (!testData) return
    setTestData((prev) => {
      if (!prev) return prev
      const newParts = [...prev.parts]
      const newQuestions = [...newParts[partIndex].questions]
      const newChoices = [...newQuestions[questionIndex].choices]
      newChoices[choiceIndex] = { ...newChoices[choiceIndex], text }
      newQuestions[questionIndex] = {
        ...newQuestions[questionIndex],
        choices: newChoices,
      }
      newParts[partIndex] = { ...newParts[partIndex], questions: newQuestions }
      return { ...prev, parts: newParts }
    })
  }

  const togglePart = (partId: string): void => {
    setExpandedParts((prev) => ({ ...prev, [partId]: !prev[partId] }))
  }

  const toggleQuestion = (questionId: string): void => {
    setExpandedQuestions((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }))
  }

  // ── Render ──

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (!testData) return null

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Quay lại
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Cập nhật đề thi
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Mã đề thi: {testData.test.testCode}
              </p>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Save className="w-5 h-5" />
              )}
              {saving ? "Saving..." : "Lưu thay đổi"}
            </button>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-4 bg-red-50 text-red-800 rounded-lg">
              <AlertCircle className="w-5 h-5" />
              {error}
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 p-4 bg-green-50 text-green-800 rounded-lg">
              <CheckCircle className="w-5 h-5" />
              Thông tin lưu thành công!
            </div>
          )}
        </div>

        {/* Test Info */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Thông tin đề thi
          </h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Tên đề thi</label>
              <input id="title"
                type="text"
                value={testData.test.title}
                onChange={(e) => updateTestField("title", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                <Music className="w-3.5 h-3.5" /> File Audio đề thi
              </label>
              <AudioUploader
                currentUrl={testData.test.audio}
                onFileChange={(file, previewUrl) => {
                  setTestAudioFile(file)
                  setTestAudioPreviewUrl(previewUrl)
                }}
                onClear={() => {
                  setTestAudioFile(null)
                  setTestAudioPreviewUrl("")
                  updateTestField("audio", "")
                }}
                accentColor="#2563eb"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={testData.test.isActive}
                onChange={(e) => updateTestField("isActive", e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label
                htmlFor="isActive"
                className="text-sm font-medium text-gray-700"
              >
                Active
              </label>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="timeLimit"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Time Limit (minutes)
                </label>
                <input
                  id="timeLimit"
                  type="number"
                  value={testData.test.defaultConfig.timeLimit}
                  onChange={(e) =>
                    updateTestConfig("timeLimit", parseInt(e.target.value) || 0)
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Parts */}
        {testData.parts.map((part, partIndex) => (
          <div key={part._id} className="bg-white rounded-lg shadow-sm mb-4">
            {/* Part Header */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
              {/* Left: toggle area */}
              <div
                className="flex items-center gap-3 flex-1 cursor-pointer"
                onClick={() => togglePart(part._id)}
              >
                {/* Category badge */}
                <span
                  className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full
                  ${
                    part.category === "Listening"
                      ? "bg-violet-100 text-violet-700"
                      : "bg-sky-100 text-sky-700"
                  }`}
                >
                  {part.category === "Listening" ? (
                    <Music className="w-3 h-3" />
                  ) : (
                    <BookOpen className="w-3 h-3" />
                  )}
                  {part.category}
                </span>

                <div>
                  <h3 className="text-base font-semibold text-gray-900 leading-tight">
                    Part {part.partNumber}
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {part.totalQuestions} câu hỏi
                    {part.questions.length > 0 && (
                      <>
                        {" "}
                        . {part.questions[0].globalQuestionNumber}–
                        {
                          part.questions[part.questions.length - 1]
                            .globalQuestionNumber
                        }
                      </>
                    )}
                  </p>
                </div>
              </div>

              {/* Right: Edit button + chevron */}
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setEditingPart(part)
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all
                    ${
                      part.category === "Listening"
                        ? "border-violet-200 text-violet-700 bg-violet-50 hover:bg-violet-100"
                        : "border-sky-200 text-sky-700 bg-sky-50 hover:bg-sky-100"
                    }`}
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Chỉnh sửa Part
                </button>

                <button
                  onClick={() => togglePart(part._id)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"
                >
                  {expandedParts[part._id] ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Questions list (collapsible) */}
            {expandedParts[part._id] && (
              <div className="p-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">
                  Danh sách câu hỏi
                </h4>
                {part.questions.map((question, questionIndex) => (
                  <div
                    key={question._id}
                    className="border border-gray-200 rounded-lg mb-3"
                  >
                    <div
                      onClick={() => toggleQuestion(question._id)}
                      className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-700">
                          Câu hỏi {question.questionNumber}
                        </span>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          #{question.globalQuestionNumber}
                        </span>
                      </div>
                      {expandedQuestions[question._id] ? (
                        <ChevronUp className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      )}
                    </div>

                    {expandedQuestions[question._id] && (
                      <div className="p-3 border-t border-gray-200 space-y-3">
                        <div>
                          <label
                            htmlFor={`question-${question._id}`}
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Question
                          </label>
                          <textarea
                            id={`question-${question._id}`}
                            value={question.question}
                            onChange={(e) =>
                              updateQuestion(
                                partIndex,
                                questionIndex,
                                "question",
                                e.target.value,
                              )
                            }
                            rows={2}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Choices
                          </label>
                          {question.choices.map((choice, choiceIndex) => (
                            <div
                              key={choice._id}
                              className="flex items-center gap-2 mb-2"
                            >
                              <span className="text-sm font-medium text-gray-600 w-6">
                                {choice.label}.
                              </span>
                              <input
                                type="text"
                                value={choice.text}
                                onChange={(e) =>
                                  updateChoice(
                                    partIndex,
                                    questionIndex,
                                    choiceIndex,
                                    e.target.value,
                                  )
                                }
                                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                aria-label={`Choice ${choice.label}`}
                              />
                            </div>
                          ))}
                        </div>

                        <div>
                          <label
                            htmlFor={`correctAnswer-${question._id}`}
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Correct Answer
                          </label>
                          <select
                            id={`correctAnswer-${question._id}`}
                            value={question.correctAnswer}
                            onChange={(e) =>
                              updateQuestion(
                                partIndex,
                                questionIndex,
                                "correctAnswer",
                                e.target.value,
                              )
                            }
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            {question.choices.map((choice) => (
                              <option key={choice.label} value={choice.label}>
                                {choice.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label
                            htmlFor={`explanation-${question._id}`}
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Explanation
                          </label>
                          <textarea
                            id={`explanation-${question._id}`}
                            value={question.explanation}
                            onChange={(e) =>
                              updateQuestion(
                                partIndex,
                                questionIndex,
                                "explanation",
                                e.target.value,
                              )
                            }
                            rows={2}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Part Edit Modal */}
      {editingPart && (
        <PartEditModal
          part={editingPart}
          onClose={() => setEditingPart(null)}
          onSave={(updatedFields) => {
            handlePartSave(editingPart._id, updatedFields)
            setEditingPart(null)
          }}
        />
      )}
    </div>
  )
}

export default TestEditor