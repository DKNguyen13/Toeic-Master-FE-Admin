import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import { Save, ChevronDown, ChevronUp, AlertCircle, CheckCircle, Loader2, ArrowLeft } from 'lucide-react';
import { getTestInfo, updateTest } from '../../../../service/testService.js';

interface Choice {
  _id: string;
  label: 'A' | 'B' | 'C' | 'D';
  text: string;
  isCorrect: boolean;
}

interface QuestionGroup {
  groupId: string;
  text: string;
  audio: string;
  image: string[];
}

interface Question {
  _id: string;
  questionNumber: number;
  globalQuestionNumber: number;
  question: string;
  choices: Choice[];
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  explanation: string;
  group: QuestionGroup;
}

interface Part {
  _id: string;
  testId: string;
  partNumber: number;
  category: 'Listening' | 'Reading';
  instructions: string;
  description: string;
  audioFile: string;
  totalQuestions: number;
  questions: Question[];
}

interface DefaultConfig {
  timeLimit: number;
  parts: number[];
  shuffleQuestions: boolean;
  showResult: boolean;
  allowReview: boolean;
}

interface Test {
  _id: string;
  title: string;
  testCode: string;
  audio: string;
  description: string;
  isActive: boolean;
  defaultConfig: DefaultConfig;
}

interface TestData {
  test: Test;
  parts: Part[];
}

interface UpdateData {
  testInfo: {
    title: string;
    audio: string;
    description: string;
    isActive: boolean;
    defaultConfig: DefaultConfig;
  };
  parts: Array<{
    partId: string;
    instructions: string;
    description: string;
    audioFile: string;
    totalQuestions: number;
  }>;
  questions: Array<{
    questionId: string;
    question: string;
    choices: Choice[];
    correctAnswer: 'A' | 'B' | 'C' | 'D';
    explanation: string;
    group: QuestionGroup;
  }>;
}

