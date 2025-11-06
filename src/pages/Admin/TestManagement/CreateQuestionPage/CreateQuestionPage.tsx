import React, { useEffect, useState } from "react";
import api from "../../../../config/axios.js";
import { getAllParts } from "../../../../service/partService";
import LoadingSkeleton from "../../../../components/common/LoadingSpinner/LoadingSkeleton.js";
import { getTestDetail } from "../../../../service/testService.js";
import { useSearchParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";

interface Test {
  slug: string;
  title: string;
}

interface Part {
  _id: string;
  title: string;
  partNumber: number;
}

interface Choice {
  label: "A" | "B" | "C" | "D";
  text: string;
  isCorrect: boolean;
}

interface Group {
  id?: string;
  text?: string;
  image?: File | null;
  audio?: File | null;
}

interface Question {
  title: string;
  partNumber: number;
  questionNumber: number;
  globalQuestionNumber: number;
  group?: Group | null;
  question: string;
  choices: Choice[];
  correctAnswer: "A" | "B" | "C" | "D";
  explanation?: string;
}

export default function CreateQuestionPage() {
  const [testDetail, setTestDetail] = useState<Test | null>(null);
  const [parts, setParts] = useState<Part[]>([]);
  const [selectedPartId, setSelectedPartId] = useState("");
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingTest, setLoadingTest] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [questions, setQuestions] = useState<Question[]>([]);

  const [searchParams] = useSearchParams();
  const slug = searchParams.get("slug");
  // -------------------- FETCH TESTS --------------------
  useEffect(() => {
    const fetchTest = async () => {
      try {
        const res = await getTestDetail(slug);
        setTestDetail(res?.data?.test);
      } catch (err: any) {
        toast.error(`Lỗi tải đề thi: ${err.message}`);
      }
    };
    fetchTest();
  }, []);

  // -------------------- FETCH PARTS --------------------
  useEffect(() => {
    if (slug) {
      const fetchParts = async () => {
        try {
          const data = await getAllParts(slug);
          setParts(data?.partWithCounts || []);
        } catch (err: any) {
          toast.error(`Lỗi tải danh sách part: ${err.message}`);
        }
      };
      fetchParts();
    }
  }, [slug]);

  // -------------------- UTILS --------------------
  const getDefaultChoices = (partNumber: number): Choice[] => {
    const base = [
      { label: "A", text: "", isCorrect: false },
      { label: "B", text: "", isCorrect: false },
      { label: "C", text: "", isCorrect: false },
      { label: "D", text: "", isCorrect: false },
    ];
    return partNumber === 2 ? base.slice(0, 3) : base;
  };

  const isGroupedPart = (partNumber: number) =>
    [3, 4, 6, 7].includes(partNumber);

  // -------------------- HANDLE PART CHANGE --------------------
  const handleSelectPart = (partId: string) => {
    setSelectedPartId(partId);
    const selectedPart = parts.find((p) => p._id === partId);
    if (!selectedPart) {
      toast.error("Vui lòng chọn part để tạo câu hỏi");
      return;
    }
    setGroups([]);
    setQuestions([]);
  };

  // -------------------- GROUP MANAGEMENT --------------------
  const handleAddGroup = () => {
    setGroups((prev) => [
      ...prev,
      { id: crypto.randomUUID(), text: "", image: null, audio: null },
    ]);
  };

  const handleRemoveGroup = (groupId: string) => {
    setGroups((prev) => prev.filter((g) => g.id !== groupId));
    setQuestions((prev) => prev.filter((q) => q.group?.id !== groupId));
  };

  const handleGroupChange = (
    groupId: string,
    field: keyof Group,
    value: any
  ) => {
    setGroups((prev) =>
      prev.map((g) => (g.id === groupId ? { ...g, [field]: value } : g))
    );
  };

  // -------------------- QUESTION MANAGEMENT --------------------
  const handleAddQuestion = (groupId?: string) => {
    const selectedPart = parts.find((p) => p._id === selectedPartId);
    if (!selectedPart) return;

    const partNumber = selectedPart.partNumber;
    const newQuestion: Question = {
      title: "",
      partNumber,
      questionNumber: questions.length + 1,
      globalQuestionNumber: questions.length + 1,
      question: "",
      choices: getDefaultChoices(partNumber),
      correctAnswer: "A",
      explanation: "",
      group: isGroupedPart(partNumber)
        ? groups.find((g) => g.id === groupId) || null
        : null,
    };
    setQuestions((prev) => [...prev, newQuestion]);
  };

  const handleRemoveQuestion = (index: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleInputChange = (
    index: number,
    field: keyof Question,
    value: any
  ) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === index ? { ...q, [field]: value } : q))
    );
  };

  const handleChoiceChange = (
    qIndex: number,
    cIndex: number,
    field: keyof Choice,
    value: any
  ) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIndex
          ? {
              ...q,
              choices: q.choices.map((c, j) =>
                j === cIndex ? { ...c, [field]: value } : c
              ),
            }
          : q
      )
    );
  };

  // -------------------- SUBMIT --------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const selectedPart = parts.find((p) => p._id === selectedPartId);
    if (!selectedPart) {
      toast.warn("Vui lòng chọn part!");
      return;
    }

    if (questions.length === 0) {
      toast.error(
        "Bạn chưa thêm câu hỏi nào! Vui lòng thêm ít nhất 1 câu hỏi."
      );
      return;
    }

    // Validate đáp án
    for (const q of questions) {
      const emptyChoice = q.choices.some((choice) => !choice.text.trim());
      if (emptyChoice) {
        toast.error("Vui lòng điền đầy đủ nội dung tất cả đáp án!");
        return;
      }

      // Kiểm tra phải có đáp án đúng (phòng trường hợp bug radio)
      const correctExists = q.choices.some((c) => c.label === q.correctAnswer);
      if (!correctExists) {
        toast.error("Vui lòng chọn đáp án đúng cho tất cả câu hỏi!");
        return;
      }

      // Đảm bảo nội dung câu hỏi không trống
      const requiresQuestionText = ![1, 6].includes(q.partNumber);

      if (requiresQuestionText && !q.question.trim()) {
        toast.error("Vui lòng nhập nội dung câu hỏi!");
        return;
      }
    }

    const formData = new FormData();
    formData.append("slug", slug ?? "");
    formData.append("partId", selectedPartId);

    // Map để tracking file references cho từng group/question
    const fileReferences = new Map<
      string,
      { image?: string; audio?: string }
    >();
    let fileCounter = 0;

    const isGroupedPart = [3, 4, 6, 7].includes(selectedPart.partNumber);

    // part có GROUP (3,4,6,7)
    if (isGroupedPart) {
      const hasEmptyGroup = groups.some(
        (group) => !questions.some((q) => q.group?.id === group.id)
      );

      if (hasEmptyGroup) {
        toast.error(
          "Nhóm đang trống! Vui lòng thêm ít nhất 1 câu hỏi cho mỗi nhóm."
        );
        return;
      }
      groups.forEach((g) => {
        if (!g.id) return;

        const refs: { image?: string; audio?: string } = {};

        if (g.image) {
          const fieldName = `file_${fileCounter}`;
          formData.append(fieldName, g.image);
          refs.image = fieldName;
          fileCounter++;
        }

        if (g.audio) {
          const fieldName = `file_${fileCounter}`;
          formData.append(fieldName, g.audio);
          refs.audio = fieldName;
          fileCounter++;
        }

        fileReferences.set(g.id, refs);
      });
    }
    //part KHÔNG có group (1,2,5)
    else {
      questions.forEach((q, qIdx) => {
        const refs: { image?: string; audio?: string } = {};

        if (q.group?.image) {
          const fieldName = `file_${fileCounter}`;
          formData.append(fieldName, q.group.image);
          refs.image = fieldName;
          fileCounter++;
        }

        if (q.group?.audio) {
          const fieldName = `file_${fileCounter}`;
          formData.append(fieldName, q.group.audio);
          refs.audio = fieldName;
          fileCounter++;
        }

        fileReferences.set(`q_${qIdx}`, refs);
      });
    }

    //Tạo cleanedQuestions với file references
    const cleanedQuestions = questions.map((q, index) => {
      let imageRef = "";
      let audioRef = "";
      let groupId = undefined;
      let text = undefined;

      if (isGroupedPart && q.group?.id) {
        // Part có group: lấy references từ groupId
        const refs = fileReferences.get(q.group.id);
        imageRef = refs?.image || "";
        audioRef = refs?.audio || "";
        groupId = q.group.id;
        text = q.group.text;
      } else if (!isGroupedPart && q.group) {
        // Part không có group: lấy references từ question index
        const refs = fileReferences.get(`q_${index}`);
        imageRef = refs?.image || "";
        audioRef = refs?.audio || "";
      }

      return {
        title: q.title,
        partNumber: q.partNumber,
        questionNumber: q.questionNumber,
        globalQuestionNumber: q.globalQuestionNumber,
        question: q.question,
        choices: q.choices,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        ...(imageRef || audioRef || groupId || text
          ? {
              group: {
                ...(text ? { text } : {}),
                ...(imageRef ? { image: imageRef } : {}),
                ...(audioRef ? { audio: audioRef } : {}),
                ...(groupId ? { groupId } : {}),
              },
            }
          : {}),
      };
    });

    formData.append("questions", JSON.stringify(cleanedQuestions));

    // Debug: Xem FormData đã gửi gì
    // console.log("=== FormData Debug ===");
    // console.log("Questions:", cleanedQuestions);
    // for (let pair of formData.entries()) {
    //   if (pair[1] instanceof File) {
    //     console.log(pair[0], "=>", pair[1].name, `(${pair[1].size} bytes)`);
    //   } else {
    //     console.log(
    //       pair[0],
    //       "=>",
    //       typeof pair[1] === "string" && pair[1].length > 100
    //         ? pair[1].substring(0, 100) + "..."
    //         : pair[1]
    //     );
    //   }
    // }

    try {
      setLoading(true);
      await api.post(`/question`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Tạo câu hỏi thành công!");
    } catch (error: any) {
      toast.error(`Lỗi: ${error.response?.data?.message || error.message}`);
    } finally {
      setQuestions([]);
      setGroups([]);
      setLoading(false);
    }
  };

  // -------------------- RENDER --------------------
  const selectedPart = parts.find((p) => p._id === selectedPartId);
  const partNumber = selectedPart?.partNumber ?? 0;

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-6">
        <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-blue-600 mb-6 text-center">
            📝 Tạo danh sách câu hỏi
          </h1>

          {/* Test & Part */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {/* ✅ Hiển thị thông tin đề thi */}
            <div className="p-4 bg-blue-50 border border-blue-300 rounded-lg shadow-sm">
              {loadingTest ? (
                <p className="text-gray-600">⏳ Đang tải đề thi...</p>
              ) : error ? (
                <p className="text-red-600 font-semibold">{error}</p>
              ) : testDetail ? (
                <>
                  <p className="text-lg font-bold text-blue-700">
                    {testDetail.title}
                  </p>
                </>
              ) : (
                <p className="text-gray-500 italic">Chưa có dữ liệu đề thi</p>
              )}
            </div>

            <div>
              <select
                className="w-full border rounded-lg p-3"
                value={selectedPartId}
                onChange={(e) => handleSelectPart(e.target.value)}
              >
                <option value="">-- Chọn Part --</option>
                {parts.map((part) => (
                  <option key={part._id} value={part._id}>
                    Part {part.partNumber}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-10">
            {/* Nếu part có group */}
            {isGroupedPart(partNumber) ? (
              <>
                {groups.map((group, gi) => (
                  <div
                    key={group.id}
                    className="border border-blue-300 rounded-2xl p-6 bg-blue-50 shadow-sm"
                  >
                    <div className="flex justify-between items-center mb-3">
                      <h2 className="text-lg font-bold text-blue-700">
                        Group #{gi + 1}
                      </h2>
                      <button
                        type="button"
                        onClick={() => handleRemoveGroup(group.id!)}
                        className="text-red-500 hover:underline"
                      >
                        Xóa nhóm
                      </button>
                    </div>

                    <textarea
                      className="w-full border rounded-lg p-2 mb-3"
                      placeholder="Nội dung đoạn văn hoặc mô tả"
                      value={group.text}
                      onChange={(e) =>
                        handleGroupChange(group.id!, "text", e.target.value)
                      }
                    />

                    <div className="flex gap-4 mb-3">
                      <div>
                        <label className="text-sm text-gray-600">Ảnh</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            handleGroupChange(
                              group.id!,
                              "image",
                              e.target.files?.[0] || null
                            )
                          }
                        />
                      </div>
                      {/* <div>
                        <label className="text-sm text-gray-600">
                          Âm thanh
                        </label>
                        <input
                          type="file"
                          accept="audio/*"
                          onChange={(e) =>
                            handleGroupChange(
                              group.id!,
                              "audio",
                              e.target.files?.[0] || null
                            )
                          }
                        />
                      </div> */}
                    </div>

                    {questions
                      .filter((q) => q.group?.id === group.id)
                      .map((q, qi) => (
                        <div
                          key={qi}
                          className="border border-blue-200 rounded-xl bg-white p-4 mb-4"
                        >
                          <input
                            type="text"
                            placeholder="Câu hỏi"
                            className="border rounded-lg p-2 w-full"
                            value={q.question}
                            onChange={(e) =>
                              handleInputChange(
                                questions.indexOf(q),
                                "question",
                                e.target.value
                              )
                            }
                          />

                          {q.choices.map((c, ci) => (
                            <div
                              key={ci}
                              className="flex items-center gap-2 mt-2 bg-blue-50 p-2 rounded-lg"
                            >
                              <span className="font-bold">{c.label}.</span>
                              <input
                                type="text"
                                className="flex-1 border rounded-lg p-1"
                                value={c.text}
                                onChange={(e) =>
                                  handleChoiceChange(
                                    questions.indexOf(q),
                                    ci,
                                    "text",
                                    e.target.value
                                  )
                                }
                              />
                              <input
                                type="radio"
                                name={`correct-${q.globalQuestionNumber}`}
                                checked={q.correctAnswer === c.label}
                                onChange={() =>
                                  handleInputChange(
                                    questions.indexOf(q),
                                    "correctAnswer",
                                    c.label
                                  )
                                }
                              />
                              <span className="text-sm">Đúng</span>
                            </div>
                          ))}
                        </div>
                      ))}

                    <button
                      type="button"
                      onClick={() => handleAddQuestion(group.id!)}
                      className="mt-2 px-3 py-1 bg-blue-500 text-white rounded-lg"
                    >
                      ➕ Thêm câu hỏi vào nhóm này
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={handleAddGroup}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg"
                >
                  ➕ Thêm nhóm mới
                </button>
              </>
            ) : (
              <>
                {questions.map((q, i) => (
                  <div
                    key={i}
                    className="border border-blue-200 rounded-2xl p-6 shadow-sm bg-blue-50"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-lg font-bold text-blue-700">
                        Câu hỏi #{i + 1} (Part {q.partNumber})
                      </h2>
                      <button
                        type="button"
                        onClick={() => handleRemoveQuestion(i)}
                        className="text-red-500 hover:underline"
                      >
                        Xóa
                      </button>
                    </div>

                    <input
                      type="text"
                      placeholder="Câu hỏi"
                      className="border rounded-lg p-2 w-full"
                      value={q.question}
                      onChange={(e) =>
                        handleInputChange(i, "question", e.target.value)
                      }
                    />
                    {/* --- Upload files --- */}
                    <div className="flex gap-4 mt-3">
                      <div>
                        <label className="text-sm text-gray-600">Ảnh</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            handleInputChange(i, "group", {
                              ...(q.group || {}),
                              image: e.target.files?.[0] || null,
                            })
                          }
                        />
                      </div>
                      {/* <div>
                        <label className="text-sm text-gray-600">
                          Âm thanh
                        </label>
                        <input
                          type="file"
                          accept="audio/*"
                          onChange={(e) =>
                            handleInputChange(i, "group", {
                              ...(q.group || {}),
                              audio: e.target.files?.[0] || null,
                            })
                          }
                        />
                      </div> */}
                    </div>

                    {q.choices.map((c, ci) => (
                      <div
                        key={ci}
                        className="flex items-center gap-2 mt-2 bg-white p-2 rounded-lg"
                      >
                        <span className="font-bold">{c.label}.</span>
                        <input
                          type="text"
                          className="flex-1 border rounded-lg p-1"
                          value={c.text}
                          onChange={(e) =>
                            handleChoiceChange(i, ci, "text", e.target.value)
                          }
                        />
                        <input
                          type="radio"
                          name={`correct-${i}`}
                          checked={q.correctAnswer === c.label}
                          onChange={() =>
                            handleInputChange(i, "correctAnswer", c.label)
                          }
                        />
                        <span className="text-sm text-gray-500">Đúng</span>
                      </div>
                    ))}
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => handleAddQuestion()}
                  className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600"
                >
                  ➕ Thêm câu hỏi
                </button>
              </>
            )}

            <button
              type="submit"
              className="block w-full bg-blue-600 text-white py-3 rounded-2xl font-semibold hover:bg-blue-700 mt-6"
            >
              🚀 Lưu danh sách câu hỏi
            </button>
          </form>
        </div>
      </div>
      {loading && (
        <div className="fixed inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center z-50">
          <LoadingSkeleton />
        </div>
      )}
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnHover
        draggable
        theme="colored"
      />
    </>
  );
}
