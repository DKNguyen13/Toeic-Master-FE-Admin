export const toeicTest = {
  id: 1,
  title: "Bộ đề luyện tập 1",
  image: "https://picsum.photos/200/300",
  questions: 10,
  students: 198,
  level: "Advanced",
  audio: 'toeic_test_full_audio.mp3',
  listening: {
    part1: [
      {
        image: 'photo1.jpg',
        options: [
          'A man is cooking in the kitchen.',
          'A woman is walking a dog.',
          'A child is drawing a picture.',
          'Some people are riding bikes.',
        ],
        answer: 0,
      },
      // 5 câu còn lại giống cấu trúc trên
    ],
    part2: [
      {
        question: 'Where is the nearest train station?',
        options: [
          'It closes at 9 p.m.',
          'About 10 minutes from here.',
          'I take the bus every day.',
        ],
        answer: 1,
      },
      // 24 câu còn lại
    ],
    part3: [
      {
        questions: [
          {
            question: 'What are the speakers mainly discussing?',
            options: ['A delivery', 'A meeting', 'A vacation', 'A product'],
            answer: 1,
          },
          {
            question: 'Where does the woman work?',
            options: ['At a bank', 'At a hospital', 'At a supermarket', 'At a hotel'],
            answer: 3,
          },
          {
            question: 'What will the man do next?',
            options: ['Send an email', 'Make a call', 'Visit the office', 'Schedule a meeting'],
            answer: 0,
          },
        ],
      },
      // 12 đoạn hội thoại còn lại
    ],
    part4: [
      {
        questions: [
          {
            question: 'What is the purpose of the talk?',
            options: [
              'To introduce a speaker',
              'To give travel instructions',
              'To provide weather updates',
              'To explain a schedule change',
            ],
            answer: 3,
          },
          {
            question: 'When will the event start?',
            options: ['At 9 a.m.', 'At noon', 'At 3 p.m.', 'At 6 p.m.'],
            answer: 2,
          },
          {
            question: 'What are listeners asked to bring?',
            options: ['ID cards', 'Notebooks', 'Umbrellas', 'Tickets'],
            answer: 0,
          },
        ],
      },
      // 9 bài nói còn lại
    ],
  },
  reading: {
    part5: [
      {
        sentence: 'She ______ to the office every morning.',
        options: ['go', 'goes', 'gone', 'going'],
        answer: 1,
      },
      // 29 câu còn lại
    ],
    part6: [
      {
        passage: 'Dear Mr. Lee, \nThank you for your interest in our product. We are pleased to ______ you a discount.\nSincerely,\nSales Department',
        blanks: [
          {
            options: ['offer', 'offers', 'offering', 'offered'],
            answer: 0,
          },
        ],
      },
      // 3 đoạn còn lại, mỗi đoạn có khoảng 4 chỗ trống
    ],
    part7: [
      {
        passage: {
          title: 'Office Memo',
          content:
            'All employees must attend the meeting at 10 a.m. on Friday in the main conference room. Attendance is mandatory.',
        },
        questions: [
          {
            question: 'What is the memo mainly about?',
            options: [
              'A new company policy',
              'A scheduled meeting',
              'A room change',
              'An employee survey',
            ],
            answer: 1,
          },
          {
            question: 'When is the meeting?',
            options: ['Monday', 'Tuesday', 'Thursday', 'Friday'],
            answer: 3,
          },
        ],
      },
      // nhiều đoạn đơn + đoạn đôi/triple
    ],
  },
  
};