const TestEditor: React.FC = () => {
  const navigate = useNavigate();
  const [testData, setTestData] = useState<TestData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [expandedParts, setExpandedParts] = useState<Record<string, boolean>>({});
  const [expandedQuestions, setExpandedQuestions] = useState<Record<string, boolean>>({});

  // Mock testId - trong thực tế sẽ lấy từ URL params
  const { slug } = useParams<{ slug: string }>();

  useEffect(() => {
    fetchTestData();
  }, []);

  const fetchTestData = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      // Mock API call - thay thế bằng fetch thực tế
      let mockData: TestData = {
        test: {
          _id: '60d5ec49f1b2c8b1f8e4e1a1',
          title: 'TOEIC Practice Test 2024',
          testCode: 'TOEIC-001',
          audio: 'https://example.com/audio.mp3',
          description: 'Full TOEIC test',
          isActive: true,
          defaultConfig: {
            timeLimit: 120,
            parts: [1, 2, 3, 4, 5, 6, 7],
            shuffleQuestions: false,
            showResult: true,
            allowReview: true
          }
        },
        parts: [
          {
            _id: '60d5ec49f1b2c8b1f8e4e1b1',
            testId: '60d5ec49f1b2c8b1f8e4e1a1',
            partNumber: 1,
            category: 'Listening',
            instructions: 'Listen to the audio',
            description: 'Part 1 description',
            audioFile: 'https://example.com/part1.mp3',
            totalQuestions: 6,
            questions: [
              {
                _id: '60d5ec49f1b2c8b1f8e4e1c1',
                questionNumber: 1,
                globalQuestionNumber: 1,
                question: 'What is shown in the picture?',
                choices: [
                  { label: 'A', text: 'Option A', isCorrect: true, _id: 'ch1' },
                  { label: 'B', text: 'Option B', isCorrect: false, _id: 'ch2' },
                  { label: 'C', text: 'Option C', isCorrect: false, _id: 'ch3' },
                  { label: 'D', text: 'Option D', isCorrect: false, _id: 'ch4' }
                ],
                correctAnswer: 'A',
                explanation: 'The correct answer is A',
                group: {
                  groupId: 'grp1',
                  text: 'Look at the picture',
                  audio: 'https://example.com/q1.mp3',
                  image: ['https://example.com/img1.jpg']
                }
              }
            ]
          },
          {
            _id: '60d5ec49f1b2c8b1f8e4e1b2',
            testId: '60d5ec49f1b2c8b1f8e4e1a1',
            partNumber: 2,
            category: 'Listening',
            instructions: 'Listen and answer questions',
            description: 'Part 2 description',
            audioFile: 'https://example.com/part2.mp3',
            totalQuestions: 25,
            questions: [
              {
                _id: '60d5ec49f1b2c8b1f8e4e1c2',
                questionNumber: 1,
                globalQuestionNumber: 7,
                question: 'Where is the meeting?',
                choices: [
                  { label: 'A', text: 'In the conference room', isCorrect: false, _id: 'ch5' },
                  { label: 'B', text: 'In the lobby', isCorrect: true, _id: 'ch6' },
                  { label: 'C', text: 'In the cafeteria', isCorrect: false, _id: 'ch7' },
                  { label: 'D', text: 'In the office', isCorrect: false, _id: 'ch8' }
                ],
                correctAnswer: 'B',
                explanation: 'The speaker mentions the lobby',
                group: {
                  groupId: 'grp2',
                  text: '',
                  audio: 'https://example.com/q7.mp3',
                  image: []
                }
              },
              {
                _id: '60d5ec49f1b2c8b1f8e4e1c3',
                questionNumber: 2,
                globalQuestionNumber: 8,
                question: 'What time does it start?',
                choices: [
                  { label: 'A', text: '9:00 AM', isCorrect: true, _id: 'ch9' },
                  { label: 'B', text: '10:00 AM', isCorrect: false, _id: 'ch10' },
                  { label: 'C', text: '11:00 AM', isCorrect: false, _id: 'ch11' },
                  { label: 'D', text: '12:00 PM', isCorrect: false, _id: 'ch12' }
                ],
                correctAnswer: 'A',
                explanation: '9:00 AM is mentioned in the audio',
                group: {
                  groupId: 'grp3',
                  text: '',
                  audio: 'https://example.com/q8.mp3',
                  image: []
                }
              }
            ]
          }
        ]
      };

      // Thực tế: const response = await fetch(`/api/tests/${testId}/detail`);
      const response = await getTestInfo(slug);
      mockData = await response;
      
      setTestData(mockData);
    } catch (err) {
      setError('Failed to load test data');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (): Promise<void> => {
    if (!testData) return;

    try {
      setSaving(true);
      setError(null);
      setSuccess(false);

      // Prepare update data
      const updateData: UpdateData = {
        testInfo: {
          title: testData.test.title,
          audio: testData.test.audio,
          description: testData.test.description,
          isActive: testData.test.isActive,
          defaultConfig: testData.test.defaultConfig
        },
        parts: testData.parts.map(part => ({
          partId: part._id,
          instructions: part.instructions,
          description: part.description,
          audioFile: part.audioFile,
          totalQuestions: part.totalQuestions
        })),
        questions: testData.parts.flatMap(part => 
          part.questions.map(q => ({
            questionId: q._id,
            question: q.question,
            choices: q.choices,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
            group: q.group
          }))
        )
      };

      // Mock API call
      console.log('Saving:', updateData);
      
      // Thực tế:
      const response = await updateTest(slug, updateData);
      console.log('Save response:', response);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const updateTestField = (field: keyof Test, value: string | boolean): void => {
    if (!testData) return;
    setTestData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        test: { ...prev.test, [field]: value }
      };
    });
  };

  const updateTestConfig = (field: keyof DefaultConfig, value: number | number[] | boolean): void => {
    if (!testData) return;
    setTestData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        test: {
          ...prev.test,
          defaultConfig: { ...prev.test.defaultConfig, [field]: value }
        }
      };
    });
  };

  const updatePart = (partIndex: number, field: keyof Part, value: string | number): void => {
    if (!testData) return;
    setTestData(prev => {
      if (!prev) return prev;
      const newParts = [...prev.parts];
      newParts[partIndex] = { ...newParts[partIndex], [field]: value };
      return { ...prev, parts: newParts };
    });
  };

  const updateQuestion = (partIndex: number, questionIndex: number, field: keyof Question, value: string): void => {
    if (!testData) return;
    setTestData(prev => {
      if (!prev) return prev;
      const newParts = [...prev.parts];
      const newQuestions = [...newParts[partIndex].questions];
      newQuestions[questionIndex] = { ...newQuestions[questionIndex], [field]: value };
      newParts[partIndex] = { ...newParts[partIndex], questions: newQuestions };
      return { ...prev, parts: newParts };
    });
  };

  const updateChoice = (partIndex: number, questionIndex: number, choiceIndex: number, text: string): void => {
    if (!testData) return;
    setTestData(prev => {
      if (!prev) return prev;
      const newParts = [...prev.parts];
      const newQuestions = [...newParts[partIndex].questions];
      const newChoices = [...newQuestions[questionIndex].choices];
      newChoices[choiceIndex] = { ...newChoices[choiceIndex], text };
      newQuestions[questionIndex] = { ...newQuestions[questionIndex], choices: newChoices };
      newParts[partIndex] = { ...newParts[partIndex], questions: newQuestions };
      return { ...prev, parts: newParts };
    });
  };

  const togglePart = (partId: string): void => {
    setExpandedParts(prev => ({ ...prev, [partId]: !prev[partId] }));
  };

  const toggleQuestion = (questionId: string): void => {
    setExpandedQuestions(prev => ({ ...prev, [questionId]: !prev[questionId] }));
  };

  const handleGoBack = (): void => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!testData) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <button
                onClick={handleGoBack}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Quay lại
              </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Cập nhật đề thi</h1>
              <p className="text-sm text-gray-500 mt-1">Mã đề thi: {testData.test.testCode}</p>
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
              {saving ? 'Saving...' : 'Lưu thay đổi'}
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
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Thông tin đề thi</h2>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Tên đề thi</label>
              <input
                id="title"
                type="text"
                value={testData.test.title}
                onChange={(e) => updateTestField('title', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="audio" className="block text-sm font-medium text-gray-700 mb-1">Audio URL</label>
              <input
                id="audio"
                type="text"
                value={testData.test.audio}
                onChange={(e) => updateTestField('audio', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={testData.test.isActive}
                onChange={(e) => updateTestField('isActive', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                Active
              </label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="timeLimit" className="block text-sm font-medium text-gray-700 mb-1">Time Limit (minutes)</label>
                <input
                  id="timeLimit"
                  type="number"
                  value={testData.test.defaultConfig.timeLimit}
                  onChange={(e) => updateTestConfig('timeLimit', parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Parts */}
        {testData.parts.map((part, partIndex) => (
          <div key={part._id} className="bg-white rounded-lg shadow-sm mb-4">
            <div
              onClick={() => togglePart(part._id)}
              className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Part {part.partNumber} - {part.category}
                </h3>
                <p className="text-sm text-gray-500">
                  {part.questions.length} câu hỏi (
                    {part.questions[0]?.globalQuestionNumber || 1}-
                    {part.questions[part.questions.length - 1]?.globalQuestionNumber || part.questions.length}
                  )
                  
                </p>
              </div>
              {expandedParts[part._id] ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </div>

            {expandedParts[part._id] && (
              <div className="p-4 border-t border-gray-200">
                {/* Questions */}
                <div>
                  <h4 className="text-md font-semibold text-gray-900 mb-3">Danh sách câu hỏi</h4>
                  {part.questions.map((question, questionIndex) => (
                    <div key={question._id} className="border border-gray-200 rounded-lg mb-3">
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
                            <label htmlFor={`question-${question._id}`} className="block text-sm font-medium text-gray-700 mb-1">Question</label>
                            <textarea
                              id={`question-${question._id}`}
                              value={question.question}
                              onChange={(e) => updateQuestion(partIndex, questionIndex, 'question', e.target.value)}
                              rows={2}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Choices</label>
                            {question.choices.map((choice, choiceIndex) => (
                              <div key={choice._id} className="flex items-center gap-2 mb-2">
                                <span className="text-sm font-medium text-gray-600 w-6">{choice.label}.</span>
                                <input
                                  type="text"
                                  value={choice.text}
                                  onChange={(e) => updateChoice(partIndex, questionIndex, choiceIndex, e.target.value)}
                                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  aria-label={`Choice ${choice.label}`}
                                />
                              </div>
                            ))}
                          </div>

                          <div>
                            <label htmlFor={`correctAnswer-${question._id}`} className="block text-sm font-medium text-gray-700 mb-1">Correct Answer</label>
                            <select
                              id={`correctAnswer-${question._id}`}
                              value={question.correctAnswer}
                              onChange={(e) => updateQuestion(partIndex, questionIndex, 'correctAnswer', e.target.value)}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                              {question.choices.map(choice => (
                                <option key={choice.label} value={choice.label}>{choice.label}</option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label htmlFor={`explanation-${question._id}`} className="block text-sm font-medium text-gray-700 mb-1">Explanation</label>
                            <textarea
                              id={`explanation-${question._id}`}
                              value={question.explanation}
                              onChange={(e) => updateQuestion(partIndex, questionIndex, 'explanation', e.target.value)}
                              rows={2}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TestEditor;