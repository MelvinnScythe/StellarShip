import generatedReadingMaterial from './generated_reading_material.json';
import generatedQuestionBanks from './generated_question_banks.json';


const completedClass7ReadingTitles = new Set([
  "Integers",
  "Fractions and Decimals"
]);

const normalizeGeneratedTitle = (value) => String(value || '').replace(/\s+/g, ' ').trim();

const parseGeneratedReadingKey = (key) => {
  const parts = key.split(' - ');
  const classMatch = parts[0]?.match(/Class\s+(\d+)/);
  const classNum = classMatch ? Number(classMatch[1]) : undefined;
  const subject = parts[1] || '';
  const hasSocialBranch = subject === 'Social Science' && ['History', 'Geography', 'Civics'].includes(parts[2]);
  const titleStart = hasSocialBranch ? 3 : 2;
  return {
    classNum,
    subject: hasSocialBranch ? `${subject} - ${parts[2]}` : subject,
    title: normalizeGeneratedTitle(parts.slice(titleStart).join(' - '))
  };
};

const generatedReadingRecords = Object.entries(generatedReadingMaterial)
  .map(([key, data]) => ({ key, data, ...parseGeneratedReadingKey(key) }));

const generatedReadingTitlePools = generatedReadingRecords.reduce((pools, record) => {
  const poolKey = `${record.classNum}::${record.subject}`;
  const titles = pools.get(poolKey) || [];
  titles.push(record.title);
  pools.set(poolKey, titles);
  return pools;
}, new Map());

const cleanGeneratedText = (value) => String(value || '')
  .replace(/<[^>]*>/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const shortenGeneratedText = (value, limit = 150) => {
  const text = cleanGeneratedText(value);
  if (text.length <= limit) return text;
  const clipped = text.slice(0, limit);
  return `${clipped.slice(0, Math.max(clipped.lastIndexOf(' '), 80)).trim()}...`;
};

const getGeneratedClue = (lesson) => {
  const text = cleanGeneratedText(lesson?.explanation);
  const firstSentence = text.match(/[^.!?।]+[.!?।]?/)?.[0] || text;
  return shortenGeneratedText(firstSentence, 150);
};

const rotateGeneratedOptions = (options, seed) => {
  if (!options.length) return options;
  const offset = seed % options.length;
  return [...options.slice(offset), ...options.slice(0, offset)];
};

const makeGeneratedOptions = (answer, candidates, seed) => {
  const seen = new Set([normalizeGeneratedTitle(answer).toLowerCase()]);
  const options = [answer];

  for (const candidate of candidates) {
    const normalized = normalizeGeneratedTitle(candidate);
    const key = normalized.toLowerCase();
    if (!normalized || seen.has(key)) continue;
    seen.add(key);
    options.push(normalized);
    if (options.length === 4) break;
  }

  for (const fallback of ['Practice Review', 'Chapter Summary', 'Final Assessment', 'Key Vocabulary']) {
    if (options.length === 4) break;
    if (seen.has(fallback.toLowerCase())) continue;
    seen.add(fallback.toLowerCase());
    options.push(fallback);
  }

  return rotateGeneratedOptions(options, seed);
};

const buildGeneratedQuiz = (record) => {
  const lessons = Array.isArray(record.data.lessons) ? record.data.lessons : [];
  const lessonTitles = lessons.map((lesson) => normalizeGeneratedTitle(lesson.title)).filter(Boolean);
  const quiz = lessons.slice(0, 5).map((lesson, index) => {
    const answer = normalizeGeneratedTitle(lesson.title);
    return {
      question: `Which subtopic best matches this idea: "${getGeneratedClue(lesson)}"?`,
      options: makeGeneratedOptions(answer, lessonTitles, record.title.length + index),
      answer
    };
  });

  if (quiz.length < 5) {
    const siblingTitles = generatedReadingTitlePools.get(`${record.classNum}::${record.subject}`) || [];
    const clueTitles = lessonTitles.slice(0, 2).join('" and "');
    quiz.push({
      question: `Which chapter includes the subtopics "${clueTitles}"?`,
      options: makeGeneratedOptions(record.title, siblingTitles, record.title.length + quiz.length),
      answer: record.title
    });
  }

  while (quiz.length < 5) {
    quiz.push({
      question: `Which chapter are you studying in this lesson set?`,
      options: makeGeneratedOptions(record.title, generatedReadingRecords.map((item) => item.title), record.title.length + quiz.length),
      answer: record.title
    });
  }

  return quiz.slice(0, 5);
};

const generatedReadingByClassAndTitle = new Map();
const generatedReadingByTitle = new Map();
const generatedReadingTitleCounts = new Map();

for (const record of generatedReadingRecords) {
  const titleKey = normalizeGeneratedTitle(record.title);
  generatedReadingTitleCounts.set(titleKey, (generatedReadingTitleCounts.get(titleKey) || 0) + 1);
}

for (const record of generatedReadingRecords) {
  const entry = {
    content: record.data.content,
    quiz: buildGeneratedQuiz(record),
    lessons: Array.isArray(record.data.lessons) ? record.data.lessons : []
  };
  const titleKey = normalizeGeneratedTitle(record.title);
  generatedReadingByClassAndTitle.set(`${record.classNum}::${titleKey}`, entry);
  if (generatedReadingTitleCounts.get(titleKey) === 1) {
    generatedReadingByTitle.set(titleKey, entry);
  }
}

const findGeneratedReadingEntry = (title, classNum) => {
  const titleKey = normalizeGeneratedTitle(title);
  if (classNum) {
    const classSpecific = generatedReadingByClassAndTitle.get(`${classNum}::${titleKey}`);
    return classSpecific || null;
  }
  return generatedReadingByTitle.get(titleKey);
};

const hasCompletedReadingForOtherClass = (title, classNum) => {
  if (!classNum) return false;
  const titleKey = normalizeGeneratedTitle(title);
  return generatedReadingRecords.some((record) => (
    normalizeGeneratedTitle(record.title) === titleKey && record.classNum !== classNum
  ));
};

const getClassSpecificPlaceholderResult = (title, subject, lessonNum) => {
  const quiz = [
    { "question": `Which of the following is a key component when studying ${title}?`, "options": ["Understanding core principles", "Ignoring the context", "Memorizing without practice", "Skipping the basics"], "answer": "Understanding core principles" },
    { "question": `How does ${title} primarily relate to ${subject}?`, "options": [`It provides a foundational understanding of ${subject}`, "It is completely unrelated", "It only applies to historical contexts", "It is only useful for advanced scholars"], "answer": `It provides a foundational understanding of ${subject}` },
    { "question": `What is the best way to master the concepts in ${title}?`, "options": ["Consistent practice and review", "Reading the title once", "Guessing the answers", "Skipping the assignments"], "answer": "Consistent practice and review" },
    { "question": `Why is analyzing the structure of ${title} important?`, "options": ["It helps break down complex ideas into manageable parts", "It makes the topic more confusing", "It wastes valuable study time", "It is only required for exams"], "answer": "It helps break down complex ideas into manageable parts" },
    { "question": `What is the ultimate goal of completing the lessons in ${title}?`, "options": ["To apply the knowledge in real-world scenarios", "To forget it after the test", "To memorize the chapter title", "To skip the final assessment"], "answer": "To apply the knowledge in real-world scenarios" }
  ];

  return {
    content: `<h3><strong>Introduction & Concept Deep-Dive: ${title}</strong></h3>
              <p>Welcome to this in-depth module on <strong>${title}</strong>. This chapter introduces essential concepts that form the backbone of your studies in ${subject}. As you navigate through this material, you will discover the underlying mechanisms that define the topic, allowing you to connect theoretical ideas with practical, real-world applications.</p>
              <br/>
              <p>Mastering this subject requires dedication and a strong grasp of foundational knowledge. We have structured this curriculum to guide you through increasingly complex ideas, ensuring every new piece of information builds logically upon the last. You will explore key concepts, activities, and practice exercises for ${title}.</p>
              <br/>
              <p><em>Full AI-generated content for this chapter is being processed in the background. Answer the 5 questions below to complete this lesson!</em></p>`,
    quiz,
    topics: ["Introduction & Concept Deep-Dive", "Key Concepts - Part 1", "Key Concepts - Part 2", "Key Concepts - Part 3 & Activities", "Final Assessment"]
  };
};

const getGeneratedTopics = (lessons) => {
  // Build topic list from the 4 actual lesson titles, plus a Final Assessment
  const topics = lessons.slice(0, 4).map((lesson) => normalizeGeneratedTitle(lesson.title)).filter(Boolean);
  while (topics.length < 4) topics.push('Practice & Review');
  topics.push('Final Assessment');
  return topics; // Always exactly 5 items
};

const getGeneratedLessonResult = (title, subject, lessonNum, classNum) => {
  const data = findGeneratedReadingEntry(title, classNum);
  if (!data) return null;

  const lessons = Array.isArray(data.lessons) ? data.lessons : [];
  const topics = getGeneratedTopics(lessons);
  const isFinalAssessment = lessonNum === 5; // Lesson 5 = Final Assessment
  const isOutOfRange = lessonNum > 4 && !isFinalAssessment;

  if (isFinalAssessment) {
    return {
      content: `<h3><strong>Chapter Final Assessment</strong></h3>
                <p>You have completed all reading lessons for this chapter. Review the main ideas, then answer all the questions below to complete your mission!</p>`,
      quiz: data.quiz, // Show ALL 5 questions on final assessment
      lessons,
      topics
    };
  }

  if (isOutOfRange) {
    return {
      content: `<h3><strong>Practice & Review</strong></h3>
                <p>Review the chapter lessons and key ideas before attempting the final assessment.</p>`,
      quiz: data.quiz.slice(0, 2),
      lessons,
      topics
    };
  }

  const lesson = lessons[lessonNum - 1] || lessons[0];
  // For each individual lesson, show all 5 questions so students are always engaged
  return {
    content: `<h3><strong>${lesson.title}</strong></h3>
              <p>${lesson.explanation || data.content}</p>`,
    quiz: data.quiz,
    lessons,
    topics
  };
};

const getLessonContentOriginal = (title, subject, lessonNum = 1, classNum) => {
  let data;
  const rawTitle = title;
  // Clean title for matching (remove prefixes and subtopic suffixes)
  let cleanTitle = title.split(" - ").pop();
  if (cleanTitle.includes(": ")) {
    cleanTitle = cleanTitle.split(": ")[0];
  }

  const generatedReadingResult = getGeneratedLessonResult(rawTitle, subject, lessonNum, classNum) || getGeneratedLessonResult(cleanTitle, subject, lessonNum, classNum);
  if (generatedReadingResult) {
    return generatedReadingResult;
  }

  if (hasCompletedReadingForOtherClass(rawTitle, classNum) || hasCompletedReadingForOtherClass(cleanTitle, classNum)) {
    return getClassSpecificPlaceholderResult(rawTitle, subject, lessonNum);
  }

  const specificData = {
    "Who Did Patrick's Homework?": {
      content: "Welcome to the lesson on Who Did Patrick's Homework?! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Who Did Patrick's Homework??", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Who Did Patrick's Homework??", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "How the Dog Found Himself a New Master!": {
      content: "Welcome to the lesson on How the Dog Found Himself a New Master!! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in How the Dog Found Himself a New Master!?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from How the Dog Found Himself a New Master!?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Taro's Reward": {
      content: "Welcome to the lesson on Taro's Reward! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Taro's Reward?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Taro's Reward?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "An Indian - American Woman in Space: Kalpana Chawla": {
      content: "Welcome to the lesson on An Indian - American Woman in Space: Kalpana Chawla! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in An Indian - American Woman in Space: Kalpana Chawla?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from An Indian - American Woman in Space: Kalpana Chawla?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "A Different Kind of School": {
      content: "Welcome to the lesson on A Different Kind of School! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in A Different Kind of School?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from A Different Kind of School?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Who I Am": {
      content: "Welcome to the lesson on Who I Am! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Who I Am?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Who I Am?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Fair Play": {
      content: "Welcome to the lesson on Fair Play! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Fair Play?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Fair Play?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "A Game of Chance": {
      content: "Welcome to the lesson on A Game of Chance! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in A Game of Chance?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from A Game of Chance?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Desert Animals": {
      content: "Welcome to the lesson on Desert Animals! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Desert Animals?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Desert Animals?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "The Banyan Tree": {
      content: "Welcome to the lesson on The Banyan Tree! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in The Banyan Tree?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from The Banyan Tree?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "A Tale of Two Birds": {
      content: "Welcome to the lesson on A Tale of Two Birds! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in A Tale of Two Birds?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from A Tale of Two Birds?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "The Friendly Mongoose": {
      content: "Welcome to the lesson on The Friendly Mongoose! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in The Friendly Mongoose?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from The Friendly Mongoose?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "The Shepherd's Treasure": {
      content: "Welcome to the lesson on The Shepherd's Treasure! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in The Shepherd's Treasure?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from The Shepherd's Treasure?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "The Old-Clock Shop": {
      content: "Welcome to the lesson on The Old-Clock Shop! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in The Old-Clock Shop?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from The Old-Clock Shop?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Tansen": {
      content: "Welcome to the lesson on Tansen! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Tansen?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Tansen?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "The Monkey and the Crocodile": {
      content: "Welcome to the lesson on The Monkey and the Crocodile! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in The Monkey and the Crocodile?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from The Monkey and the Crocodile?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "The Wonder Called Sleep": {
      content: "Welcome to the lesson on The Wonder Called Sleep! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in The Wonder Called Sleep?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from The Wonder Called Sleep?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "A Pact with the Sun": {
      content: "Welcome to the lesson on A Pact with the Sun! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in A Pact with the Sun?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from A Pact with the Sun?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "What Happened to the Reptiles": {
      content: "Welcome to the lesson on What Happened to the Reptiles! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in What Happened to the Reptiles?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from What Happened to the Reptiles?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "A Strange Wrestling Match": {
      content: "Welcome to the lesson on A Strange Wrestling Match! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in A Strange Wrestling Match?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from A Strange Wrestling Match?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "वह चिड़िया जो": {
      content: "Welcome to the lesson on वह चिड़िया जो! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in वह चिड़िया जो?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from वह चिड़िया जो?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "बचपन": {
      content: "Welcome to the lesson on बचपन! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in बचपन?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from बचपन?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "नादान दोस्त": {
      content: "Welcome to the lesson on नादान दोस्त! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in नादान दोस्त?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from नादान दोस्त?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "चाँद से थोड़ी-सी गप्पें": {
      content: "Welcome to the lesson on चाँद से थोड़ी-सी गप्पें! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in चाँद से थोड़ी-सी गप्पें?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from चाँद से थोड़ी-सी गप्पें?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "अक्षरों का महत्व": {
      content: "Welcome to the lesson on अक्षरों का महत्व! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in अक्षरों का महत्व?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from अक्षरों का महत्व?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "पार नज़र के": {
      content: "Welcome to the lesson on पार नज़र के! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in पार नज़र के?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from पार नज़र के?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "साथी हाथ बढ़ाना": {
      content: "Welcome to the lesson on साथी हाथ बढ़ाना! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in साथी हाथ बढ़ाना?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from साथी हाथ बढ़ाना?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "ऐसे-ऐसे": {
      content: "Welcome to the lesson on ऐसे-ऐसे! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in ऐसे-ऐसे?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from ऐसे-ऐसे?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "टिकट अलबम": {
      content: "Welcome to the lesson on टिकट अलबम! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in टिकट अलबम?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from टिकट अलबम?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "झाँसी की रानी": {
      content: "Welcome to the lesson on झाँसी की रानी! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in झाँसी की रानी?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from झाँसी की रानी?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "जो देखकर भी नहीं देखते": {
      content: "Welcome to the lesson on जो देखकर भी नहीं देखते! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in जो देखकर भी नहीं देखते?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from जो देखकर भी नहीं देखते?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "संसार पुस्तक है": {
      content: "Welcome to the lesson on संसार पुस्तक है! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in संसार पुस्तक है?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from संसार पुस्तक है?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "मैं सबसे छोटी होऊँ": {
      content: "Welcome to the lesson on मैं सबसे छोटी होऊँ! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in मैं सबसे छोटी होऊँ?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from मैं सबसे छोटी होऊँ?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "लोकगीत": {
      content: "Welcome to the lesson on लोकगीत! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in लोकगीत?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from लोकगीत?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "नौकर": {
      content: "Welcome to the lesson on नौकर! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in नौकर?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from नौकर?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "वन के मार्ग में": {
      content: "Welcome to the lesson on वन के मार्ग में! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in वन के मार्ग में?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from वन के मार्ग में?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "साँस-साँस में बाँस": {
      content: "Welcome to the lesson on साँस-साँस में बाँस! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in साँस-साँस में बाँस?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from साँस-साँस में बाँस?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Human Environment Interactions - The Tropical and Subtropical R...": {
      content: "Welcome to the lesson on Human Environment Interactions - The Tropical and Subtropical R...! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Human Environment Interactions - The Tropical and Subtropical R...?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Human Environment Interactions - The Tropical and Subtropical R...?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Three Questions": {
      content: "Welcome to the lesson on Three Questions! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Three Questions?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Three Questions?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "A Gift of Chappals": {
      content: "Welcome to the lesson on A Gift of Chappals! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in A Gift of Chappals?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from A Gift of Chappals?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Gopal and the Hilsa Fish": {
      content: "Welcome to the lesson on Gopal and the Hilsa Fish! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Gopal and the Hilsa Fish?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Gopal and the Hilsa Fish?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "The Ashes That Made Trees Bloom": {
      content: "Welcome to the lesson on The Ashes That Made Trees Bloom! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in The Ashes That Made Trees Bloom?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from The Ashes That Made Trees Bloom?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Quality": {
      content: "Welcome to the lesson on Quality! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Quality?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Quality?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Expert Detectives": {
      content: "Welcome to the lesson on Expert Detectives! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Expert Detectives?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Expert Detectives?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "The Invention of Vita-Wonk": {
      content: "Welcome to the lesson on The Invention of Vita-Wonk! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in The Invention of Vita-Wonk?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from The Invention of Vita-Wonk?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Fire: Friend and Foe": {
      content: "Welcome to the lesson on Fire: Friend and Foe! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Fire: Friend and Foe?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Fire: Friend and Foe?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "A Bicycle in Good Repair": {
      content: "Welcome to the lesson on A Bicycle in Good Repair! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in A Bicycle in Good Repair?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from A Bicycle in Good Repair?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "The Story of Cricket": {
      content: "Welcome to the lesson on The Story of Cricket! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in The Story of Cricket?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from The Story of Cricket?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "The Tiny Teacher": {
      content: "Welcome to the lesson on The Tiny Teacher! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in The Tiny Teacher?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from The Tiny Teacher?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Bringing up Kari": {
      content: "Welcome to the lesson on Bringing up Kari! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Bringing up Kari?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Bringing up Kari?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "The Desert": {
      content: "Welcome to the lesson on The Desert! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in The Desert?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from The Desert?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "The Cop and the Anthem": {
      content: "Welcome to the lesson on The Cop and the Anthem! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in The Cop and the Anthem?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from The Cop and the Anthem?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Golu Grows a Nose": {
      content: "Welcome to the lesson on Golu Grows a Nose! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Golu Grows a Nose?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Golu Grows a Nose?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "I Want Something in a Cage": {
      content: "Welcome to the lesson on I Want Something in a Cage! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in I Want Something in a Cage?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from I Want Something in a Cage?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Chandni": {
      content: "Welcome to the lesson on Chandni! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Chandni?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Chandni?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "The Bear Story": {
      content: "Welcome to the lesson on The Bear Story! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in The Bear Story?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from The Bear Story?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "A Tiger in the House": {
      content: "Welcome to the lesson on A Tiger in the House! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in A Tiger in the House?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from A Tiger in the House?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "An Alien Hand": {
      content: "Welcome to the lesson on An Alien Hand! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in An Alien Hand?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from An Alien Hand?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "हम पंछी उन्मुक्त गगन के": {
      content: "Welcome to the lesson on हम पंछी उन्मुक्त गगन के! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in हम पंछी उन्मुक्त गगन के?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from हम पंछी उन्मुक्त गगन के?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "दादी माँ": {
      content: "Welcome to the lesson on दादी माँ! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in दादी माँ?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from दादी माँ?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "हिमालय की बेटियां": {
      content: "Welcome to the lesson on हिमालय की बेटियां! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in हिमालय की बेटियां?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from हिमालय की बेटियां?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "कठपुतली": {
      content: "Welcome to the lesson on कठपुतली! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in कठपुतली?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from कठपुतली?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "मिठाईवाला": {
      content: "Welcome to the lesson on मिठाईवाला! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in मिठाईवाला?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from मिठाईवाला?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "रक्त और हमारा शरीर": {
      content: "Welcome to the lesson on रक्त और हमारा शरीर! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in रक्त और हमारा शरीर?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from रक्त और हमारा शरीर?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "पापा खो गए": {
      content: "Welcome to the lesson on पापा खो गए! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in पापा खो गए?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from पापा खो गए?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "शाम-एक किसान": {
      content: "Welcome to the lesson on शाम-एक किसान! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in शाम-एक किसान?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from शाम-एक किसान?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "चिड़िया की बच्ची": {
      content: "Welcome to the lesson on चिड़िया की बच्ची! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in चिड़िया की बच्ची?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from चिड़िया की बच्ची?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "अपूर्व अनुभव": {
      content: "Welcome to the lesson on अपूर्व अनुभव! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in अपूर्व अनुभव?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from अपूर्व अनुभव?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "रहीम की दोहे": {
      content: "Welcome to the lesson on रहीम की दोहे! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in रहीम की दोहे?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from रहीम की दोहे?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "कंचा": {
      content: "Welcome to the lesson on कंचा! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in कंचा?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from कंचा?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "एक तिनका": {
      content: "Welcome to the lesson on एक तिनका! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in एक तिनका?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from एक तिनका?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "खानपान की बदलती तस्वीर": {
      content: "Welcome to the lesson on खानपान की बदलती तस्वीर! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in खानपान की बदलती तस्वीर?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from खानपान की बदलती तस्वीर?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "नीलकंठ": {
      content: "Welcome to the lesson on नीलकंठ! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in नीलकंठ?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from नीलकंठ?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "भोर और बरखा": {
      content: "Welcome to the lesson on भोर और बरखा! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in भोर और बरखा?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from भोर और बरखा?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "वीर कुंवर सिंह": {
      content: "Welcome to the lesson on वीर कुंवर सिंह! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in वीर कुंवर सिंह?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from वीर कुंवर सिंह?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "संघर्ष के कारण मैं तुनुकमिज़ाज हो गया: धनराज": {
      content: "Welcome to the lesson on संघर्ष के कारण मैं तुनुकमिज़ाज हो गया: धनराज! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in संघर्ष के कारण मैं तुनुकमिज़ाज हो गया: धनराज?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from संघर्ष के कारण मैं तुनुकमिज़ाज हो गया: धनराज?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "आश्रम का अनुमानित व्यय": {
      content: "Welcome to the lesson on आश्रम का अनुमानित व्यय! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in आश्रम का अनुमानित व्यय?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from आश्रम का अनुमानित व्यय?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "विप्लव गायन": {
      content: "Welcome to the lesson on विप्लव गायन! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in विप्लव गायन?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from विप्लव गायन?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "The Best Christmas Present in the World": {
      content: "Welcome to the lesson on The Best Christmas Present in the World! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in The Best Christmas Present in the World?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from The Best Christmas Present in the World?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "The Tsunami": {
      content: "Welcome to the lesson on The Tsunami! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in The Tsunami?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from The Tsunami?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Glimpses of the Past": {
      content: "Welcome to the lesson on Glimpses of the Past! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Glimpses of the Past?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Glimpses of the Past?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Bepin Choudhury's Lapse of Memory": {
      content: "Welcome to the lesson on Bepin Choudhury's Lapse of Memory! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Bepin Choudhury's Lapse of Memory?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Bepin Choudhury's Lapse of Memory?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "The Summit Within": {
      content: "Welcome to the lesson on The Summit Within! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in The Summit Within?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from The Summit Within?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "This is Jody's Fawn": {
      content: "Welcome to the lesson on This is Jody's Fawn! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in This is Jody's Fawn?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from This is Jody's Fawn?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "A Visit to Cambridge": {
      content: "Welcome to the lesson on A Visit to Cambridge! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in A Visit to Cambridge?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from A Visit to Cambridge?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "A Short Monsoon Diary": {
      content: "Welcome to the lesson on A Short Monsoon Diary! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in A Short Monsoon Diary?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from A Short Monsoon Diary?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "The Great Stone Face - I": {
      content: "Welcome to the lesson on The Great Stone Face - I! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in The Great Stone Face - I?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from The Great Stone Face - I?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "The Great Stone Face - II": {
      content: "Welcome to the lesson on The Great Stone Face - II! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in The Great Stone Face - II?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from The Great Stone Face - II?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "How the Camel got his hump": {
      content: "Welcome to the lesson on How the Camel got his hump! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in How the Camel got his hump?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from How the Camel got his hump?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Children at work": {
      content: "Welcome to the lesson on Children at work! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Children at work?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Children at work?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "The Selfish Giant": {
      content: "Welcome to the lesson on The Selfish Giant! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in The Selfish Giant?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from The Selfish Giant?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "The treasure within": {
      content: "Welcome to the lesson on The treasure within! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in The treasure within?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from The treasure within?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Princess September": {
      content: "Welcome to the lesson on Princess September! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Princess September?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Princess September?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "The fight": {
      content: "Welcome to the lesson on The fight! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in The fight?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from The fight?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "The open window": {
      content: "Welcome to the lesson on The open window! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in The open window?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from The open window?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Jalebis": {
      content: "Welcome to the lesson on Jalebis! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Jalebis?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Jalebis?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "The comet - I": {
      content: "Welcome to the lesson on The comet - I! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in The comet - I?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from The comet - I?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "The comet - II": {
      content: "Welcome to the lesson on The comet - II! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in The comet - II?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from The comet - II?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "ध्वनि": {
      content: "Welcome to the lesson on ध्वनि! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in ध्वनि?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from ध्वनि?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "लाख की चूड़ियाँ": {
      content: "Welcome to the lesson on लाख की चूड़ियाँ! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in लाख की चूड़ियाँ?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from लाख की चूड़ियाँ?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "बस की यात्रा": {
      content: "Welcome to the lesson on बस की यात्रा! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in बस की यात्रा?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from बस की यात्रा?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "दीवानों की हस्ती": {
      content: "Welcome to the lesson on दीवानों की हस्ती! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in दीवानों की हस्ती?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from दीवानों की हस्ती?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "चिट्ठियों की अनूठी दुनिया": {
      content: "Welcome to the lesson on चिट्ठियों की अनूठी दुनिया! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in चिट्ठियों की अनूठी दुनिया?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from चिट्ठियों की अनूठी दुनिया?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "भगवान के डाकिए": {
      content: "Welcome to the lesson on भगवान के डाकिए! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in भगवान के डाकिए?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from भगवान के डाकिए?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "क्या निराश हुआ जाए": {
      content: "Welcome to the lesson on क्या निराश हुआ जाए! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in क्या निराश हुआ जाए?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from क्या निराश हुआ जाए?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "यह सबसे कठिन समय नहीं": {
      content: "Welcome to the lesson on यह सबसे कठिन समय नहीं! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in यह सबसे कठिन समय नहीं?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from यह सबसे कठिन समय नहीं?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "कबीर की साखियाँ": {
      content: "Welcome to the lesson on कबीर की साखियाँ! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in कबीर की साखियाँ?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from कबीर की साखियाँ?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "कामचोर": {
      content: "Welcome to the lesson on कामचोर! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in कामचोर?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from कामचोर?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "जब सिनेमा ने बोलना सीखा": {
      content: "Welcome to the lesson on जब सिनेमा ने बोलना सीखा! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in जब सिनेमा ने बोलना सीखा?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from जब सिनेमा ने बोलना सीखा?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "सुदामा चरित": {
      content: "Welcome to the lesson on सुदामा चरित! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in सुदामा चरित?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from सुदामा चरित?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "जहाँ पहिया है": {
      content: "Welcome to the lesson on जहाँ पहिया है! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in जहाँ पहिया है?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from जहाँ पहिया है?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "अकबरी लोटा": {
      content: "Welcome to the lesson on अकबरी लोटा! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in अकबरी लोटा?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from अकबरी लोटा?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "सूर के पद": {
      content: "Welcome to the lesson on सूर के पद! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in सूर के पद?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from सूर के पद?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "पानी की कहानी": {
      content: "Welcome to the lesson on पानी की कहानी! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in पानी की कहानी?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from पानी की कहानी?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "बाज और साँप": {
      content: "Welcome to the lesson on बाज और साँप! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in बाज और साँप?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from बाज और साँप?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "टोपी": {
      content: "Welcome to the lesson on टोपी! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in टोपी?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from टोपी?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "The Fun They Had": {
      content: "Welcome to the lesson on The Fun They Had! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in The Fun They Had?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from The Fun They Had?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "The Sound of Music": {
      content: "Welcome to the lesson on The Sound of Music! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in The Sound of Music?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from The Sound of Music?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "The Little Girl": {
      content: "Welcome to the lesson on The Little Girl! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in The Little Girl?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from The Little Girl?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "A Truly Beautiful Mind": {
      content: "Welcome to the lesson on A Truly Beautiful Mind! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in A Truly Beautiful Mind?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from A Truly Beautiful Mind?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "The Snake and the Mirror": {
      content: "Welcome to the lesson on The Snake and the Mirror! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in The Snake and the Mirror?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from The Snake and the Mirror?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "My Childhood": {
      content: "Welcome to the lesson on My Childhood! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in My Childhood?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from My Childhood?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Packing": {
      content: "Welcome to the lesson on Packing! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Packing?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Packing?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Reach for the Top": {
      content: "Welcome to the lesson on Reach for the Top! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Reach for the Top?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Reach for the Top?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "The Bond of Love": {
      content: "Welcome to the lesson on The Bond of Love! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in The Bond of Love?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from The Bond of Love?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Kathmandu": {
      content: "Welcome to the lesson on Kathmandu! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Kathmandu?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Kathmandu?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "If I Were You": {
      content: "Welcome to the lesson on If I Were You! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in If I Were You?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from If I Were You?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "The Lost Child": {
      content: "Welcome to the lesson on The Lost Child! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in The Lost Child?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from The Lost Child?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "The Adventures of Toto": {
      content: "Welcome to the lesson on The Adventures of Toto! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in The Adventures of Toto?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from The Adventures of Toto?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Iswaran the Storyteller": {
      content: "Welcome to the lesson on Iswaran the Storyteller! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Iswaran the Storyteller?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Iswaran the Storyteller?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "In the Kingdom of Fools": {
      content: "Welcome to the lesson on In the Kingdom of Fools! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in In the Kingdom of Fools?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from In the Kingdom of Fools?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "The Happy Prince": {
      content: "Welcome to the lesson on The Happy Prince! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in The Happy Prince?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from The Happy Prince?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Weathering the Storm in Ersama": {
      content: "Welcome to the lesson on Weathering the Storm in Ersama! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Weathering the Storm in Ersama?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Weathering the Storm in Ersama?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "The Last Leaf": {
      content: "Welcome to the lesson on The Last Leaf! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in The Last Leaf?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from The Last Leaf?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "A House Is Not a Home": {
      content: "Welcome to the lesson on A House Is Not a Home! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in A House Is Not a Home?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from A House Is Not a Home?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "The Accidental Tourist": {
      content: "Welcome to the lesson on The Accidental Tourist! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in The Accidental Tourist?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from The Accidental Tourist?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "The Beggar": {
      content: "Welcome to the lesson on The Beggar! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in The Beggar?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from The Beggar?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "दो बैलों की कथा": {
      content: "Welcome to the lesson on दो बैलों की कथा! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in दो बैलों की कथा?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from दो बैलों की कथा?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "ल्हासा की ओर": {
      content: "Welcome to the lesson on ल्हासा की ओर! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in ल्हासा की ओर?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from ल्हासा की ओर?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "उपभोक्तावाद की संस्कृति": {
      content: "Welcome to the lesson on उपभोक्तावाद की संस्कृति! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in उपभोक्तावाद की संस्कृति?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from उपभोक्तावाद की संस्कृति?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "साँवले सपनों की याद": {
      content: "Welcome to the lesson on साँवले सपनों की याद! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in साँवले सपनों की याद?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from साँवले सपनों की याद?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "नाना साहब की पुत्री देवी मैना को भस्म कर दिया गया": {
      content: "Welcome to the lesson on नाना साहब की पुत्री देवी मैना को भस्म कर दिया गया! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in नाना साहब की पुत्री देवी मैना को भस्म कर दिया गया?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from नाना साहब की पुत्री देवी मैना को भस्म कर दिया गया?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "प्रेमचंद के फटे जूते": {
      content: "Welcome to the lesson on प्रेमचंद के फटे जूते! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in प्रेमचंद के फटे जूते?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from प्रेमचंद के फटे जूते?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "मेरे बचपन के दिन": {
      content: "Welcome to the lesson on मेरे बचपन के दिन! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in मेरे बचपन के दिन?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from मेरे बचपन के दिन?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "एक कुत्ता और एक मैना": {
      content: "Welcome to the lesson on एक कुत्ता और एक मैना! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in एक कुत्ता और एक मैना?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from एक कुत्ता और एक मैना?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "साखियाँ एवं सबद": {
      content: "Welcome to the lesson on साखियाँ एवं सबद! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in साखियाँ एवं सबद?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from साखियाँ एवं सबद?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "वाख": {
      content: "Welcome to the lesson on वाख! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in वाख?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from वाख?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "सवैया": {
      content: "Welcome to the lesson on सवैया! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in सवैया?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from सवैया?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "कैदी और कोकिला": {
      content: "Welcome to the lesson on कैदी और कोकिला! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in कैदी और कोकिला?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from कैदी और कोकिला?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "ग्राम श्री": {
      content: "Welcome to the lesson on ग्राम श्री! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in ग्राम श्री?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from ग्राम श्री?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "चंद्र गहना से लौटती बेर": {
      content: "Welcome to the lesson on चंद्र गहना से लौटती बेर! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in चंद्र गहना से लौटती बेर?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from चंद्र गहना से लौटती बेर?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "मेघ आए": {
      content: "Welcome to the lesson on मेघ आए! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in मेघ आए?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from मेघ आए?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "यमराज की दिशा": {
      content: "Welcome to the lesson on यमराज की दिशा! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in यमराज की दिशा?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from यमराज की दिशा?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "बच्चे काम पर जा रहे हैं": {
      content: "Welcome to the lesson on बच्चे काम पर जा रहे हैं! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in बच्चे काम पर जा रहे हैं?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from बच्चे काम पर जा रहे हैं?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "A Letter to God": {
      content: "Welcome to the lesson on A Letter to God! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in A Letter to God?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from A Letter to God?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Nelson Mandela: Long Walk to Freedom": {
      content: "Welcome to the lesson on Nelson Mandela: Long Walk to Freedom! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Nelson Mandela: Long Walk to Freedom?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Nelson Mandela: Long Walk to Freedom?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Two Stories about Flying": {
      content: "Welcome to the lesson on Two Stories about Flying! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Two Stories about Flying?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Two Stories about Flying?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "From the Diary of Anne Frank": {
      content: "Welcome to the lesson on From the Diary of Anne Frank! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in From the Diary of Anne Frank?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from From the Diary of Anne Frank?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "The Hundred Dresses - I": {
      content: "Welcome to the lesson on The Hundred Dresses - I! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in The Hundred Dresses - I?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from The Hundred Dresses - I?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "The Hundred Dresses - II": {
      content: "Welcome to the lesson on The Hundred Dresses - II! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in The Hundred Dresses - II?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from The Hundred Dresses - II?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Glimpses of India": {
      content: "Welcome to the lesson on Glimpses of India! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Glimpses of India?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Glimpses of India?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Mijbil the Otter": {
      content: "Welcome to the lesson on Mijbil the Otter! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Mijbil the Otter?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Mijbil the Otter?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Madam Rides the Bus": {
      content: "Welcome to the lesson on Madam Rides the Bus! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Madam Rides the Bus?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Madam Rides the Bus?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "The Sermon at Benares": {
      content: "Welcome to the lesson on The Sermon at Benares! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in The Sermon at Benares?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from The Sermon at Benares?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "The Proposal": {
      content: "Welcome to the lesson on The Proposal! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in The Proposal?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from The Proposal?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "A Triumph of Surgery": {
      content: "Welcome to the lesson on A Triumph of Surgery! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in A Triumph of Surgery?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from A Triumph of Surgery?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "The Thief's Story": {
      content: "Welcome to the lesson on The Thief's Story! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in The Thief's Story?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from The Thief's Story?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "The Midnight Visitor": {
      content: "Welcome to the lesson on The Midnight Visitor! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in The Midnight Visitor?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from The Midnight Visitor?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "A Question of Trust": {
      content: "Welcome to the lesson on A Question of Trust! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in A Question of Trust?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from A Question of Trust?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Footprints without Feet": {
      content: "Welcome to the lesson on Footprints without Feet! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Footprints without Feet?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Footprints without Feet?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "The Making of a Scientist": {
      content: "Welcome to the lesson on The Making of a Scientist! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in The Making of a Scientist?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from The Making of a Scientist?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "The Necklace": {
      content: "Welcome to the lesson on The Necklace! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in The Necklace?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from The Necklace?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "The Hack Driver": {
      content: "Welcome to the lesson on The Hack Driver! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in The Hack Driver?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from The Hack Driver?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Bholi": {
      content: "Welcome to the lesson on Bholi! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Bholi?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Bholi?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "The Book That Saved the Earth": {
      content: "Welcome to the lesson on The Book That Saved the Earth! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in The Book That Saved the Earth?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from The Book That Saved the Earth?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "पद (सूरदास)": {
      content: "Welcome to the lesson on पद (सूरदास)! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in पद (सूरदास)?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from पद (सूरदास)?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "राम-लक्ष्मण-परशुराम संवाद": {
      content: "Welcome to the lesson on राम-लक्ष्मण-परशुराम संवाद! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in राम-लक्ष्मण-परशुराम संवाद?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from राम-लक्ष्मण-परशुराम संवाद?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "सवैया और कवित्त": {
      content: "Welcome to the lesson on सवैया और कवित्त! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in सवैया और कवित्त?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from सवैया और कवित्त?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "आत्मकथ्य": {
      content: "Welcome to the lesson on आत्मकथ्य! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in आत्मकथ्य?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from आत्मकथ्य?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "उत्साह और अट नहीं रही है": {
      content: "Welcome to the lesson on उत्साह और अट नहीं रही है! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in उत्साह और अट नहीं रही है?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from उत्साह और अट नहीं रही है?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "यह दंतुरित मुसकान और फसल": {
      content: "Welcome to the lesson on यह दंतुरित मुसकान और फसल! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in यह दंतुरित मुसकान और फसल?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from यह दंतुरित मुसकान और फसल?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "छाया मत छूना": {
      content: "Welcome to the lesson on छाया मत छूना! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in छाया मत छूना?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from छाया मत छूना?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "कन्यादान": {
      content: "Welcome to the lesson on कन्यादान! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in कन्यादान?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from कन्यादान?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "संगतकार": {
      content: "Welcome to the lesson on संगतकार! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in संगतकार?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from संगतकार?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "नेताजी का चश्मा": {
      content: "Welcome to the lesson on नेताजी का चश्मा! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in नेताजी का चश्मा?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from नेताजी का चश्मा?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "बालगोबिन भगत": {
      content: "Welcome to the lesson on बालगोबिन भगत! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in बालगोबिन भगत?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from बालगोबिन भगत?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "लखनवी अंदाज़": {
      content: "Welcome to the lesson on लखनवी अंदाज़! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in लखनवी अंदाज़?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from लखनवी अंदाज़?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "मानवीय करुणा की दिव्या चमक": {
      content: "Welcome to the lesson on मानवीय करुणा की दिव्या चमक! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in मानवीय करुणा की दिव्या चमक?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from मानवीय करुणा की दिव्या चमक?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "एक कहानी यह भी": {
      content: "Welcome to the lesson on एक कहानी यह भी! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in एक कहानी यह भी?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from एक कहानी यह भी?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "स्त्री शिक्षा के विरोधी कुतर्कों का खंडन": {
      content: "Welcome to the lesson on स्त्री शिक्षा के विरोधी कुतर्कों का खंडन! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in स्त्री शिक्षा के विरोधी कुतर्कों का खंडन?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from स्त्री शिक्षा के विरोधी कुतर्कों का खंडन?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "नौबतखाने में इबादत": {
      content: "Welcome to the lesson on नौबतखाने में इबादत! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in नौबतखाने में इबादत?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from नौबतखाने में इबादत?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "संस्कृति": {
      content: "Welcome to the lesson on संस्कृति! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in संस्कृति?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from संस्कृति?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },

    "Knowing Our Numbers": {
      content: "<p>Welcome to the exciting world of numbers! In this chapter, 'Knowing Our Numbers', we will dive deep into understanding how large numbers work and why they are so important in our everyday lives. You have already learned about basic counting and simple arithmetic, but now it's time to take a step further. We will explore how to compare really big numbers, discover the significance of place value, and learn about the differences between the Indian and International systems of numeration. By mastering these concepts, you will be able to easily read, write, and understand numbers in the millions and billions. We'll also look at how to estimate or round off numbers to make quick calculations, and even take a fun trip back in time to learn about Roman numerals. This knowledge is the foundation for all the advanced mathematics you will learn in the future, so get ready to become a true number expert!</p>",
      quiz: [{"question":"What is the smallest 2-digit number?","options":["A. 9","B. 10","C. 11","D. 100"],"answer":"B"},{"question":"Which number is greater: 543 or 534?","options":["A. 543","B. 534","C. Both are equal","D. Cannot compare"],"answer":"A"},{"question":"What is the place value of the digit '7' in the number 273?","options":["A. 7","B. 70","C. 700","D. Ones"],"answer":"B"},{"question":"Arrange the numbers 25, 12, 48 in ascending order.","options":["A. 12, 25, 48","B. 48, 25, 12","C. 25, 12, 48","D. 12, 48, 25"],"answer":"A"},{"question":"What is the largest 3-digit number you can make using digits 1, 2, 3 (without repeating)?","options":["A. 123","B. 231","C. 321","D. 312"],"answer":"C"}],
      lessons: [{"title":"Comparing Large Numbers","explanation":"In this lesson, you will learn the essential skill of comparing very large numbers to determine which one is greater or smaller. We will practice identifying the largest and smallest numbers in a group by carefully analyzing their place values, starting from the leftmost digits. Knowing how to quickly tell which number is bigger is an incredibly useful mathematical trick!"}]
    },
    "Whole Numbers": {
      content: "Welcome to the lesson on Whole Numbers! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Whole Numbers?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Whole Numbers?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Playing With Numbers": {
      content: "Welcome to the lesson on Playing With Numbers! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Playing With Numbers?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Playing With Numbers?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Basic Geometrical Ideas": {
      content: "<h3><strong>Main focus: This chapter helps us understand the basic shapes, lines, and points that make up everything we see around us, from our toys to our homes!</strong></h3><p>Hello little explorers! Have you ever noticed how many different shapes are hiding in your everyday life? Your biscuit might be a circle, your book is a rectangle, and even the roof of a house looks like a triangle! Geometry is like a fun detective game where we learn about these shapes, lines, and tiny dots that create the world around us. Let's find out more about them and become shape superstars!</p><h3><strong>Key Concepts:</strong></h3><ul><li>Point, Line Segment, Ray, and Line</li><li>Open and Closed Figures</li><li>Basic 2D Shapes (Square, Rectangle, Triangle, Circle)</li><li>Sides and Vertices (Corners)</li></ul>",
      quiz: [{"question":"Which of these shapes has exactly three sides?","options":["A) Square","B) Circle","C) Triangle","D) Rectangle"],"answer":"C"},{"question":"What do we call a path that goes on and on forever in only one direction from a starting point?","options":["A) Line","B) Line Segment","C) Ray","D) Point"],"answer":"C"},{"question":"Which of these describes a figure that starts and ends at the same point, forming a complete boundary?","options":["A) Open figure","B) Curved line","C) Closed figure","D) Ray"],"answer":"C"},{"question":"How many corners (vertices) does a standard square shape have?","options":["A) 2","B) 3","C) 4","D) 5"],"answer":"C"},{"question":"What do we call a tiny dot that shows an exact position and has no size?","options":["A) Line segment","B) Point","C) Ray","D) Line"],"answer":"B"}],
      lessons: [{"title":"Meet Our Shape Friends!","explanation":"Let's meet our exciting shape friends like the round Circle, the square with four equal sides, the long Rectangle, and the pointy Triangle!"},{"title":"Dots, Lines, and Beyond!","explanation":"Discover how a tiny dot is a 'point', how a line segment connects two points, how a ray goes on forever in one direction, and how a line goes on forever in both directions."},{"title":"Straight or Curvy?","explanation":"Learn to tell the difference between lines that are straight, like a ruler's edge, and lines that are curved, like a rainbow or a smile!"},{"title":"Open or Closed?","explanation":"Find out about figures that are 'open' like a gate, and 'closed' figures that are completely sealed, like a fence all around."},{"title":"Sides and Corners!","explanation":"Explore the 'sides' (edges) and 'corners' (vertices) of our shape friends and count how many each shape has!"},{"title":"Shapes Everywhere You Look!","explanation":"Look around your room, playground, or school and point out all the different shapes you can find in everyday objects!"}]
    },
    "Understanding Elementary Shapes": {
      content: "<h3><strong>Main focus: Let's explore the exciting world of shapes, lines, and angles that we see all around us every day!</strong></h3><p>Hello, little mathematicians! Look around you. What do you see? A book? A clock? A ball? Everything you see has a shape! Some are flat like a drawing on paper, and some are solid like a toy block you can hold. In this chapter, we will go on an exciting adventure to discover all these amazing shapes, learn about different types of lines, and even find out about corners, which we call angles! Get ready to become super shape detectives and find mathematics hidden in plain sight!</p><h3><strong>Key Concepts:</strong></h3><ul><li>Identifying 2D (flat) shapes like squares, circles, triangles, and rectangles.</li><li>Understanding 3D (solid) shapes like cubes, spheres, cylinders, and cones.</li><li>Learning about different types of lines: straight, curved, parallel, and perpendicular.</li><li>Discovering what angles are and their different types: right, acute, and obtuse.</li></ul>",
      quiz: [{"question":"Which of these shapes has 3 sides and 3 corners?","options":["A) Circle","B) Square","C) Triangle","D) Rectangle"],"answer":"C"},{"question":"A football looks like which 3D shape?","options":["A) Cube","B) Sphere","C) Cylinder","D) Cone"],"answer":"B"},{"question":"The opposite edges of a ruler (when viewed lengthwise) are an example of which type of lines?","options":["A) Curved lines","B) Intersecting lines","C) Parallel lines","D) Perpendicular lines"],"answer":"C"},{"question":"Which of these objects has a right angle (a perfect L-shape corner)?","options":["A) A pointed party hat","B) An open pair of scissors","C) The corner of a closed book","D) The tip of a needle"],"answer":"C"},{"question":"How many corners (vertices) does a rectangle have?","options":["A) 2","B) 3","C) 4","D) 5"],"answer":"C"}],
      lessons: [{"title":"Meet Our Flat Friends: 2D Shapes","explanation":"Learn about shapes you can draw on paper, like the square, circle, triangle, and rectangle, and count their sides and corners."},{"title":"Exploring Bumpy Buddies: 3D Shapes","explanation":"Discover solid shapes that you can hold, like a cube, sphere, cylinder, and cone, and see them in everyday objects."},{"title":"Drawing Lines Everywhere!","explanation":"Understand the difference between straight and curved lines, and learn about lines that go up-down (vertical), sideways (horizontal), or slant."},{"title":"Special Lines: Parallel and Perpendicular","explanation":"Find out about parallel lines that never meet, like railway tracks, and perpendicular lines that meet to form a perfect 'L' corner."},{"title":"What are Angles?","explanation":"Learn that an angle is formed when two lines meet at a point, like the corners of a room or the hands of a clock pointing to 3 o'clock."},{"title":"Types of Angles: Right, Acute, Obtuse","explanation":"Explore different kinds of angles: a 'right angle' like an 'L' shape, an 'acute angle' which is smaller, and an 'obtuse angle' which is bigger than a right angle."}]
    },
    "Integers": {
      content: "Welcome to the lesson on Integers! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Integers?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Integers?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Fractions": {
      content: "<h3><strong>Main focus: Fractions help us understand and represent parts of a whole object or group when it's divided into equal pieces.</strong></h3><p>Hey little mathematicians! Imagine you have a yummy pizza, and you want to share it fairly with your friend. What do you do? You cut it into equal pieces! Each piece is a 'part' of the whole pizza. Fractions are special numbers that tell us about these parts. They help us show how much of the pizza each person gets, or how much of a chocolate bar is left. It's all about dividing things equally and naming those parts!</p><h3><strong>Key Concepts:</strong></h3><ul><li>Understanding a 'whole' and its 'parts'.</li><li>Dividing a whole into equal parts.</li><li>Numerator (the number of parts we have) and Denominator (the total number of equal parts).</li><li>Common fractions like half (1/2), quarter (1/4), and third (1/3).</li><li>Representing fractions using pictures and numbers.</li><li>Comparing simple fractions like 1/2 and 1/4.</li></ul>",
      quiz: [{"question":"If you cut a cake into 4 equal pieces, and you eat 1 piece, what fraction of the cake did you eat?","options":["A. 1/2","B. 1/3","C. 1/4","D. 4/1"],"answer":"C. 1/4"},{"question":"In the fraction 3/5, what does the number '5' represent?","options":["A. The parts we have","B. The total number of equal parts","C. The whole number","D. Nothing"],"answer":"B. The total number of equal parts"},{"question":"How many 'half' pieces can you get from one whole apple?","options":["A. One","B. Two","C. Three","D. Four"],"answer":"B. Two"},{"question":"Which of these pictures shows 1/4 of a shape shaded?","options":["A. A circle with half shaded","B. A square with all parts shaded","C. A rectangle divided into 4 equal parts with 1 part shaded","D. A triangle divided into 3 equal parts with 1 part shaded"],"answer":"C. A rectangle divided into 4 equal parts with 1 part shaded"},{"question":"Which fraction represents 'one-third'?","options":["A. 1/3","B. 2/3","C. 3/1","D. 1/2"],"answer":"A. 1/3"}],
      lessons: [{"title":"What are Fractions? Sharing Equally!","explanation":"Learn that fractions are a way to represent parts of a whole when something is divided into equal pieces, like sharing a pizza or chocolate bar fairly."},{"title":"Numerator and Denominator: The Top and Bottom Numbers","explanation":"Discover what the top number (numerator) tells us (how many parts we have) and what the bottom number (denominator) tells us (the total number of equal parts)."},{"title":"Understanding Half (1/2)","explanation":"Explore how 'half' means dividing something into two perfectly equal parts, and how we write it as 1/2."},{"title":"Understanding Quarter (1/4)","explanation":"Learn about 'quarter', which means dividing a whole into four equal parts, and how it is written as 1/4."},{"title":"Understanding Third (1/3) and Other Unit Fractions","explanation":"Understand 'one-third' as one out of three equal parts (1/3), and get introduced to other simple unit fractions like 1/5."},{"title":"Comparing Simple Fractions: Which Part is Bigger?","explanation":"Learn to compare basic fractions, like deciding if 1/2 of a cake is more than 1/4 of the same cake, often using visual aids."}]
    },
    "Decimals": {
      content: "Welcome to the lesson on Decimals! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Decimals?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Decimals?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Mensuration": {
      content: "<h3><strong>Main focus: We will learn to measure the boundary and the space inside different shapes.</strong></h3><p>Hey, little explorers! Have you ever wondered how much ribbon you need to go around a gift box, or how much paint you need to cover a wall? That's what Mensuration helps us with! It's like being a super detective who measures everything – how long, how wide, and how much space things take up. We learn to measure the 'outside' of a shape, like walking around a park, and the 'inside' of a shape, like covering a table with a cloth. It's super fun and helps us understand the world around us better!</p><h3><strong>Key Concepts:</strong></h3><ul><li>Perimeter: The total length of the boundary of a shape.</li><li>Area: The amount of surface or space a flat shape covers.</li></ul>",
      quiz: [{"question":"What do we measure when we find the length around a photo frame?","options":["A) Area","B) Volume","C) Perimeter","D) Weight"],"answer":"C"},{"question":"If you want to put a carpet in your room, what part of the room do you need to measure?","options":["A) Perimeter","B) Area","C) Height","D) Depth"],"answer":"B"},{"question":"Which unit would you use to measure the length of your pencil?","options":["A) Kilogram","B) Litre","C) Centimeter","D) Hour"],"answer":"C"},{"question":"A square garden has each side 5 meters long. What is the total length of its boundary (perimeter)?","options":["A) 5 meters","B) 10 meters","C) 15 meters","D) 20 meters"],"answer":"D"},{"question":"Imagine a rectangle made of 6 small squares. What does the number 6 tell us about the rectangle?","options":["A) Its perimeter","B) Its area","C) Its height","D) Its width"],"answer":"B"}],
      lessons: [{"title":"What is Mensuration?","explanation":"This lesson introduces the exciting world of measuring things all around us."},{"title":"Measuring Length","explanation":"Learn how to measure how long things are using simple tools like a ruler and units like centimeters and meters."},{"title":"Shapes All Around Us","explanation":"Discover different 2D shapes like squares, rectangles, and triangles, and where we see them every day."},{"title":"Understanding Perimeter","explanation":"Explore the concept of 'boundary' by measuring the total length around the edges of different shapes."},{"title":"Understanding Area","explanation":"Learn about the 'space inside' a shape by counting squares or imagining how much surface it covers."},{"title":"Real-Life Measuring Fun","explanation":"See how measuring perimeter and area helps us in daily life, from making a garden to tiling a floor."}]
    },
    "Algebra": {
      content: "<h3><strong>Main focus: Algebra helps us discover secret numbers hidden in math puzzles!</strong></h3><p>Have you ever played a game where you have to find the missing piece? Algebra is just like that, but with numbers! Sometimes, in math problems, a number is hiding. We use special shapes like a square or a star, or even letters like 'x' or 'y', to stand for that secret number. Our job is to be number detectives and figure out what number is hiding! It's a fun way to solve puzzles and understand how numbers work together.</p><h3><strong>Key Concepts:</strong></h3><ul><li>Finding missing numbers in equations.</li><li>Using symbols (like shapes or letters) to represent unknown numbers.</li><li>Understanding simple patterns and relationships between numbers.</li></ul>",
      quiz: [{"question":"What number goes in the box to make the statement true? 5 + [ ] = 9","options":["3","4","5","14"],"answer":"B"},{"question":"If a star (⭐) stands for 6, what is ⭐ - 2?","options":["8","4","3","6"],"answer":"B"},{"question":"If 'x' is a missing number and x + 3 = 10, what is 'x'?","options":["7","13","3","10"],"answer":"A"},{"question":"Look at the pattern: 3, 6, 9, [ ], 15. What is the missing number?","options":["10","11","12","13"],"answer":"C"},{"question":"You have 'y' balloons. Your friend gives you 2 more. You now have y + 2 balloons. If y = 7, how many balloons do you have in total?","options":["9","7","2","14"],"answer":"A"}],
      lessons: [{"title":"What's the Missing Number?","explanation":"We'll start by finding the number that completes simple addition or subtraction sentences."},{"title":"Shapes as Placeholders","explanation":"Learn to use simple shapes like a square or a triangle to stand for a number we don't know yet."},{"title":"Meet the Number Letters (Variables)","explanation":"Discover how letters like 'x', 'y', or 'a' can also be used to represent a hidden number."},{"title":"Patterns, Patterns Everywhere!","explanation":"Explore how algebra helps us find the rule that creates a number pattern, like 2, 4, 6..."},{"title":"Balancing Act: What is Equal?","explanation":"Understand that an equation means both sides of the '=' sign must have the same value, just like a balanced scale."},{"title":"Algebra in Everyday Puzzles","explanation":"Solve simple real-life problems by finding missing numbers using our new algebra skills."}]
    },
    "Ratio and Proportion": {
      content: "Welcome to the lesson on Ratio and Proportion! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Ratio and Proportion?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Ratio and Proportion?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Components of Food": {
      content: "Welcome to the lesson on Components of Food! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Components of Food?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Components of Food?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Sorting Materials into Groups": {
      content: "<h3><strong>Main focus: We learn to group different things together based on their properties like how they look, feel, and what they are used for.</strong></h3><p>Have you ever helped your parents sort laundry, or put your toys back in their right boxes? That's exactly what 'sorting materials into groups' means! We look at different things around us, like a soft teddy bear, a hard stone, or a shiny spoon. We can put things that are similar together. This helps us to find things easily, keep our surroundings tidy, and understand the world better. It's like putting all your pencils in one box and all your crayons in another!</p><h3><strong>Key Concepts:</strong></h3><ul><li>Grouping objects based on their properties (e.g., shape, colour, texture, use).</li><li>Understanding that materials have different characteristics like hard/soft, rough/smooth, shiny/dull.</li></ul>",
      quiz: [{"question":"Which of these objects is made of a 'soft' material?","options":["Cotton ball","Stone","Wooden table","Iron rod"],"answer":"Cotton ball"},{"question":"If you sort things by their 'colour', which group would a red apple and a red car belong to?","options":["Food items","Vehicles","Red coloured items","Round items"],"answer":"Red coloured items"},{"question":"Why do we sort our clothes into different piles (e.g., shirts, pants, socks)?","options":["To make them dirty","To lose them easily","To find them quickly when needed","To make more mess"],"answer":"To find them quickly when needed"},{"question":"Which of these materials is usually 'shiny'?","options":["Wood","Plastic bottle","Metal spoon","Cloth towel"],"answer":"Metal spoon"},{"question":"What is the main reason to group similar things together?","options":["To keep them organized and easy to find","To make them disappear","To make it harder to find them","To mix everything up"],"answer":"To keep them organized and easy to find"}],
      lessons: [{"title":"What is Sorting?","explanation":"Sorting means putting things into groups based on how they are alike or different. It helps us keep things tidy and understand them better."},{"title":"Sorting by How Things Look","explanation":"We can group objects by their colour, shape, or size, like putting all green toys together or all square blocks in one pile."},{"title":"Sorting by How Things Feel","explanation":"We can group things by touch, like separating rough stones from smooth pebbles, or soft cotton from hard wood."},{"title":"Sorting by What They Are Used For","explanation":"Imagine grouping all your eating spoons together, or all your drawing pencils in another group, based on their use."},{"title":"Sorting by Material","explanation":"We can sort objects by what they are made of, such as putting all wooden items together and all plastic items together."},{"title":"Why is Sorting Important?","explanation":"Sorting helps us keep our homes, classrooms, and even shops organized, making it easy to find what we need and learn new things."}]
    },
    "Separation of Substances": {
      content: "<h3><strong>Main focus: Learning how to separate different things from each other in easy and fun ways.</strong></h3><p>Have you ever seen your mother pick out small stones from rice, or sieve flour to make rotis? We often need to separate things that are mixed together. Sometimes we want to remove something bad or unwanted, and sometimes we want to get the useful part out. In this chapter, we will discover different simple methods to separate various substances, making our food cleaner and our lives easier!</p><h3><strong>Key Concepts:</strong></h3><ul><li>Handpicking: Separating by picking with hands.</li><li>Sieving: Separating using a sieve for different sizes.</li><li>Winnowing: Separating lighter particles using wind.</li><li>Filtration: Separating tiny particles from liquids using a filter.</li></ul>",
      quiz: [{"question":"Which method is best for separating small stones from rice?","options":["Handpicking","Sieving","Winnowing","Filtering"],"answer":"Handpicking"},{"question":"What do we use to separate flour from small lumps?","options":["A spoon","A sieve","Our hands","A fan"],"answer":"A sieve"},{"question":"Farmers use 'winnowing' to separate lighter husk from heavier grains. What helps them do this?","options":["Water","Fire","Wind","A magnet"],"answer":"Wind"},{"question":"When you make tea, you use a strainer to separate tea leaves from the tea. What is this method called?","options":["Handpicking","Sieving","Winnowing","Filtration"],"answer":"Filtration"},{"question":"Why do we need to separate substances?","options":["To remove unwanted things","To get useful things","Both A and B","To make a mess"],"answer":"Both A and B"}],
      lessons: [{"title":"Why Do We Separate Things?","explanation":"Learn why it's important to separate things in our daily lives, like cleaning food or getting pure ingredients. (EVS focus: cleanliness, safety)"},{"title":"Handpicking: Separating with Our Hands","explanation":"Discover how we use our hands to separate larger unwanted items, such as stones from pulses or peanuts from mixed snacks. (Logic focus: observation and sorting)"},{"title":"Sieving: Separating by Size","explanation":"Explore how sieving helps us separate things based on their size, like sifting flour or sand. (Mathematics focus: understanding size differences, comparison)"},{"title":"Winnowing: Using Wind to Separate","explanation":"Understand how farmers use the wind to separate lighter husks from heavier grains, a clever traditional method. (EVS focus: farming practices, nature's help)"},{"title":"Filtration and Decantation: Separating Liquids and Solids","explanation":"Learn about using a filter (like a tea strainer) to separate tiny particles from liquids, and how to pour out clear liquid carefully when solids settle. (EVS focus: clean water, preparing drinks)"},{"title":"Separation All Around Us: Everyday Examples","explanation":"Look at many simple examples of separation that we see and do every day at home and school. (EVS focus: practical application, connecting to surroundings)"}]
    },
    "Getting to Know Plants": {
      content: "<h3><strong>Main focus: Learning about the different parts of plants and how each part helps the plant live and grow.</strong></h3><p>Look around you! Do you see green things growing everywhere? Those are plants! Plants are amazing living things, just like us, but they usually stay rooted in one place. They come in many shapes and sizes – some are tiny like grass, and some are huge like big trees. In this chapter, we will learn about their different parts, like roots, stems, leaves, and flowers, and discover what each part does to help the plant stay healthy and happy! Understanding plants helps us appreciate nature even more.</p><h3><strong>Key Concepts:</strong></h3><ul><li>Plants have different parts, such as roots, stem, leaves, and flowers, and each part has a special job.</li><li>Plants are living things that need sunlight, water, and air to make their own food and are essential for life on Earth.</li></ul>",
      quiz: [{"question":"Which part of the plant usually grows under the ground?","options":["Leaves","Flowers","Roots","Stem"],"answer":"C"},{"question":"Which part of the plant helps it stand straight and carries water to all other parts?","options":["Roots","Stem","Leaves","Flowers"],"answer":"B"},{"question":"Which part of the plant is often called the 'food factory' because it makes food for the plant?","options":["Stem","Roots","Leaves","Fruits"],"answer":"C"},{"question":"What beautiful part of a plant often turns into a fruit?","options":["Roots","Stem","Leaves","Flowers"],"answer":"D"},{"question":"Are plants living things or non-living things?","options":["Living things","Non-living things","Sometimes living, sometimes non-living","Cannot say"],"answer":"A"}],
      lessons: [{"title":"What are Plants?","explanation":"Plants are living things that grow all around us, from tiny grass to tall trees. They are an important part of our world."},{"title":"Main Parts of a Plant","explanation":"Plants have several main parts: roots, stem, leaves, flowers, and sometimes fruits. Each part has a unique job to do."},{"title":"Roots: The Hidden Anchor","explanation":"Roots usually grow underground, holding the plant firmly in the soil and soaking up water and nutrients from it."},{"title":"Stem: The Strong Supporter","explanation":"The stem stands tall, supporting the leaves, flowers, and fruits, and acts like a pipeline carrying water and food to all parts."},{"title":"Leaves: The Food Makers","explanation":"Leaves are mostly green and are like tiny kitchens where plants make their own food using sunlight, air, and water."},{"title":"Flowers & Fruits: Seeds for New Life","explanation":"Flowers are often colorful and fragrant, and they develop into fruits, which protect the seeds for new plants."}]
    },
    "Body Movements": {
      content: "<h3><strong>Main focus: Understanding how our body parts move and why it's important for daily activities.</strong></h3><p>Our body is like a super machine! It helps us do so many wonderful things every day, like playing with friends, running in the park, writing in our books, and even eating yummy food. All these actions need our body parts to move. Let's explore together how our bones, muscles, and special bending spots called joints work as a team to help us move and stay active!</p><h3><strong>Key Concepts:</strong></h3><ul><li>Our body has many parts that can move in different ways.</li><li>Bones give our body shape and support, and joints help us bend and rotate.</li><li>Muscles help our bones move.</li><li>Different animals move in different ways to find food and stay safe.</li><li>Regular movement and exercise keep our body strong and healthy.</li></ul>",
      quiz: [{"question":"Which part of your body helps you bend your leg?","options":["Elbow","Knee","Wrist","Neck"],"answer":"Knee"},{"question":"What is the hard, inner framework of our body called?","options":["Muscles","Skin","Bones","Hair"],"answer":"Bones"},{"question":"Which animal uses its wings to fly?","options":["Fish","Snake","Bird","Dog"],"answer":"Bird"},{"question":"What helps our bones move smoothly at bending points?","options":["Muscles","Skin","Blood","Joints"],"answer":"Joints"},{"question":"Why is it important to play games and move our bodies?","options":["To become strong and healthy","To sleep more","To watch more TV","To sit still always"],"answer":"To become strong and healthy"}],
      lessons: [{"title":"Our Amazing Moving Body!","explanation":"Discover how incredible our bodies are and all the different ways we can move our arms, legs, head, and fingers to do everyday things."},{"title":"Meet Your Moving Parts","explanation":"Let's identify the main parts of our body that move, such as your arms, legs, neck, and waist, and understand what each part helps you do."},{"title":"Bones: Our Body's Frame","explanation":"Learn that bones are like the strong pillars inside our body that give us shape and help us stand tall. They are very hard!"},{"title":"Joints: Where We Bend","explanation":"Find out about 'joints' – the special places where two bones meet, allowing us to bend our knees, elbows, and fingers easily."},{"title":"How Animals Move Differently","explanation":"Explore how various animals, like birds, fish, snakes, and monkeys, move in their own unique ways to travel and find food."},{"title":"Keeping Our Body Strong and Active","explanation":"Understand why playing, running, and exercising regularly are important to keep our bones, muscles, and joints healthy and ready for action."}]
    },
    "The Living Organisms and Their Surroundings": {
      content: "Welcome to the lesson on The Living Organisms and Their Surroundings! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in The Living Organisms and Their Surroundings?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from The Living Organisms and Their Surroundings?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Motion and Measurement of Distances": {
      content: "<h3><strong>Main focus: Understanding how things move and learning simple ways to measure how far they travel.</strong></h3><p>Have you ever seen a bird fly or a car drive? Everything around us moves, and when things move, they go from one place to another. This is called motion! And sometimes, we need to know how far something has moved or how long something is. To do this, we measure distances using special tools and words. It's like finding out how many steps it takes to get from your bed to the door!</p><h3><strong>Key Concepts:</strong></h3><ul><li>Motion: When an object changes its position over time.</li><li>Measurement: The process of finding the size or quantity of something, like distance or length.</li></ul>",
      quiz: [{"question":"What is it called when something changes its position?","options":["Motion","Still","Sleep","Eat"],"answer":"A"},{"question":"Which of these is NOT an example of motion?","options":["A car driving","A ball rolling","A tree standing still","A child running"],"answer":"C"},{"question":"What do we use to find out how long a table is?","options":["A spoon","A measuring tape","A book","A crayon"],"answer":"B"},{"question":"What is a standard unit for measuring length or distance?","options":["Cup","Kilogram","Metre","Hour"],"answer":"C"},{"question":"If you walk from your home to the park, what are you doing?","options":["Measuring distance","Playing a game","Sleeping","Sitting"],"answer":"A"}],
      lessons: [{"title":"What is Motion?","explanation":"Learn that motion means changing place, like a bird flying or a ball rolling."},{"title":"Seeing Motion Everywhere","explanation":"Observe different things moving around us, from animals to vehicles and even ourselves."},{"title":"Why Do We Need to Measure?","explanation":"Understand that measurement helps us know how far, how long, or how tall things are for daily activities."},{"title":"How We Measure Short Distances","explanation":"Discover tools like a ruler or measuring tape to measure short lengths like a pencil or a book."},{"title":"Standard Units of Measurement","explanation":"Learn about standard units like centimetre and metre that help everyone understand measurements easily."},{"title":"Measuring Longer Distances","explanation":"Explore how we measure longer distances, like the distance between two cities, using units like kilometres."}]
    },
    "Light Shadows and Reflections": {
      content: "<h3><strong>Main focus: Discovering the magic of light, how shadows are made, and how light bounces back!</strong></h3><p>Hello little explorers! Have you ever wondered how you see the beautiful world around you? It's all because of 'light'! Light is like a superpower that helps our eyes see everything, from your colorful toys to the big blue sky. But light also plays hide-and-seek, making dark shapes called shadows when something blocks its path. And sometimes, light loves to bounce back, just like a ball off a wall, which we call reflection!</p><h3><strong>Key Concepts:</strong></h3><ul><li>Light helps us see everything around us.</li><li>Shadows are dark shapes formed when an object blocks light.</li><li>Objects can be transparent (light passes through), translucent (some light passes), or opaque (no light passes).</li><li>Reflection is when light bounces off a shiny surface, like a mirror.</li></ul>",
      quiz: [{"question":"What helps us see colors and objects in the daytime?","options":["Light","Sound","Wind","Smell"],"answer":"A"},{"question":"What do you call the dark shape formed when an object blocks light?","options":["Rainbow","Shadow","Cloud","Star"],"answer":"B"},{"question":"Which of these objects is 'transparent' and lets light pass through easily?","options":["A wooden block","A brick wall","A clear glass window","A thick book"],"answer":"C"},{"question":"Which of these is a natural source of light?","options":["Torch","Candle","Sun","Bulb"],"answer":"C"},{"question":"When light bounces off a shiny surface like a mirror, what is it called?","options":["Reflection","Absorption","Bending","Shining"],"answer":"A"}],
      lessons: [{"title":"What is Light? - Our World Illuminator","explanation":"Light is energy that helps us see everything around us. Without light, our world would be completely dark!"},{"title":"Sources of Light - Who Gives us Light?","explanation":"Some things like the Sun and stars give us light naturally. Others, like bulbs and torches, are made by humans to give us light."},{"title":"Transparent, Translucent, and Opaque - Light's Different Paths","explanation":"Objects can let light pass through completely (transparent like glass), partially (translucent like frosted glass), or not at all (opaque like a wall)."},{"title":"How Shadows are Made - Light's Block Party!","explanation":"When an opaque object stands in the path of light, it blocks the light and forms a dark shape behind it, which is called a shadow."},{"title":"Playing with Shadows - Fun with Shapes","explanation":"Shadows can change in size and shape depending on where the light source is and how far or close the object is from the light."},{"title":"Reflections - Light Bounces Back!","explanation":"When light hits a smooth, shiny surface, it bounces back, just like a ball. This bouncing back of light is called reflection, and it's how we see ourselves in a mirror!"}]
    },
    "Electricity and Circuits": {
      content: "<h3><strong>Main focus: Understanding what electricity is, how it helps us, and how to use it safely in our daily lives.</strong></h3><p>Imagine a tiny, magical power that makes your fan spin, your TV show cartoons, and your flashlight glow! This amazing power is called electricity. It flows through special paths, like tiny invisible roads, to make our gadgets and machines work. Learning about electricity is super fun, but it's also very important to know how to use it carefully so we stay safe.</p><h3><strong>Key Concepts:</strong></h3><ul><li>What is Electricity and where does it come from (like batteries)?</li><li>What is an Electric Circuit (the path electricity takes)?</li><li>Why is it important to be Safe with Electricity?</li></ul>",
      quiz: [{"question":"Which of these things uses electricity to work?","options":["A. A bicycle","B. A tree","C. A television","D. A rock"],"answer":"C. A television"},{"question":"What is a small source of electricity often found in toys?","options":["A. A stone","B. A battery","C. A flower","D. A pencil"],"answer":"B. A battery"},{"question":"What do we call the complete path through which electricity flows?","options":["A. A road","B. A river","C. A circuit","D. A garden"],"answer":"C. A circuit"},{"question":"What should you NEVER do with electric wires?","options":["A. Look at them","B. Draw them","C. Touch them with wet hands","D. Learn about them"],"answer":"C. Touch them with wet hands"},{"question":"If an electric bulb is not glowing, what could be a reason?","options":["A. The switch is OFF","B. The wires are connected properly","C. The battery is new","D. The circuit is complete"],"answer":"A. The switch is OFF"}],
      lessons: [{"title":"1. What is Electricity?","explanation":"Let's explore the invisible energy that powers our homes and toys, making everything light up and move!"},{"title":"2. Meet the Battery!","explanation":"Discover how small batteries act like tiny power houses, giving energy to your remote controls and flashlights."},{"title":"3. Making a Bulb Glow","explanation":"Learn the simple magic of connecting a battery, wires, and a bulb to create light!"},{"title":"4. The Path of Electricity: A Circuit Story","explanation":"Understand that electricity needs a complete, unbroken path, like a closed loop, to flow and make things work."},{"title":"5. Safety First with Electricity!","explanation":"Important rules to remember to keep yourself and your family safe around electrical gadgets and wires."},{"title":"6. Conductors and Insulators: Electric Friends and Blockers","explanation":"Find out which materials allow electricity to pass easily and which ones stop it, keeping us safe."}]
    },
    "Fun with Magnets": {
      content: "<h3><strong>Main focus: Let's explore the amazing world of magnets and discover what they are, what they attract, and how they work!</strong></h3><p>Hello, young explorers! Have you ever seen something pull a tiny pin or a paperclip without touching it directly? That's the magic of a magnet! Magnets are special objects that can attract things made of iron, steel, nickel, and cobalt. They have a secret power to pull these things close, almost like an invisible hand. We find magnets in many places around us, helping us in different ways. Let's have some fun learning about these fascinating magnetic friends!</p><h3><strong>Key Concepts:</strong></h3><ul><li>Magnets attract certain materials like iron and steel.</li><li>Magnets have two ends called poles (North and South).</li><li>Opposite poles of magnets attract each other, while similar poles push each other away.</li><li>Magnets are used in many everyday objects.</li></ul>",
      quiz: [{"question":"Which of these things will a magnet attract?","options":["A. A plastic toy","B. A wooden block","C. A steel spoon","D. A paper leaf"],"answer":"C"},{"question":"What are the two ends of a magnet called?","options":["A. Heads and Tails","B. North and South Poles","C. Left and Right Sides","D. Top and Bottom"],"answer":"B"},{"question":"What happens when you bring the North pole of one magnet close to the North pole of another magnet?","options":["A. They stick together","B. They push each other away","C. Nothing happens","D. They spin around"],"answer":"B"},{"question":"Which of these is NOT attracted by a magnet?","options":["A. An iron nail","B. A safety pin","C. A silver coin","D. A refrigerator door"],"answer":"C"},{"question":"Where can you often find a magnet being used in your house?","options":["A. Inside a pencil box","B. On a refrigerator door","C. Under your bed","D. In a water bottle"],"answer":"B"}],
      lessons: [{"title":"What is a Magnet?","explanation":"Learn that a magnet is a special rock or object that can pull certain things towards it, like magic! It has an invisible force."},{"title":"Magnetic and Non-Magnetic Materials","explanation":"Discover which materials (like iron and steel) are attracted to magnets and which ones (like wood, plastic, paper) are not."},{"title":"The Poles of a Magnet","explanation":"Understand that every magnet has two special ends called the North pole and the South pole, where its pulling power is strongest."},{"title":"Attraction and Repulsion","explanation":"Explore how opposite poles (North-South) pull each other, and similar poles (North-North or South-South) push each other away."},{"title":"Finding Directions with Magnets","explanation":"Learn that a freely hanging magnet always points in the North-South direction, helping us to find our way, like a simple compass."},{"title":"Magnets in Our Daily Life","explanation":"See how magnets are used in many things around us, like on refrigerator doors, in toy trains, and in pencil boxes."}]
    },
    "Air Around Us": {
      content: "<h3><strong>Main focus: Air is all around us, even if we can't see it, and it's super important for all living things and many activities we do every day!</strong></h3><p>Imagine you're playing outside, and suddenly your hair moves, or a leaf dances on a tree – that's air! We can't see air with our eyes, but we can feel it. Air is like an invisible blanket covering our entire Earth, and it's everywhere, inside our homes, outside, and even in our balloons. Without air, nothing could live, and many fun things like flying kites or blowing bubbles wouldn't be possible. Let's explore the amazing world of air!</p><h3><strong>Key Concepts:</strong></h3><ul><li>Air is all around us but invisible.</li><li>All living things need air to breathe and survive.</li><li>Air helps many things move and helps us do daily activities.</li></ul>",
      quiz: [{"question":"What can we feel around us but cannot see?","options":["Water","Air","Soil","Stones"],"answer":"B"},{"question":"Why is air important for humans and animals?","options":["To play","To breathe","To eat","To sleep"],"answer":"B"},{"question":"Which of these needs air to fly in the sky?","options":["A rock","A book","A kite","A chair"],"answer":"C"},{"question":"What happens if there is no air?","options":["We can see more","Everything becomes quiet","Living things cannot survive","It gets very hot"],"answer":"C"},{"question":"Which action helps keep the air clean?","options":["Planting more trees","Burning garbage","Using lots of cars","Factories releasing smoke"],"answer":"A"}],
      lessons: [{"title":"What is Air?","explanation":"Air is an invisible gas mixture that surrounds us, which we cannot see but can feel. It's everywhere, even though it's hidden from our eyes!"},{"title":"Feeling the Air Around Us","explanation":"We can feel air when it blows as wind, when we blow bubbles, or when a fan is on. It helps dry our clothes and makes leaves rustle."},{"title":"Air for Living Things","explanation":"Every living being, including humans, animals, and plants, needs air to breathe and stay alive. Without air, life on Earth would not be possible."},{"title":"Air Helps Things Move","explanation":"Air (or wind) can make things move, like kites flying high, sailboats gliding on water, and windmills spinning to make electricity."},{"title":"Air and Burning","explanation":"Air is essential for anything to burn, like a candle flame or a bonfire. If there's no air, the fire goes out."},{"title":"Keeping Our Air Clean","explanation":"It's important to keep our air clean by planting trees and reducing pollution from vehicles and factories, because clean air makes us healthy and happy."}]
    },
    "What Where How and When?": {
      content: "Welcome to the lesson on What Where How and When?! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in What Where How and When??", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from What Where How and When??", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "From Hunting-Gathering to Growing Food": {
      content: "Welcome to the lesson on From Hunting-Gathering to Growing Food! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in From Hunting-Gathering to Growing Food?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from From Hunting-Gathering to Growing Food?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "In the Earliest Cities": {
      content: "Welcome to the lesson on In the Earliest Cities! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in In the Earliest Cities?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from In the Earliest Cities?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "What Books and Burials Tell Us": {
      content: "Welcome to the lesson on What Books and Burials Tell Us! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in What Books and Burials Tell Us?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from What Books and Burials Tell Us?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Kingdoms Kings and an Early Republic": {
      content: "Welcome to the lesson on Kingdoms Kings and an Early Republic! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Kingdoms Kings and an Early Republic?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Kingdoms Kings and an Early Republic?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "New Questions and Ideas": {
      content: "Welcome to the lesson on New Questions and Ideas! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in New Questions and Ideas?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from New Questions and Ideas?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "From a Kingdom to an Empire": {
      content: "Welcome to the lesson on From a Kingdom to an Empire! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in From a Kingdom to an Empire?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from From a Kingdom to an Empire?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Villages Towns and Trade": {
      content: "Welcome to the lesson on Villages Towns and Trade! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Villages Towns and Trade?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Villages Towns and Trade?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "New Empires and Kingdoms": {
      content: "Welcome to the lesson on New Empires and Kingdoms! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in New Empires and Kingdoms?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from New Empires and Kingdoms?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Buildings Paintings and Books": {
      content: "Welcome to the lesson on Buildings Paintings and Books! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Buildings Paintings and Books?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Buildings Paintings and Books?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "The Earth in the Solar System": {
      content: "Welcome to the lesson on The Earth in the Solar System! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in The Earth in the Solar System?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from The Earth in the Solar System?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Globe: Latitudes and Longitudes": {
      content: "Welcome to the lesson on Globe: Latitudes and Longitudes! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Globe: Latitudes and Longitudes?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Globe: Latitudes and Longitudes?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Motions of the Earth": {
      content: "Welcome to the lesson on Motions of the Earth! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Motions of the Earth?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Motions of the Earth?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Maps": {
      content: "Welcome to the lesson on Maps! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Maps?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Maps?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Major Domains of the Earth": {
      content: "Welcome to the lesson on Major Domains of the Earth! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Major Domains of the Earth?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Major Domains of the Earth?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Our Country - India": {
      content: "Welcome to the lesson on Our Country - India! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Our Country - India?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Our Country - India?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Understanding Diversity": {
      content: "Welcome to the lesson on Understanding Diversity! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Understanding Diversity?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Understanding Diversity?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Diversity and Discrimination": {
      content: "Welcome to the lesson on Diversity and Discrimination! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Diversity and Discrimination?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Diversity and Discrimination?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "What is Government?": {
      content: "Welcome to the lesson on What is Government?! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in What is Government??", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from What is Government??", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Panchayati Raj": {
      content: "Welcome to the lesson on Panchayati Raj! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Panchayati Raj?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Panchayati Raj?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Rural Administration": {
      content: "Welcome to the lesson on Rural Administration! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Rural Administration?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Rural Administration?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Urban Administration": {
      content: "Welcome to the lesson on Urban Administration! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Urban Administration?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Urban Administration?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Rural Livelihoods": {
      content: "Welcome to the lesson on Rural Livelihoods! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Rural Livelihoods?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Rural Livelihoods?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Urban Livelihoods": {
      content: "Welcome to the lesson on Urban Livelihoods! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Urban Livelihoods?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Urban Livelihoods?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Integers": {
      content: "Welcome to the lesson on Integers! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Integers?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Integers?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Fractions and Decimals": {
      content: "Welcome to the lesson on Fractions and Decimals! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Fractions and Decimals?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Fractions and Decimals?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Simple Equations": {
      content: "Welcome to the lesson on Simple Equations! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Simple Equations?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Simple Equations?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Lines and Angles": {
      content: "Welcome to the lesson on Lines and Angles! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Lines and Angles?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Lines and Angles?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "The Triangle and its Properties": {
      content: "Welcome to the lesson on The Triangle and its Properties! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in The Triangle and its Properties?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from The Triangle and its Properties?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Congruence of Triangles": {
      content: "Welcome to the lesson on Congruence of Triangles! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Congruence of Triangles?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Congruence of Triangles?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Comparing Quantities": {
      content: "Welcome to the lesson on Comparing Quantities! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Comparing Quantities?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Comparing Quantities?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Rational Numbers": {
      content: "Welcome to the lesson on Rational Numbers! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Rational Numbers?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Rational Numbers?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Practical Geometry": {
      content: "Welcome to the lesson on Practical Geometry! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Practical Geometry?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Practical Geometry?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Perimeter and Area": {
      content: "Welcome to the lesson on Perimeter and Area! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Perimeter and Area?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Perimeter and Area?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Algebraic Expressions": {
      content: "Welcome to the lesson on Algebraic Expressions! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Algebraic Expressions?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Algebraic Expressions?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Exponents and Powers": {
      content: "Welcome to the lesson on Exponents and Powers! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Exponents and Powers?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Exponents and Powers?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Symmetry": {
      content: "Welcome to the lesson on Symmetry! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Symmetry?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Symmetry?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Visualising Solid Shapes": {
      content: "Welcome to the lesson on Visualising Solid Shapes! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Visualising Solid Shapes?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Visualising Solid Shapes?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Nutrition in Plants": {
      content: "Welcome to the lesson on Nutrition in Plants! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Nutrition in Plants?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Nutrition in Plants?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Nutrition in Animals": {
      content: "Welcome to the lesson on Nutrition in Animals! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Nutrition in Animals?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Nutrition in Animals?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Heat": {
      content: "Welcome to the lesson on Heat! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Heat?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Heat?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Acids Bases and Salts": {
      content: "Welcome to the lesson on Acids Bases and Salts! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Acids Bases and Salts?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Acids Bases and Salts?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Physical and Chemical Changes": {
      content: "Welcome to the lesson on Physical and Chemical Changes! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Physical and Chemical Changes?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Physical and Chemical Changes?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Respiration in Organisms": {
      content: "Welcome to the lesson on Respiration in Organisms! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Respiration in Organisms?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Respiration in Organisms?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Transportation in Animals and Plants": {
      content: "Welcome to the lesson on Transportation in Animals and Plants! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Transportation in Animals and Plants?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Transportation in Animals and Plants?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Reproduction in Plants": {
      content: "Welcome to the lesson on Reproduction in Plants! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Reproduction in Plants?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Reproduction in Plants?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Motion and Time": {
      content: "Welcome to the lesson on Motion and Time! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Motion and Time?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Motion and Time?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Electric Current and its Effects": {
      content: "Welcome to the lesson on Electric Current and its Effects! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Electric Current and its Effects?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Electric Current and its Effects?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Light": {
      content: "Welcome to the lesson on Light! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Light?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Light?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Forests: Our Lifeline": {
      content: "Welcome to the lesson on Forests: Our Lifeline! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Forests: Our Lifeline?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Forests: Our Lifeline?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Wastewater Story": {
      content: "Welcome to the lesson on Wastewater Story! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Wastewater Story?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Wastewater Story?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Introduction: Tracing Changes Through a Thousand Years": {
      content: "Welcome to the lesson on Introduction: Tracing Changes Through a Thousand Years! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Introduction: Tracing Changes Through a Thousand Years?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Introduction: Tracing Changes Through a Thousand Years?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "New Kings and Kingdoms": {
      content: "Welcome to the lesson on New Kings and Kingdoms! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in New Kings and Kingdoms?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from New Kings and Kingdoms?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Delhi: 12th to 15th Century": {
      content: "Welcome to the lesson on Delhi: 12th to 15th Century! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Delhi: 12th to 15th Century?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Delhi: 12th to 15th Century?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "The Mughals (16th to 17th Century)": {
      content: "Welcome to the lesson on The Mughals (16th to 17th Century)! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in The Mughals (16th to 17th Century)?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from The Mughals (16th to 17th Century)?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Rulers and Buildings": {
      content: "Welcome to the lesson on Rulers and Buildings! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Rulers and Buildings?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Rulers and Buildings?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Towns Traders and Craftspersons": {
      content: "Welcome to the lesson on Towns Traders and Craftspersons! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Towns Traders and Craftspersons?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Towns Traders and Craftspersons?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Tribes Nomads and Settled Communities": {
      content: "Welcome to the lesson on Tribes Nomads and Settled Communities! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Tribes Nomads and Settled Communities?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Tribes Nomads and Settled Communities?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Devotional Paths to the Divine": {
      content: "Welcome to the lesson on Devotional Paths to the Divine! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Devotional Paths to the Divine?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Devotional Paths to the Divine?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "The Making of Regional Cultures": {
      content: "Welcome to the lesson on The Making of Regional Cultures! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in The Making of Regional Cultures?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from The Making of Regional Cultures?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "18th-Century Political Formations": {
      content: "Welcome to the lesson on 18th-Century Political Formations! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in 18th-Century Political Formations?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from 18th-Century Political Formations?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Environment": {
      content: "Welcome to the lesson on Environment! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Environment?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Environment?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Inside Our Earth": {
      content: "Welcome to the lesson on Inside Our Earth! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Inside Our Earth?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Inside Our Earth?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Our Changing Earth": {
      content: "Welcome to the lesson on Our Changing Earth! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Our Changing Earth?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Our Changing Earth?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Air": {
      content: "Welcome to the lesson on Air! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Air?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Air?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Water": {
      content: "Welcome to the lesson on Water! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Water?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Water?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Natural Vegetation and Wildlife": {
      content: "Welcome to the lesson on Natural Vegetation and Wildlife! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Natural Vegetation and Wildlife?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Natural Vegetation and Wildlife?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Human Environment - Settlement Transport and Communication": {
      content: "Welcome to the lesson on Human Environment - Settlement Transport and Communication! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Human Environment - Settlement Transport and Communication?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Human Environment - Settlement Transport and Communication?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Human Environment Interactions - The Tropical and Subtropical Region": {
      content: "Welcome to the lesson on Human Environment Interactions - The Tropical and Subtropical Region! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Human Environment Interactions - The Tropical and Subtropical Region?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Human Environment Interactions - The Tropical and Subtropical Region?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Life in the Deserts": {
      content: "Welcome to the lesson on Life in the Deserts! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Life in the Deserts?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Life in the Deserts?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "On Equality": {
      content: "Welcome to the lesson on On Equality! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in On Equality?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from On Equality?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Role of the Government in Health": {
      content: "Welcome to the lesson on Role of the Government in Health! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Role of the Government in Health?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Role of the Government in Health?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "How the State Government Works": {
      content: "Welcome to the lesson on How the State Government Works! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in How the State Government Works?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from How the State Government Works?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Growing up as Boys and Girls": {
      content: "Welcome to the lesson on Growing up as Boys and Girls! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Growing up as Boys and Girls?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Growing up as Boys and Girls?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Women Change the World": {
      content: "Welcome to the lesson on Women Change the World! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Women Change the World?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Women Change the World?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Understanding Media": {
      content: "Welcome to the lesson on Understanding Media! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Understanding Media?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Understanding Media?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Markets Around Us": {
      content: "Welcome to the lesson on Markets Around Us! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Markets Around Us?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Markets Around Us?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "A Shirt in the Market": {
      content: "Welcome to the lesson on A Shirt in the Market! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in A Shirt in the Market?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from A Shirt in the Market?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Struggles for Equality": {
      content: "Welcome to the lesson on Struggles for Equality! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Struggles for Equality?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Struggles for Equality?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Rational Numbers": {
      content: "Welcome to the lesson on Rational Numbers! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Rational Numbers?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Rational Numbers?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Linear Equations in One Variable": {
      content: "Welcome to the lesson on Linear Equations in One Variable! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Linear Equations in One Variable?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Linear Equations in One Variable?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Understanding Quadrilaterals": {
      content: "Welcome to the lesson on Understanding Quadrilaterals! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Understanding Quadrilaterals?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Understanding Quadrilaterals?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Practical Geometry": {
      content: "Welcome to the lesson on Practical Geometry! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Practical Geometry?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Practical Geometry?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Squares and Square Roots": {
      content: "Welcome to the lesson on Squares and Square Roots! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Squares and Square Roots?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Squares and Square Roots?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Cubes and Cube Roots": {
      content: "Welcome to the lesson on Cubes and Cube Roots! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Cubes and Cube Roots?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Cubes and Cube Roots?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Comparing Quantities": {
      content: "Welcome to the lesson on Comparing Quantities! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Comparing Quantities?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Comparing Quantities?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Algebraic Expressions and Identities": {
      content: "Welcome to the lesson on Algebraic Expressions and Identities! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Algebraic Expressions and Identities?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Algebraic Expressions and Identities?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Visualising Solid Shapes": {
      content: "Welcome to the lesson on Visualising Solid Shapes! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Visualising Solid Shapes?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Visualising Solid Shapes?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Mensuration": {
      content: "Welcome to the lesson on Mensuration! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Mensuration?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Mensuration?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Exponents and Powers": {
      content: "Welcome to the lesson on Exponents and Powers! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Exponents and Powers?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Exponents and Powers?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Direct and Inverse Proportions": {
      content: "Welcome to the lesson on Direct and Inverse Proportions! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Direct and Inverse Proportions?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Direct and Inverse Proportions?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Factorisation": {
      content: "Welcome to the lesson on Factorisation! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Factorisation?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Factorisation?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Introduction to Graphs": {
      content: "Welcome to the lesson on Introduction to Graphs! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Introduction to Graphs?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Introduction to Graphs?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Playing with Numbers": {
      content: "Welcome to the lesson on Playing with Numbers! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Playing with Numbers?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Playing with Numbers?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Crop Production and Management": {
      content: "Welcome to the lesson on Crop Production and Management! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Crop Production and Management?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Crop Production and Management?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Microorganisms: Friend and Foe": {
      content: "Welcome to the lesson on Microorganisms: Friend and Foe! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Microorganisms: Friend and Foe?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Microorganisms: Friend and Foe?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Synthetic Fibres and Plastics": {
      content: "Welcome to the lesson on Synthetic Fibres and Plastics! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Synthetic Fibres and Plastics?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Synthetic Fibres and Plastics?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Materials: Metals and Non-Metals": {
      content: "Welcome to the lesson on Materials: Metals and Non-Metals! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Materials: Metals and Non-Metals?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Materials: Metals and Non-Metals?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Coal and Petroleum": {
      content: "Welcome to the lesson on Coal and Petroleum! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Coal and Petroleum?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Coal and Petroleum?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Combustion and Flame": {
      content: "Welcome to the lesson on Combustion and Flame! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Combustion and Flame?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Combustion and Flame?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Conservation of Plants and Animals": {
      content: "Welcome to the lesson on Conservation of Plants and Animals! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Conservation of Plants and Animals?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Conservation of Plants and Animals?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Cell — Structure and Functions": {
      content: "Welcome to the lesson on Cell — Structure and Functions! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Cell — Structure and Functions?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Cell — Structure and Functions?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Reproduction in Animals": {
      content: "Welcome to the lesson on Reproduction in Animals! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Reproduction in Animals?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Reproduction in Animals?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Reaching the Age of Adolescence": {
      content: "Welcome to the lesson on Reaching the Age of Adolescence! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Reaching the Age of Adolescence?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Reaching the Age of Adolescence?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Force and Pressure": {
      content: "Welcome to the lesson on Force and Pressure! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Force and Pressure?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Force and Pressure?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Friction": {
      content: "Welcome to the lesson on Friction! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Friction?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Friction?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Sound": {
      content: "Welcome to the lesson on Sound! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Sound?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Sound?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Chemical Effects of Electric Current": {
      content: "Welcome to the lesson on Chemical Effects of Electric Current! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Chemical Effects of Electric Current?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Chemical Effects of Electric Current?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Some Natural Phenomena": {
      content: "Welcome to the lesson on Some Natural Phenomena! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Some Natural Phenomena?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Some Natural Phenomena?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Light": {
      content: "Welcome to the lesson on Light! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Light?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Light?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Stars and the Solar System": {
      content: "Welcome to the lesson on Stars and the Solar System! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Stars and the Solar System?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Stars and the Solar System?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Pollution of Air and Water": {
      content: "Welcome to the lesson on Pollution of Air and Water! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Pollution of Air and Water?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Pollution of Air and Water?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "How When and Where": {
      content: "Welcome to the lesson on How When and Where! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in How When and Where?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from How When and Where?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "From Trade to Territory": {
      content: "Welcome to the lesson on From Trade to Territory! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in From Trade to Territory?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from From Trade to Territory?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Ruling the Countryside": {
      content: "Welcome to the lesson on Ruling the Countryside! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Ruling the Countryside?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Ruling the Countryside?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Tribals Dikus and the Vision of a Golden Age": {
      content: "Welcome to the lesson on Tribals Dikus and the Vision of a Golden Age! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Tribals Dikus and the Vision of a Golden Age?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Tribals Dikus and the Vision of a Golden Age?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "When People Rebel": {
      content: "Welcome to the lesson on When People Rebel! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in When People Rebel?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from When People Rebel?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Colonialism and the City": {
      content: "Welcome to the lesson on Colonialism and the City! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Colonialism and the City?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Colonialism and the City?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Weavers Iron Smelters and Factory Owners": {
      content: "Welcome to the lesson on Weavers Iron Smelters and Factory Owners! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Weavers Iron Smelters and Factory Owners?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Weavers Iron Smelters and Factory Owners?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Civilising the Native Educating the Nation": {
      content: "Welcome to the lesson on Civilising the Native Educating the Nation! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Civilising the Native Educating the Nation?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Civilising the Native Educating the Nation?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Women Caste and Reform": {
      content: "Welcome to the lesson on Women Caste and Reform! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Women Caste and Reform?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Women Caste and Reform?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "The Changing World of Visual Arts": {
      content: "Welcome to the lesson on The Changing World of Visual Arts! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in The Changing World of Visual Arts?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from The Changing World of Visual Arts?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "The Making of the National Movement: 1870s-1947": {
      content: "Welcome to the lesson on The Making of the National Movement: 1870s-1947! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in The Making of the National Movement: 1870s-1947?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from The Making of the National Movement: 1870s-1947?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "India After Independence": {
      content: "Welcome to the lesson on India After Independence! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in India After Independence?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from India After Independence?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Resources": {
      content: "Welcome to the lesson on Resources! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Resources?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Resources?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Land Soil Water Natural Vegetation and Wildlife Resources": {
      content: "Welcome to the lesson on Land Soil Water Natural Vegetation and Wildlife Resources! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Land Soil Water Natural Vegetation and Wildlife Resources?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Land Soil Water Natural Vegetation and Wildlife Resources?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Mineral and Power Resources": {
      content: "Welcome to the lesson on Mineral and Power Resources! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Mineral and Power Resources?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Mineral and Power Resources?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Agriculture": {
      content: "Welcome to the lesson on Agriculture! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Agriculture?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Agriculture?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Industries": {
      content: "Welcome to the lesson on Industries! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Industries?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Industries?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Human Resources": {
      content: "Welcome to the lesson on Human Resources! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Human Resources?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Human Resources?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "The Indian Constitution": {
      content: "Welcome to the lesson on The Indian Constitution! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in The Indian Constitution?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from The Indian Constitution?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Understanding Secularism": {
      content: "Welcome to the lesson on Understanding Secularism! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Understanding Secularism?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Understanding Secularism?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Why do we need a Parliament?": {
      content: "Welcome to the lesson on Why do we need a Parliament?! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Why do we need a Parliament??", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Why do we need a Parliament??", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Understanding Laws": {
      content: "Welcome to the lesson on Understanding Laws! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Understanding Laws?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Understanding Laws?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Judiciary": {
      content: "Welcome to the lesson on Judiciary! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Judiciary?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Judiciary?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Understanding Our Criminal Justice System": {
      content: "Welcome to the lesson on Understanding Our Criminal Justice System! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Understanding Our Criminal Justice System?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Understanding Our Criminal Justice System?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Understanding Marginalisation": {
      content: "Welcome to the lesson on Understanding Marginalisation! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Understanding Marginalisation?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Understanding Marginalisation?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Confronting Marginalisation": {
      content: "Welcome to the lesson on Confronting Marginalisation! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Confronting Marginalisation?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Confronting Marginalisation?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Public Facilities": {
      content: "Welcome to the lesson on Public Facilities! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Public Facilities?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Public Facilities?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Law and Social Justice": {
      content: "Welcome to the lesson on Law and Social Justice! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Law and Social Justice?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Law and Social Justice?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Number Systems": {
      content: "Welcome to the lesson on Number Systems! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Number Systems?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Number Systems?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Polynomials": {
      content: "Welcome to the lesson on Polynomials! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Polynomials?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Polynomials?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Coordinate Geometry": {
      content: "Welcome to the lesson on Coordinate Geometry! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Coordinate Geometry?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Coordinate Geometry?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Linear Equations in Two Variables": {
      content: "Welcome to the lesson on Linear Equations in Two Variables! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Linear Equations in Two Variables?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Linear Equations in Two Variables?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Introduction to Euclid's Geometry": {
      content: "Welcome to the lesson on Introduction to Euclid's Geometry! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Introduction to Euclid's Geometry?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Introduction to Euclid's Geometry?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Lines and Angles": {
      content: "Welcome to the lesson on Lines and Angles! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Lines and Angles?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Lines and Angles?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Triangles": {
      content: "Welcome to the lesson on Triangles! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Triangles?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Triangles?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Quadrilaterals": {
      content: "Welcome to the lesson on Quadrilaterals! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Quadrilaterals?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Quadrilaterals?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Areas of Parallelograms and Triangles": {
      content: "Welcome to the lesson on Areas of Parallelograms and Triangles! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Areas of Parallelograms and Triangles?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Areas of Parallelograms and Triangles?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Circles": {
      content: "Welcome to the lesson on Circles! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Circles?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Circles?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Constructions": {
      content: "Welcome to the lesson on Constructions! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Constructions?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Constructions?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Heron's Formula": {
      content: "Welcome to the lesson on Heron's Formula! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Heron's Formula?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Heron's Formula?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Surface Areas and Volumes": {
      content: "Welcome to the lesson on Surface Areas and Volumes! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Surface Areas and Volumes?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Surface Areas and Volumes?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Statistics": {
      content: "Welcome to the lesson on Statistics! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Statistics?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Statistics?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Probability": {
      content: "Welcome to the lesson on Probability! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Probability?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Probability?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Matter in Our Surroundings": {
      content: "Welcome to the lesson on Matter in Our Surroundings! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Matter in Our Surroundings?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Matter in Our Surroundings?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Is Matter Around Us Pure": {
      content: "Welcome to the lesson on Is Matter Around Us Pure! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Is Matter Around Us Pure?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Is Matter Around Us Pure?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Atoms and Molecules": {
      content: "Welcome to the lesson on Atoms and Molecules! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Atoms and Molecules?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Atoms and Molecules?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Structure of the Atom": {
      content: "Welcome to the lesson on Structure of the Atom! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Structure of the Atom?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Structure of the Atom?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "The Fundamental Unit of Life": {
      content: "Welcome to the lesson on The Fundamental Unit of Life! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in The Fundamental Unit of Life?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from The Fundamental Unit of Life?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Tissues": {
      content: "Welcome to the lesson on Tissues! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Tissues?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Tissues?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Diversity in Living Organisms": {
      content: "Welcome to the lesson on Diversity in Living Organisms! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Diversity in Living Organisms?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Diversity in Living Organisms?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Motion": {
      content: "Welcome to the lesson on Motion! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Motion?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Motion?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Force and Laws of Motion": {
      content: "Welcome to the lesson on Force and Laws of Motion! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Force and Laws of Motion?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Force and Laws of Motion?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Gravitation": {
      content: "Welcome to the lesson on Gravitation! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Gravitation?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Gravitation?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Work and Energy": {
      content: "Welcome to the lesson on Work and Energy! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Work and Energy?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Work and Energy?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Sound": {
      content: "Welcome to the lesson on Sound! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Sound?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Sound?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Why Do We Fall Ill": {
      content: "Welcome to the lesson on Why Do We Fall Ill! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Why Do We Fall Ill?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Why Do We Fall Ill?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Natural Resources": {
      content: "Welcome to the lesson on Natural Resources! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Natural Resources?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Natural Resources?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Improvement in Food Resources": {
      content: "Welcome to the lesson on Improvement in Food Resources! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Improvement in Food Resources?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Improvement in Food Resources?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "The French Revolution": {
      content: "Welcome to the lesson on The French Revolution! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in The French Revolution?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from The French Revolution?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Socialism in Europe and the Russian Revolution": {
      content: "Welcome to the lesson on Socialism in Europe and the Russian Revolution! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Socialism in Europe and the Russian Revolution?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Socialism in Europe and the Russian Revolution?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Nazism and the Rise of Hitler": {
      content: "Welcome to the lesson on Nazism and the Rise of Hitler! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Nazism and the Rise of Hitler?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Nazism and the Rise of Hitler?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Forest Society and Colonialism": {
      content: "Welcome to the lesson on Forest Society and Colonialism! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Forest Society and Colonialism?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Forest Society and Colonialism?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Pastoralists in the Modern World": {
      content: "Welcome to the lesson on Pastoralists in the Modern World! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Pastoralists in the Modern World?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Pastoralists in the Modern World?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "India - Size and Location": {
      content: "Welcome to the lesson on India - Size and Location! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in India - Size and Location?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from India - Size and Location?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Physical Features of India": {
      content: "Welcome to the lesson on Physical Features of India! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Physical Features of India?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Physical Features of India?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Drainage": {
      content: "Welcome to the lesson on Drainage! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Drainage?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Drainage?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Climate": {
      content: "Welcome to the lesson on Climate! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Climate?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Climate?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Natural Vegetation and Wild Life": {
      content: "Welcome to the lesson on Natural Vegetation and Wild Life! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Natural Vegetation and Wild Life?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Natural Vegetation and Wild Life?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Population": {
      content: "Welcome to the lesson on Population! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Population?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Population?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "What is Democracy? Why Democracy?": {
      content: "Welcome to the lesson on What is Democracy? Why Democracy?! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in What is Democracy? Why Democracy??", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from What is Democracy? Why Democracy??", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Constitutional Design": {
      content: "Welcome to the lesson on Constitutional Design! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Constitutional Design?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Constitutional Design?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Electoral Politics": {
      content: "Welcome to the lesson on Electoral Politics! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Electoral Politics?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Electoral Politics?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Working of Institutions": {
      content: "Welcome to the lesson on Working of Institutions! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Working of Institutions?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Working of Institutions?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Democratic Rights": {
      content: "Welcome to the lesson on Democratic Rights! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Democratic Rights?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Democratic Rights?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "The Story of Village Palampur": {
      content: "Welcome to the lesson on The Story of Village Palampur! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in The Story of Village Palampur?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from The Story of Village Palampur?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "People as Resource": {
      content: "Welcome to the lesson on People as Resource! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in People as Resource?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from People as Resource?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Poverty as a Challenge": {
      content: "Welcome to the lesson on Poverty as a Challenge! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Poverty as a Challenge?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Poverty as a Challenge?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },
    "Food Security in India": {
      content: "Welcome to the lesson on Food Security in India! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Food Security in India?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Food Security in India?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    },

    "How Many Ponytails?": {
      content: "Welcome to the lesson on How Many Ponytails?! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in How Many Ponytails??", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from How Many Ponytails??", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Haldi's Adventure": {
      content: "Welcome to the lesson on Haldi's Adventure! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Haldi's Adventure?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Haldi's Adventure?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "I am Lucky!": {
      content: "Welcome to the lesson on I am Lucky!! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in I am Lucky!?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from I am Lucky!?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Mr. Nobody": {
      content: "Welcome to the lesson on Mr. Nobody! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Mr. Nobody?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Mr. Nobody?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "On My Blackboard I can Draw": {
      content: "Welcome to the lesson on On My Blackboard I can Draw! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in On My Blackboard I can Draw?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from On My Blackboard I can Draw?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Make it Shorter": {
      content: "Welcome to the lesson on Make it Shorter! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Make it Shorter?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Make it Shorter?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "I am the Music Man": {
      content: "Welcome to the lesson on I am the Music Man! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in I am the Music Man?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from I am the Music Man?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "The Mumbai Musicians": {
      content: "Welcome to the lesson on The Mumbai Musicians! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in The Mumbai Musicians?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from The Mumbai Musicians?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Granny Granny Please Comb my Hair": {
      content: "Welcome to the lesson on Granny Granny Please Comb my Hair! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Granny Granny Please Comb my Hair?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Granny Granny Please Comb my Hair?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "The Magic Porridge Pot": {
      content: "Welcome to the lesson on The Magic Porridge Pot! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in The Magic Porridge Pot?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from The Magic Porridge Pot?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Strange Talk": {
      content: "Welcome to the lesson on Strange Talk! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Strange Talk?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Strange Talk?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "The Grasshopper and the Ant": {
      content: "Welcome to the lesson on The Grasshopper and the Ant! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in The Grasshopper and the Ant?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from The Grasshopper and the Ant?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "ऊँट चला": {
      content: "Welcome to the lesson on ऊँट चला! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in ऊँट चला?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from ऊँट चला?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "भालू ने खेली फुटबॉल": {
      content: "Welcome to the lesson on भालू ने खेली फुटबॉल! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in भालू ने खेली फुटबॉल?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from भालू ने खेली फुटबॉल?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "म्याऊँ, म्याऊँ !!": {
      content: "Welcome to the lesson on म्याऊँ, म्याऊँ !!! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in म्याऊँ, म्याऊँ !!?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from म्याऊँ, म्याऊँ !!?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "अधिक बलवान कौन?": {
      content: "Welcome to the lesson on अधिक बलवान कौन?! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in अधिक बलवान कौन??", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from अधिक बलवान कौन??", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "दोस्त की मदद": {
      content: "Welcome to the lesson on दोस्त की मदद! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in दोस्त की मदद?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from दोस्त की मदद?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "बहुत हुआ": {
      content: "Welcome to the lesson on बहुत हुआ! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in बहुत हुआ?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from बहुत हुआ?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "मेरी किताब": {
      content: "Welcome to the lesson on मेरी किताब! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in मेरी किताब?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from मेरी किताब?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "तितली और कली": {
      content: "Welcome to the lesson on तितली और कली! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in तितली और कली?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from तितली और कली?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "बुलबुल": {
      content: "Welcome to the lesson on बुलबुल! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in बुलबुल?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from बुलबुल?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "मीठी सारंगी": {
      content: "Welcome to the lesson on मीठी सारंगी! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in मीठी सारंगी?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from मीठी सारंगी?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "टेसू राजा बीच बाजार": {
      content: "Welcome to the lesson on टेसू राजा बीच बाजार! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in टेसू राजा बीच बाजार?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from टेसू राजा बीच बाजार?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "बस के नीचे बाघ": {
      content: "Welcome to the lesson on बस के नीचे बाघ! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in बस के नीचे बाघ?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from बस के नीचे बाघ?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "सूरज जल्दी आना जी": {
      content: "Welcome to the lesson on सूरज जल्दी आना जी! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in सूरज जल्दी आना जी?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from सूरज जल्दी आना जी?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "नटखट चूहा": {
      content: "Welcome to the lesson on नटखट चूहा! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in नटखट चूहा?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from नटखट चूहा?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "एक्की-दोक्की": {
      content: "Welcome to the lesson on एक्की-दोक्की! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in एक्की-दोक्की?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from एक्की-दोक्की?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Fun With Numbers": {
      content: "Welcome to the lesson on Fun With Numbers! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Fun With Numbers?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Fun With Numbers?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Fun With Give and Take": {
      content: "Welcome to the lesson on Fun With Give and Take! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Fun With Give and Take?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Fun With Give and Take?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Play With Patterns": {
      content: "Welcome to the lesson on Play With Patterns! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Play With Patterns?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Play With Patterns?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Can We Share?": {
      content: "Welcome to the lesson on Can We Share?! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Can We Share??", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Can We Share??", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Smart Charts": {
      content: "Welcome to the lesson on Smart Charts! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Smart Charts?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Smart Charts?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Rupees and Paise": {
      content: "Welcome to the lesson on Rupees and Paise! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Rupees and Paise?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Rupees and Paise?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Poonam's Day Out": {
      content: "Welcome to the lesson on Poonam's Day Out! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Poonam's Day Out?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Poonam's Day Out?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Water O' Water!": {
      content: "Welcome to the lesson on Water O' Water!! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Water O' Water!?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Water O' Water!?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Chhotu's House": {
      content: "Welcome to the lesson on Chhotu's House! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Chhotu's House?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Chhotu's House?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "It's Raining": {
      content: "Welcome to the lesson on It's Raining! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in It's Raining?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from It's Raining?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "What is Cooking": {
      content: "Welcome to the lesson on What is Cooking! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in What is Cooking?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from What is Cooking?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "From Here to There": {
      content: "Welcome to the lesson on From Here to There! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in From Here to There?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from From Here to There?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Work We Do": {
      content: "Welcome to the lesson on Work We Do! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Work We Do?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Work We Do?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Sharing Our Feelings": {
      content: "Welcome to the lesson on Sharing Our Feelings! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Sharing Our Feelings?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Sharing Our Feelings?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "The Story of Food": {
      content: "Welcome to the lesson on The Story of Food! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in The Story of Food?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from The Story of Food?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Making Pots": {
      content: "Welcome to the lesson on Making Pots! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Making Pots?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Making Pots?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Games We Play": {
      content: "Welcome to the lesson on Games We Play! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Games We Play?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Games We Play?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Here Comes a Letter": {
      content: "Welcome to the lesson on Here Comes a Letter! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Here Comes a Letter?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Here Comes a Letter?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "A House Like This!": {
      content: "Welcome to the lesson on A House Like This!! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in A House Like This!?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from A House Like This!?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Our Friends - Animals": {
      content: "Welcome to the lesson on Our Friends - Animals! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Our Friends - Animals?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Our Friends - Animals?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Drop by Drop": {
      content: "Welcome to the lesson on Drop by Drop! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Drop by Drop?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Drop by Drop?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Families can be Different": {
      content: "Welcome to the lesson on Families can be Different! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Families can be Different?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Families can be Different?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Left-Right": {
      content: "Welcome to the lesson on Left-Right! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Left-Right?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Left-Right?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "A Beautiful Cloth": {
      content: "Welcome to the lesson on A Beautiful Cloth! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in A Beautiful Cloth?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from A Beautiful Cloth?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Web of Life": {
      content: "Welcome to the lesson on Web of Life! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Web of Life?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Web of Life?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Yellow Butterfly": {
      content: "Welcome to the lesson on Yellow Butterfly! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Yellow Butterfly?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Yellow Butterfly?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Trains": {
      content: "Welcome to the lesson on Trains! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Trains?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Trains?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Story of the Road": {
      content: "Welcome to the lesson on Story of the Road! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Story of the Road?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Story of the Road?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Puppy and I": {
      content: "Welcome to the lesson on Puppy and I! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Puppy and I?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Puppy and I?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Little Tiger Big Tiger": {
      content: "Welcome to the lesson on Little Tiger Big Tiger! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Little Tiger Big Tiger?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Little Tiger Big Tiger?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "What's in the Mailbox?": {
      content: "Welcome to the lesson on What's in the Mailbox?! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in What's in the Mailbox??", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from What's in the Mailbox??", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "My Silly Sister": {
      content: "Welcome to the lesson on My Silly Sister! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in My Silly Sister?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from My Silly Sister?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Don't Tell": {
      content: "Welcome to the lesson on Don't Tell! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Don't Tell?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Don't Tell?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "He is My Brother": {
      content: "Welcome to the lesson on He is My Brother! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in He is My Brother?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from He is My Brother?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "How Creatures Move": {
      content: "Welcome to the lesson on How Creatures Move! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in How Creatures Move?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from How Creatures Move?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Ship of the Desert": {
      content: "Welcome to the lesson on Ship of the Desert! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Ship of the Desert?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Ship of the Desert?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "कक्कू": {
      content: "Welcome to the lesson on कक्कू! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in कक्कू?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from कक्कू?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "शेखीबाज़ मक्खी": {
      content: "Welcome to the lesson on शेखीबाज़ मक्खी! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in शेखीबाज़ मक्खी?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from शेखीबाज़ मक्खी?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "चाँद वाली अम्मा": {
      content: "Welcome to the lesson on चाँद वाली अम्मा! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in चाँद वाली अम्मा?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from चाँद वाली अम्मा?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "मन करता है": {
      content: "Welcome to the lesson on मन करता है! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in मन करता है?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from मन करता है?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "बहादुर बित्तो": {
      content: "Welcome to the lesson on बहादुर बित्तो! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in बहादुर बित्तो?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from बहादुर बित्तो?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "हमसे सब कहते": {
      content: "Welcome to the lesson on हमसे सब कहते! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in हमसे सब कहते?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from हमसे सब कहते?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "टिपटिपवा": {
      content: "Welcome to the lesson on टिपटिपवा! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in टिपटिपवा?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from टिपटिपवा?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "बंदर बाँट": {
      content: "Welcome to the lesson on बंदर बाँट! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in बंदर बाँट?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from बंदर बाँट?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "अक्ल बड़ी या भैंस": {
      content: "Welcome to the lesson on अक्ल बड़ी या भैंस! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in अक्ल बड़ी या भैंस?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from अक्ल बड़ी या भैंस?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "क्योंजीमल और कैसे-कैसलिया": {
      content: "Welcome to the lesson on क्योंजीमल और कैसे-कैसलिया! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in क्योंजीमल और कैसे-कैसलिया?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from क्योंजीमल और कैसे-कैसलिया?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "मीरा बहन और बाघ": {
      content: "Welcome to the lesson on मीरा बहन और बाघ! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in मीरा बहन और बाघ?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from मीरा बहन और बाघ?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "जब मुझे साँप ने काटा": {
      content: "Welcome to the lesson on जब मुझे साँप ने काटा! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in जब मुझे साँप ने काटा?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from जब मुझे साँप ने काटा?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "मिर्च का मज़ा": {
      content: "Welcome to the lesson on मिर्च का मज़ा! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in मिर्च का मज़ा?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from मिर्च का मज़ा?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "सबसे अच्छा पेड़": {
      content: "Welcome to the lesson on सबसे अच्छा पेड़! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in सबसे अच्छा पेड़?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from सबसे अच्छा पेड़?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Building with Bricks": {
      content: "Welcome to the lesson on Building with Bricks! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Building with Bricks?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Building with Bricks?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "A Trip to Bhopal": {
      content: "Welcome to the lesson on A Trip to Bhopal! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in A Trip to Bhopal?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from A Trip to Bhopal?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Tick-Tick-Tick": {
      content: "Welcome to the lesson on Tick-Tick-Tick! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Tick-Tick-Tick?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Tick-Tick-Tick?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "The Way The World Looks": {
      content: "Welcome to the lesson on The Way The World Looks! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in The Way The World Looks?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from The Way The World Looks?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "The Junk Seller": {
      content: "Welcome to the lesson on The Junk Seller! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in The Junk Seller?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from The Junk Seller?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Carts and Wheels": {
      content: "Welcome to the lesson on Carts and Wheels! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Carts and Wheels?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Carts and Wheels?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Halves and Quarters": {
      content: "Welcome to the lesson on Halves and Quarters! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Halves and Quarters?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Halves and Quarters?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Tables and Shares": {
      content: "Welcome to the lesson on Tables and Shares! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Tables and Shares?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Tables and Shares?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "How Heavy? How Light?": {
      content: "Welcome to the lesson on How Heavy? How Light?! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in How Heavy? How Light??", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from How Heavy? How Light??", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Fields and Fences": {
      content: "Welcome to the lesson on Fields and Fences! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Fields and Fences?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Fields and Fences?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Going to School": {
      content: "Welcome to the lesson on Going to School! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Going to School?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Going to School?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Ear to Ear": {
      content: "Welcome to the lesson on Ear to Ear! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Ear to Ear?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Ear to Ear?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "A Day with Nandu": {
      content: "Welcome to the lesson on A Day with Nandu! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in A Day with Nandu?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from A Day with Nandu?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "The Story of Amrita": {
      content: "Welcome to the lesson on The Story of Amrita! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in The Story of Amrita?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from The Story of Amrita?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Anita and the Honeybees": {
      content: "Welcome to the lesson on Anita and the Honeybees! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Anita and the Honeybees?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Anita and the Honeybees?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Omana's Journey": {
      content: "Welcome to the lesson on Omana's Journey! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Omana's Journey?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Omana's Journey?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "From the Window": {
      content: "Welcome to the lesson on From the Window! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in From the Window?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from From the Window?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Reaching Grandmother's House": {
      content: "Welcome to the lesson on Reaching Grandmother's House! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Reaching Grandmother's House?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Reaching Grandmother's House?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Changing Families": {
      content: "Welcome to the lesson on Changing Families! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Changing Families?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Changing Families?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Hu Tu Tu Hu Tu Tu": {
      content: "Welcome to the lesson on Hu Tu Tu Hu Tu Tu! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Hu Tu Tu Hu Tu Tu?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Hu Tu Tu Hu Tu Tu?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "The Valley of Flowers": {
      content: "Welcome to the lesson on The Valley of Flowers! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in The Valley of Flowers?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from The Valley of Flowers?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Changing Times": {
      content: "Welcome to the lesson on Changing Times! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Changing Times?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Changing Times?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "A River's Tale": {
      content: "Welcome to the lesson on A River's Tale! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in A River's Tale?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from A River's Tale?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Basva's Farm": {
      content: "Welcome to the lesson on Basva's Farm! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Basva's Farm?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Basva's Farm?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "From Market to Home": {
      content: "Welcome to the lesson on From Market to Home! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in From Market to Home?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from From Market to Home?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "A Busy Month": {
      content: "Welcome to the lesson on A Busy Month! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in A Busy Month?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from A Busy Month?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Nandita in Mumbai": {
      content: "Welcome to the lesson on Nandita in Mumbai! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Nandita in Mumbai?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Nandita in Mumbai?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Too Much Water Too Little Water": {
      content: "Welcome to the lesson on Too Much Water Too Little Water! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Too Much Water Too Little Water?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Too Much Water Too Little Water?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Abdul in the Garden": {
      content: "Welcome to the lesson on Abdul in the Garden! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Abdul in the Garden?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Abdul in the Garden?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Eating Together": {
      content: "Welcome to the lesson on Eating Together! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Eating Together?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Eating Together?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Food and Fun": {
      content: "Welcome to the lesson on Food and Fun! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Food and Fun?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Food and Fun?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "The World in my Home": {
      content: "Welcome to the lesson on The World in my Home! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in The World in my Home?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from The World in my Home?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Pochampalli": {
      content: "Welcome to the lesson on Pochampalli! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Pochampalli?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Pochampalli?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Home and Abroad": {
      content: "Welcome to the lesson on Home and Abroad! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Home and Abroad?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Home and Abroad?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Spicy Riddles": {
      content: "Welcome to the lesson on Spicy Riddles! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Spicy Riddles?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Spicy Riddles?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Defence Officer: Wahida": {
      content: "Welcome to the lesson on Defence Officer: Wahida! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Defence Officer: Wahida?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Defence Officer: Wahida?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Chuskit Goes to School": {
      content: "Welcome to the lesson on Chuskit Goes to School! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Chuskit Goes to School?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Chuskit Goes to School?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Wake Up!": {
      content: "Welcome to the lesson on Wake Up!! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Wake Up!?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Wake Up!?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Neha's Alarm Clock": {
      content: "Welcome to the lesson on Neha's Alarm Clock! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Neha's Alarm Clock?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Neha's Alarm Clock?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Noses": {
      content: "Welcome to the lesson on Noses! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Noses?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Noses?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "The Little Fir Tree": {
      content: "Welcome to the lesson on The Little Fir Tree! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in The Little Fir Tree?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from The Little Fir Tree?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Run!": {
      content: "Welcome to the lesson on Run!! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Run!?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Run!?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Nasruddin's Aim": {
      content: "Welcome to the lesson on Nasruddin's Aim! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Nasruddin's Aim?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Nasruddin's Aim?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Why?": {
      content: "Welcome to the lesson on Why?! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Why??", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Why??", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Alice in Wonderland": {
      content: "Welcome to the lesson on Alice in Wonderland! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Alice in Wonderland?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Alice in Wonderland?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Don't be Afraid of the Dark": {
      content: "Welcome to the lesson on Don't be Afraid of the Dark! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Don't be Afraid of the Dark?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Don't be Afraid of the Dark?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Helen Keller": {
      content: "Welcome to the lesson on Helen Keller! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Helen Keller?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Helen Keller?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "The Donkey": {
      content: "Welcome to the lesson on The Donkey! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in The Donkey?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from The Donkey?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "I had a Little Pony": {
      content: "Welcome to the lesson on I had a Little Pony! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in I had a Little Pony?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from I had a Little Pony?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "The Milkman's Cow": {
      content: "Welcome to the lesson on The Milkman's Cow! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in The Milkman's Cow?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from The Milkman's Cow?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Hiawatha": {
      content: "Welcome to the lesson on Hiawatha! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Hiawatha?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Hiawatha?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "The Scholar's Mother Tongue": {
      content: "Welcome to the lesson on The Scholar's Mother Tongue! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in The Scholar's Mother Tongue?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from The Scholar's Mother Tongue?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "A Watering Rhyme": {
      content: "Welcome to the lesson on A Watering Rhyme! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in A Watering Rhyme?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from A Watering Rhyme?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "The Giving Tree": {
      content: "Welcome to the lesson on The Giving Tree! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in The Giving Tree?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from The Giving Tree?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Books": {
      content: "Welcome to the lesson on Books! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Books?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Books?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Going to Buy a Book": {
      content: "Welcome to the lesson on Going to Buy a Book! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Going to Buy a Book?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Going to Buy a Book?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "The Naughty Boy": {
      content: "Welcome to the lesson on The Naughty Boy! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in The Naughty Boy?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from The Naughty Boy?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Pinocchio": {
      content: "Welcome to the lesson on Pinocchio! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Pinocchio?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Pinocchio?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "मन के भोले-भाले बादल": {
      content: "Welcome to the lesson on मन के भोले-भाले बादल! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in मन के भोले-भाले बादल?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from मन के भोले-भाले बादल?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "जैसा सवाल वैसा जवाब": {
      content: "Welcome to the lesson on जैसा सवाल वैसा जवाब! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in जैसा सवाल वैसा जवाब?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from जैसा सवाल वैसा जवाब?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "किरमिच की गेंद": {
      content: "Welcome to the lesson on किरमिच की गेंद! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in किरमिच की गेंद?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from किरमिच की गेंद?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "पापा जब बच्चे थे": {
      content: "Welcome to the lesson on पापा जब बच्चे थे! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in पापा जब बच्चे थे?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from पापा जब बच्चे थे?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "दोस्त की पोशाक": {
      content: "Welcome to the lesson on दोस्त की पोशाक! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in दोस्त की पोशाक?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from दोस्त की पोशाक?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "नाव बनाओ नाव बनाओ": {
      content: "Welcome to the lesson on नाव बनाओ नाव बनाओ! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in नाव बनाओ नाव बनाओ?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from नाव बनाओ नाव बनाओ?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "दान का हिसाब": {
      content: "Welcome to the lesson on दान का हिसाब! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in दान का हिसाब?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from दान का हिसाब?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "कौन?": {
      content: "Welcome to the lesson on कौन?! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in कौन??", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from कौन??", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "स्वतंत्रता की ओर": {
      content: "Welcome to the lesson on स्वतंत्रता की ओर! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in स्वतंत्रता की ओर?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from स्वतंत्रता की ओर?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "थप्प रोटी थप्प दाल": {
      content: "Welcome to the lesson on थप्प रोटी थप्प दाल! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in थप्प रोटी थप्प दाल?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from थप्प रोटी थप्प दाल?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "पढ़क्कू की सूझ": {
      content: "Welcome to the lesson on पढ़क्कू की सूझ! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in पढ़क्कू की सूझ?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from पढ़क्कू की सूझ?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "सुनीता की पहिया कुर्सी": {
      content: "Welcome to the lesson on सुनीता की पहिया कुर्सी! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in सुनीता की पहिया कुर्सी?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from सुनीता की पहिया कुर्सी?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "हुदहुद": {
      content: "Welcome to the lesson on हुदहुद! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in हुदहुद?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from हुदहुद?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "मुफ़्त ही मुफ़्त": {
      content: "Welcome to the lesson on मुफ़्त ही मुफ़्त! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in मुफ़्त ही मुफ़्त?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from मुफ़्त ही मुफ़्त?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "The Fish Tale": {
      content: "Welcome to the lesson on The Fish Tale! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in The Fish Tale?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from The Fish Tale?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Shapes and Angles": {
      content: "Welcome to the lesson on Shapes and Angles! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Shapes and Angles?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Shapes and Angles?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "How Many Squares?": {
      content: "Welcome to the lesson on How Many Squares?! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in How Many Squares??", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from How Many Squares??", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Parts and Wholes": {
      content: "Welcome to the lesson on Parts and Wholes! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Parts and Wholes?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Parts and Wholes?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Does it Look the Same?": {
      content: "Welcome to the lesson on Does it Look the Same?! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Does it Look the Same??", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Does it Look the Same??", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Be My Multiple I'll be Your Factor": {
      content: "Welcome to the lesson on Be My Multiple I'll be Your Factor! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Be My Multiple I'll be Your Factor?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Be My Multiple I'll be Your Factor?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Can You See the Pattern?": {
      content: "Welcome to the lesson on Can You See the Pattern?! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Can You See the Pattern??", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Can You See the Pattern??", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Mapping Your Way": {
      content: "Welcome to the lesson on Mapping Your Way! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Mapping Your Way?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Mapping Your Way?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Boxes and Sketches": {
      content: "Welcome to the lesson on Boxes and Sketches! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Boxes and Sketches?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Boxes and Sketches?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Tenths and Hundredths": {
      content: "Welcome to the lesson on Tenths and Hundredths! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Tenths and Hundredths?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Tenths and Hundredths?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Area and its Boundary": {
      content: "Welcome to the lesson on Area and its Boundary! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Area and its Boundary?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Area and its Boundary?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Ways to Multiply and Divide": {
      content: "Welcome to the lesson on Ways to Multiply and Divide! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Ways to Multiply and Divide?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Ways to Multiply and Divide?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "How Big? How Heavy?": {
      content: "Welcome to the lesson on How Big? How Heavy?! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in How Big? How Heavy??", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from How Big? How Heavy??", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Super Senses": {
      content: "Welcome to the lesson on Super Senses! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Super Senses?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Super Senses?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "A Snake Charmer's Story": {
      content: "Welcome to the lesson on A Snake Charmer's Story! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in A Snake Charmer's Story?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from A Snake Charmer's Story?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "From Tasting to Digesting": {
      content: "Welcome to the lesson on From Tasting to Digesting! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in From Tasting to Digesting?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from From Tasting to Digesting?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Mangoes Round the Year": {
      content: "Welcome to the lesson on Mangoes Round the Year! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Mangoes Round the Year?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Mangoes Round the Year?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Seeds and Seeds": {
      content: "Welcome to the lesson on Seeds and Seeds! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Seeds and Seeds?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Seeds and Seeds?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Every Drop Counts": {
      content: "Welcome to the lesson on Every Drop Counts! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Every Drop Counts?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Every Drop Counts?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Experiments with Water": {
      content: "Welcome to the lesson on Experiments with Water! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Experiments with Water?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Experiments with Water?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "A Treat for Mosquitoes": {
      content: "Welcome to the lesson on A Treat for Mosquitoes! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in A Treat for Mosquitoes?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from A Treat for Mosquitoes?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Up You Go!": {
      content: "Welcome to the lesson on Up You Go!! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Up You Go!?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Up You Go!?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Walls Tell Stories": {
      content: "Welcome to the lesson on Walls Tell Stories! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Walls Tell Stories?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Walls Tell Stories?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Sunita in Space": {
      content: "Welcome to the lesson on Sunita in Space! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Sunita in Space?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Sunita in Space?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "What if it Finishes...": {
      content: "Welcome to the lesson on What if it Finishes...! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in What if it Finishes...?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from What if it Finishes...?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "A Shelter so High!": {
      content: "Welcome to the lesson on A Shelter so High!! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in A Shelter so High!?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from A Shelter so High!?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "When the Earth Shook!": {
      content: "Welcome to the lesson on When the Earth Shook!! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in When the Earth Shook!?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from When the Earth Shook!?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Blow Hot Blow Cold": {
      content: "Welcome to the lesson on Blow Hot Blow Cold! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Blow Hot Blow Cold?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Blow Hot Blow Cold?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Who will do this Work?": {
      content: "Welcome to the lesson on Who will do this Work?! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Who will do this Work??", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Who will do this Work??", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Across the Wall": {
      content: "Welcome to the lesson on Across the Wall! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Across the Wall?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Across the Wall?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "No Place for Us?": {
      content: "Welcome to the lesson on No Place for Us?! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in No Place for Us??", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from No Place for Us??", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "A Seed tells a Farmer's Story": {
      content: "Welcome to the lesson on A Seed tells a Farmer's Story! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in A Seed tells a Farmer's Story?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from A Seed tells a Farmer's Story?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Whose Forests?": {
      content: "Welcome to the lesson on Whose Forests?! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Whose Forests??", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Whose Forests??", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Like Father Like Daughter": {
      content: "Welcome to the lesson on Like Father Like Daughter! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Like Father Like Daughter?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Like Father Like Daughter?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "On the Move Again": {
      content: "Welcome to the lesson on On the Move Again! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in On the Move Again?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from On the Move Again?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Ice-cream Man": {
      content: "Welcome to the lesson on Ice-cream Man! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Ice-cream Man?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Ice-cream Man?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Wonderful Waste!": {
      content: "Welcome to the lesson on Wonderful Waste!! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Wonderful Waste!?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Wonderful Waste!?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Teamwork": {
      content: "Welcome to the lesson on Teamwork! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Teamwork?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Teamwork?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Flying Together": {
      content: "Welcome to the lesson on Flying Together! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Flying Together?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Flying Together?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "My Shadow": {
      content: "Welcome to the lesson on My Shadow! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in My Shadow?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from My Shadow?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Robinson Crusoe Discovers a footprint": {
      content: "Welcome to the lesson on Robinson Crusoe Discovers a footprint! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Robinson Crusoe Discovers a footprint?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Robinson Crusoe Discovers a footprint?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Crying": {
      content: "Welcome to the lesson on Crying! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Crying?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Crying?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "My Elder Brother": {
      content: "Welcome to the lesson on My Elder Brother! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in My Elder Brother?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from My Elder Brother?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "The Lazy Frog": {
      content: "Welcome to the lesson on The Lazy Frog! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in The Lazy Frog?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from The Lazy Frog?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Rip Van Winkle": {
      content: "Welcome to the lesson on Rip Van Winkle! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Rip Van Winkle?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Rip Van Winkle?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Class Discussion": {
      content: "Welcome to the lesson on Class Discussion! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Class Discussion?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Class Discussion?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "The Talkative Barber": {
      content: "Welcome to the lesson on The Talkative Barber! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in The Talkative Barber?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from The Talkative Barber?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Topsy-turvy Land": {
      content: "Welcome to the lesson on Topsy-turvy Land! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Topsy-turvy Land?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Topsy-turvy Land?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Gulliver's Travels": {
      content: "Welcome to the lesson on Gulliver's Travels! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Gulliver's Travels?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Gulliver's Travels?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Nobody's Friend": {
      content: "Welcome to the lesson on Nobody's Friend! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Nobody's Friend?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Nobody's Friend?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "The Little Bully": {
      content: "Welcome to the lesson on The Little Bully! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in The Little Bully?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from The Little Bully?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Sing a Song of People": {
      content: "Welcome to the lesson on Sing a Song of People! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Sing a Song of People?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Sing a Song of People?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Around the World": {
      content: "Welcome to the lesson on Around the World! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Around the World?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Around the World?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Malu Bhalu": {
      content: "Welcome to the lesson on Malu Bhalu! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Malu Bhalu?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Malu Bhalu?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Who Will be Ningthou?": {
      content: "Welcome to the lesson on Who Will be Ningthou?! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Who Will be Ningthou??", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Who Will be Ningthou??", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "राख की रस्सी": {
      content: "Welcome to the lesson on राख की रस्सी! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in राख की रस्सी?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from राख की रस्सी?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "फ़सलों के त्योहार": {
      content: "Welcome to the lesson on फ़सलों के त्योहार! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in फ़सलों के त्योहार?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from फ़सलों के त्योहार?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "खिलौनेवाला": {
      content: "Welcome to the lesson on खिलौनेवाला! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in खिलौनेवाला?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from खिलौनेवाला?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "नन्हा फ़नकार": {
      content: "Welcome to the lesson on नन्हा फ़नकार! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in नन्हा फ़नकार?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from नन्हा फ़नकार?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "जहाँ चाह वहाँ राह": {
      content: "Welcome to the lesson on जहाँ चाह वहाँ राह! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in जहाँ चाह वहाँ राह?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from जहाँ चाह वहाँ राह?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "चिट्ठी का सफ़र": {
      content: "Welcome to the lesson on चिट्ठी का सफ़र! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in चिट्ठी का सफ़र?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from चिट्ठी का सफ़र?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "डाकिए की कहानी कंवरसिंह की जुबानी": {
      content: "Welcome to the lesson on डाकिए की कहानी कंवरसिंह की जुबानी! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in डाकिए की कहानी कंवरसिंह की जुबानी?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from डाकिए की कहानी कंवरसिंह की जुबानी?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "वे दिन भी क्या दिन थे": {
      content: "Welcome to the lesson on वे दिन भी क्या दिन थे! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in वे दिन भी क्या दिन थे?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from वे दिन भी क्या दिन थे?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "एक माँ की बेबसी": {
      content: "Welcome to the lesson on एक माँ की बेबसी! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in एक माँ की बेबसी?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from एक माँ की बेबसी?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "एक दिन की बादशाहत": {
      content: "Welcome to the lesson on एक दिन की बादशाहत! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in एक दिन की बादशाहत?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from एक दिन की बादशाहत?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "चावल की रोटियाँ": {
      content: "Welcome to the lesson on चावल की रोटियाँ! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in चावल की रोटियाँ?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from चावल की रोटियाँ?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "गुरु और चेला": {
      content: "Welcome to the lesson on गुरु और चेला! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in गुरु और चेला?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from गुरु और चेला?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "स्वामी की दादी": {
      content: "Welcome to the lesson on स्वामी की दादी! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in स्वामी की दादी?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from स्वामी की दादी?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "बाघ आया उस रात": {
      content: "Welcome to the lesson on बाघ आया उस रात! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in बाघ आया उस रात?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from बाघ आया उस रात?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "बिशन की दिलेरी": {
      content: "Welcome to the lesson on बिशन की दिलेरी! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in बिशन की दिलेरी?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from बिशन की दिलेरी?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "पानी रे पानी": {
      content: "Welcome to the lesson on पानी रे पानी! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in पानी रे पानी?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from पानी रे पानी?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "छोटी-सी हमारी नदी": {
      content: "Welcome to the lesson on छोटी-सी हमारी नदी! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in छोटी-सी हमारी नदी?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from छोटी-सी हमारी नदी?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "चुनौती हिमालय की": {
      content: "Welcome to the lesson on चुनौती हिमालय की! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in चुनौती हिमालय की?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from चुनौती हिमालय की?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },

    "Two Little Hands": {
      content: "<h3><strong>Major Extension: Discovering My Body</strong></h3>\
<p>Our body is a wonderful gift. We have two hands to work and play, two feet to walk and run, and a face that shows how we feel. In this chapter, we learn that every part of our body has a special job to do. We must take care of our body and keep it clean. When we clap our hands, we are using our muscles and bones to make a happy sound! When we blink our eyes, we are protecting them and keeping them moist. Everything our body does is important.</p>\
<h3><strong>Grammar focus:</strong></h3>\
<ul>\
<li><strong>Naming words:</strong> hand, eye, leg, face, body, fingers, toes, elbows</li>\
<li><strong>Action words:</strong> clap, blink, walk, run, smile, stamp, wave</li>\
<li><strong>Simple sentence:</strong> I can clap with my two little hands.</li>\
<li><strong>Plurals:</strong> Hand becomes hands, Eye becomes eyes.</li>\
</ul>",
      quiz: [
        { "question": "Name a body part used for seeing.", "options": ["Hands", "Feet", "Eyes", "Nose"], "answer": "Eyes" },
        { "question": "What action can we do with our hands?", "options": ["Walk", "Clap", "Blink", "Smile"], "answer": "Clap" },
        { "question": "How many hands do we have?", "options": ["One", "Two", "Three", "Four"], "answer": "Two" },
        { "question": "We use our ___ to walk.", "options": ["Ears", "Eyes", "Feet", "Nose"], "answer": "Feet" },
        { "question": "Which action word means closing and opening eyes quickly?", "options": ["Smile", "Blink", "Run", "Clap"], "answer": "Blink" },
        { "question": "We use our nose to ___.", "options": ["See", "Smell", "Hear", "Clap"], "answer": "Smell" },
        { "question": "Which of these is a naming word?", "options": ["Run", "Finger", "Jump", "Loud"], "answer": "Finger" },
        { "question": "I have ___ toes on each foot.", "options": ["Two", "Five", "Ten", "Zero"], "answer": "Five" }
      ],
      lessons: [
        { title: "My Two Hands", explanation: "We have two hands that help us do many things. We can clap, hold toys, and wave hello! Our hands have fingers and a palm. We use them to write our name, draw pictures, and eat our food. Hands are our primary tools for interacting with the world. Without hands, it would be hard to hold a spoon or a pencil. Let's appreciate our wonderful hands!", words: ["Hands", "Clap", "Hold", "Wave", "Fingers", "Palm", "Tools"], activities: "Hold a pencil and try to write your name. Feel how your fingers move!" },
        { title: "My Two Feet", explanation: "We have two feet that help us move. We can walk, run, and jump around the room. Our feet carry us everywhere! Each foot has five small toes. When we wear shoes, we protect our feet from sharp things and dirt. Feet allow us to dance, play football, and climb stairs. They are strong and help us balance our whole body when we stand up straight.", words: ["Feet", "Walk", "Run", "Jump", "Toes", "Step", "Balance"], activities: "Stand on one foot for 10 seconds. Notice how your foot works hard to keep you balanced!" },
        { title: "Seeing & Smiling", explanation: "Our eyes help us see the beautiful world around us. We can see colors, shapes, and the faces of our friends. Our face helps us show happiness with a big smile. When we are happy, our mouth curves up! We also have a nose to smell flowers and ears to hear music. All these parts together make our face special and unique.", words: ["Eyes", "See", "Face", "Smile", "Blink", "Happy", "Unique"], activities: "Look in the mirror and smile as big as you can. Point to your eyes and ears." },
        { title: "Action Words Deep-Dive", explanation: "Action words (verbs) tell us what our body is doing. Let's practice many actions! We can clap (hands), blink (eyes), walk (legs), stamp (feet), wave (arms), and wiggle (fingers). Each body part has its own set of favorite actions. When we learn these words, we can describe exactly what we are doing throughout the day. Math and English come together when we count how many times we clap!", words: ["Clap", "Blink", "Walk", "Move", "Run", "Jump", "Stamp", "Wiggle"], activities: "Do 5 claps, 5 jumps, and 5 blinks. Count them out loud while you do it!" },
        { title: "Keeping Clean & Healthy", explanation: "It is important to keep our body parts clean. We wash our hands before eating and after playing. We keep our skin healthy and neat by taking a bath every day. Cleaning our teeth makes them strong. When we take care of our body, we don't get sick often. A clean body is a happy body! Hygiene is the first step to a long and healthy life.", words: ["Wash", "Clean", "Healthy", "Body", "Soap", "Water", "Neat", "Hygiene"], activities: "Practice washing your hands with soap. Make sure to clean between your fingers too!" },
        { title: "Review: The Human Machine", explanation: "In this chapter, we learned that our body is like a wonderful machine with many parts. Each part has a name and a job. We learned naming words like 'hand' and action words like 'clap'. By keeping our body clean and using it for good things, we stay happy and strong. You are now a master of your own body parts!", words: ["Review", "Parts", "Actions", "Fun", "Body", "Health", "Care", "Machine"], activities: "Name 5 body parts and one action for each part (e.g., Eyes - Seeing)." }
      ]
    },
    "Greetings": {
      content: "<h3><strong>Main focus: Polite language and speaking to others</strong></h3>\
<p><strong>Detailed explanation:</strong> This chapter teaches children how to greet people politely. A greeting is the first kind word we say when we meet someone. Children learn words like good morning, good afternoon, and good night. They also learn that a smile and polite behaviour make people feel happy. The lesson builds good habits, because speaking politely is an important part of daily life. Children can use these words at school, at home, and with friends.</p>\
<h3><strong>Grammar focus:</strong></h3>\
<ul>\
<li><strong>Polite words:</strong> hello, good morning, thank you, please</li>\
<li>Capital letters at the beginning of sentences</li>\
<li>Use of full stops at the end of simple sentences</li>\
<li>Talking to one person politely</li>\
</ul>\
<h3><strong>Activities:</strong></h3>\
<ul>\
<li>Role-play meeting a teacher, friend, or elder.</li>\
<li>Say different greetings at different times of day.</li>\
<li>Make greeting cards for family members.</li>\
</ul>",
      quiz: [{ "question": "What do you say in the morning?", "options": ["Good night", "Good afternoon", "Good morning", "Goodbye"], "answer": "Good morning" }, { "question": "Which of the following is a polite word?", "options": ["Run", "Please", "Jump", "Loud"], "answer": "Please" }],
      lessons: [
        { title: "Morning Greetings", explanation: "When we wake up and see our parents or teachers, we say 'Good Morning' with a big smile!", words: ["Good", "Morning", "Smile", "Wake up"] },
        { title: "Afternoon & Night", explanation: "As the day changes, our greetings change too. We say 'Good Afternoon', 'Good Evening', and 'Good Night' before sleep.", words: ["Afternoon", "Evening", "Night", "Sleep"] },
        { title: "Polite Words", explanation: "Being polite makes everyone happy. We say 'Please' when we want something and 'Thank You' when we get it.", words: ["Please", "Thank you", "Happy", "Polite"] },
        { title: "Sorry & Excuse Me", explanation: "If we make a mistake, we say 'Sorry'. If we want to pass or talk, we say 'Excuse Me'.", words: ["Sorry", "Mistake", "Excuse me", "Manners"] },
        { title: "Meeting Friends", explanation: "When we meet a friend, we say 'Hello' or 'Hi'. It is a friendly way to start a talk.", words: ["Hello", "Hi", "Friend", "Talk"] },
        { title: "Review: Manners", explanation: "Manners are important! Using kind words shows that we are good children.", words: ["Manners", "Kind", "Words", "Respect"] }
      ]
    },

    "My Body and Sense Organs": {
      content: "<h3><strong>Major Extension: Our Five Windows to the World</strong></h3>\
<p>Sense organs are the parts of our body that help us know what is happening around us. We have five main sense organs: <strong>Eyes, Ears, Nose, Tongue, and Skin</strong>. They are like windows that let information into our brain. Without our senses, we wouldn't know if a flower smells sweet or if a bell is ringing. Learning about sense organs helps us understand how we interact with the world.</p>\
<h3><strong>The Five Senses:</strong></h3>\
<ul>\
<li><strong>Sight (Eyes):</strong> To see colors, shapes, and distance.</li>\
<li><strong>Hearing (Ears):</strong> To hear loud and soft sounds.</li>\
<li><strong>Smell (Nose):</strong> To smell perfumes or smoke.</li>\
<li><strong>Taste (Tongue):</strong> To taste sweet, sour, salty, and bitter.</li>\
<li><strong>Touch (Skin):</strong> To feel hot, cold, soft, or hard things.</li>\
</ul>",
      quiz: [
        { "question": "Which sense organ helps us taste food?", "options": ["Nose", "Tongue", "Skin", "Eyes"], "answer": "Tongue" },
        { "question": "We use our ears to ___.", "options": ["See", "Hear", "Smell", "Taste"], "answer": "Hear" },
        { "question": "How many sense organs do we have?", "options": ["Three", "Four", "Five", "Six"], "answer": "Five" },
        { "question": "Our skin helps us to ___.", "options": ["See", "Feel/Touch", "Hear", "Smell"], "answer": "Feel/Touch" },
        { "question": "Which organ helps us see the stars?", "options": ["Nose", "Eyes", "Tongue", "Ears"], "answer": "Eyes" },
        { "question": "If something is 'soft', which sense tells us that?", "options": ["Hearing", "Taste", "Sight", "Touch"], "answer": "Touch" },
        { "question": "A rose has a nice smell. We know this using our ___.", "options": ["Nose", "Tongue", "Ears", "Eyes"], "answer": "Nose" },
        { "question": "Which of these is NOT a sense organ?", "options": ["Eyes", "Heart", "Nose", "Skin"], "answer": "Heart" }
      ],
      lessons: [
        { title: "The Power of Sight", explanation: "Our eyes are amazing! They take pictures of everything and send them to our brain. We can see the blue sky, green grass, and our parents' faces. Eyes help us read books and watch movies. We should always protect our eyes from bright sun and not look at screens for too long. Sight is often considered our most important sense because it helps us move around safely.", words: ["Sight", "Eyes", "Vision", "Color", "Shape", "Protect"], activities: "Close your eyes for a moment. Try to describe what you saw just before you closed them." },
        { title: "Hearing the World", explanation: "Our ears are always listening! They hear the chirping of birds, the music on the radio, and the voice of our teacher. Ears can hear loud sounds like a drum and soft sounds like a whisper. They also help us keep our balance so we don't fall down. We should never put sharp objects in our ears and avoid very loud noises that can hurt them.", words: ["Hearing", "Ears", "Sound", "Listen", "Loud", "Soft", "Music"], activities: "Sit quietly for 1 minute. Count how many different sounds you can hear." },
        { title: "Smelling & Tasting", explanation: "Our nose and tongue work together! The nose helps us smell yummy food, flowers, and even warns us about smoke. The tongue is covered in tiny 'taste buds' that tell us if something is sweet (like sugar), salty (like chips), sour (like lemon), or bitter. Most of the flavor of food actually comes from its smell! That's why food tastes different when you have a cold.", words: ["Smell", "Nose", "Taste", "Tongue", "Sweet", "Sour", "Salty", "Bitter"], activities: "Identify one food that is sweet and one that is sour." },
        { title: "The Sense of Touch", explanation: "Our whole body is covered in skin, and skin is our organ for touch. It helps us feel if something is hot or cold, rough or smooth, soft or hard. Touch is very important for safety—it tells us to pull our hand away if something is too hot. Skin also protects our inside parts from germs and keeps our body at the right temperature. It is the largest organ of our body!", words: ["Touch", "Skin", "Feel", "Soft", "Hard", "Hot", "Cold", "Texture"], activities: "Touch three different things in your room (like a pillow, a table, and a wall). How do they feel?" },
        { title: "Caring for our Senses", explanation: "Since our sense organs are so important, we must take good care of them. We should wash our eyes with clean water, not listen to music too loudly, clean our tongue while brushing, and keep our skin clean by bathing. When one sense doesn't work well (like needing glasses for sight), the other senses often become stronger. We should appreciate all five of our 'windows'!", words: ["Care", "Hygiene", "Protection", "Appreciate", "Healthy", "Senses"], activities: "Make a list of one way to care for each of your five sense organs." },
        { title: "Review: Sense Explorer", explanation: "Congratulations! You are now a Sense Explorer. You know about the five sense organs and how they help you experience the world. You can identify which organ is used for which task. Remember, your senses are always working to keep you safe and help you learn. Use them well every day to discover new things!", words: ["Explorer", "Experience", "Identify", "Discover", "Summary", "Senses"], activities: "Play a game with a friend where you describe an object using only your senses (e.g., 'It feels soft, it smells like vanilla'). See if they can guess it!" }
      ]
    },

    "My Family and Home": {
      content: "<h3><strong>Major Extension: Love and Shelter</strong></h3>\
<p>A family is a group of people who live together and love each other. A home is the place where a family lives. It protects us from heat, cold, rain, and wild animals. Every family is different—some are big and some are small—but the love is the same. In this chapter, we learn about different family members and the different rooms in our house. We also learn that helping each other makes a house a happy home.</p>\
<h3><strong>Key Concepts:</strong></h3>\
<ul>\
<li><strong>Nuclear Family:</strong> Small family with parents and children.</li>\
<li><strong>Joint Family:</strong> Big family with grandparents, uncles, aunts, and cousins.</li>\
<li><strong>Rooms in a Home:</strong> Kitchen, Bedroom, Bathroom, Living room.</li>\
<li><strong>Responsibilities:</strong> Helping parents and keeping the house clean.</li>\
</ul>",
      quiz: [
        { "question": "A small family is also called a ___ family.", "options": ["Joint", "Nuclear", "Big", "Friendly"], "answer": "Nuclear" },
        { "question": "Where do we cook our food?", "options": ["Bedroom", "Bathroom", "Kitchen", "Garden"], "answer": "Kitchen" },
        { "question": "Who are the parents of our parents?", "options": ["Uncles", "Aunts", "Grandparents", "Cousins"], "answer": "Grandparents" },
        { "question": "A house protects us from ___.", "options": ["Love", "Rain and Heat", "Books", "Toys"], "answer": "Rain and Heat" },
        { "question": "We sleep in the ___.", "options": ["Kitchen", "Dining room", "Bedroom", "Bathroom"], "answer": "Bedroom" },
        { "question": "What makes a house a 'Home'?", "options": ["Bricks", "Love and Care", "Paint", "Furniture"], "answer": "Love and Care" },
        { "question": "The children of our uncles and aunts are our ___.", "options": ["Brothers", "Sisters", "Cousins", "Friends"], "answer": "Cousins" },
        { "question": "We should help our parents to keep the house ___.", "options": ["Dirty", "Clean", "Loud", "Empty"], "answer": "Clean" }
      ],
      lessons: [
        { title: "Types of Families", explanation: "Families come in all shapes and sizes! A small family with just a father, mother, and one or two children is a 'Nuclear Family'. A big family where grandparents, uncles, aunts, and cousins live together is a 'Joint Family'. No matter the size, every member of the family is important. Family is the first place where we learn to share and care for others.", words: ["Family", "Nuclear", "Joint", "Member", "Share", "Care", "Size"], activities: "Draw your family tree. Include everyone who lives with you!" },
        { title: "Our Special Home", explanation: "A house is made of bricks, wood, or stone, but a home is made of love. Our home is our safe place. It keeps us dry when it rains and cool when the sun is hot. Inside our home, we feel safe and comfortable. We have different areas for different activities. We should always respect our home and the people who live in it.", words: ["House", "Home", "Shelter", "Safe", "Comfort", "Respect", "Bricks"], activities: "What is your favorite corner in your house? Why do you like it?" },
        { title: "Rooms in a House", explanation: "Most homes have different rooms for different jobs. We cook in the Kitchen, eat in the Dining Room, and sleep in the Bedroom. We wash ourselves in the Bathroom and talk to guests in the Living Room. Each room should be kept tidy. When we know the names of the rooms, we can talk about where things are kept in our house.", words: ["Kitchen", "Bedroom", "Bathroom", "Living Room", "Tidy", "Area"], activities: "Go to each room in your house and name it out loud. Find one object that belongs only in that room." },
        { title: "Helping at Home", explanation: "A happy home is one where everyone helps! Even small children can do big things, like putting toys away, watering plants, or helping set the table. When we help our parents, they feel happy and less tired. It also teaches us to be responsible. Taking care of our own things is the best way to start helping the family.", words: ["Help", "Responsible", "Tired", "Watering", "Table", "Small", "Big"], activities: "Choose one small job to help your mother or father with today (like folding your clothes)." },
        { title: "Family Values", explanation: "Families teach us how to be good people. We learn to say 'Please' and 'Thank You', to respect our elders, and to be kind to our siblings. These are called values. Good values help us make friends and do well at school. A family that eats together and plays together stays happy and strong forever.", words: ["Values", "Respect", "Kindness", "Manners", "Siblings", "Elders", "Strong"], activities: "Tell your parents one thing you love about your family." },
        { title: "Review: Family & Shelter", explanation: "We have learned that families provide us with love and homes provide us with shelter. Whether our family is big or small, and whether our house is large or tiny, what matters most is the kindness we show to each other. Keeping our home clean and our family members happy is a great way to grow up. You are a valued member of your family!", words: ["Review", "Love", "Shelter", "Kindness", "Valued", "Grow up", "Summary"], activities: "Draw a picture of your house and color it. Write 'Home Sweet Home' at the top." }
      ]
    },
    "Picture Time": {
      content: "<h3><strong>Main focus: Observation, speaking, naming pictures</strong></h3>\
<p><strong>Detailed explanation:</strong> This chapter uses pictures to help children think and speak. Pictures are very helpful for young learners because they can see and understand quickly. Children learn to look carefully, notice small details, and say what they see. They may talk about people, animals, things, and actions in the pictures. This builds both vocabulary and speaking confidence. It also trains the child to observe before answering, which is an important learning skill.</p>\
<h3><strong>Grammar focus:</strong></h3>\
<ul>\
<li><strong>Naming words from pictures:</strong> dog, tree, ball, child</li>\
<li>Use of 'a' and 'an' before singular nouns</li>\
<li>Simple describing words: big, small, happy, red</li>\
<li>Speaking in complete sentences</li>\
</ul>\
<h3><strong>Activities:</strong></h3>\
<ul>\
<li>Look at a picture and say five things you can see.</li>\
<li>Color a picture and name the objects in it.</li>\
<li>Match words with picture cards.</li>\
</ul>",
      quiz: [{ "question": "Which article is used before a singular noun starting with a consonant sound?", "options": ["An", "A", "The", "Some"], "answer": "A" }, { "question": "Which of these is a describing word?", "options": ["Tree", "Big", "Dog", "Child"], "answer": "Big" }],
      topics: ["Object Identification", "Using A and An", "Describing Objects"]
    },
    "The Cap-seller and the Monkeys": {
      content: "<h3><strong>Main focus: Story, problem solving, listening</strong></h3>\
<p><strong>Detailed explanation:</strong> This story is about a cap-seller who carries caps on his head and walks through a forest. The monkeys watch him and take the caps when he sleeps. The cap-seller becomes worried, but he uses his thinking power to solve the problem. He shows the monkeys that copying him will not help them. The story is interesting because it teaches children that calm thinking is better than panic. It also shows that smart ideas can solve difficult situations.</p>\
<h3><strong>Grammar focus:</strong></h3>\
<ul>\
<li><strong>Story words:</strong> cap-seller, monkeys, forest, sleep</li>\
<li><strong>Action words:</strong> carry, take, throw, sleep</li>\
<li>Use of past action in simple storytelling</li>\
<li>Naming people and animals</li>\
</ul>\
<h3><strong>Activities:</strong></h3>\
<ul>\
<li>Act out the story in class or at home.</li>\
<li>Draw the cap-seller and the monkeys.</li>\
<li>Talk about a time when you solved a small problem.</li>\
</ul>",
      quiz: [{ "question": "Who took the caps from the cap-seller?", "options": ["Birds", "Lions", "Monkeys", "Children"], "answer": "Monkeys" }, { "question": "What did the cap-seller use to solve his problem?", "options": ["Panic", "Thinking power", "Running away", "Shouting"], "answer": "Thinking power" }],
      topics: ["Story Listening", "Problem Solving", "Action Words"]
    },
    "A Farm": {
      content: "<h3><strong>Main focus: Farm life, animals, food, places</strong></h3>\
<p><strong>Detailed explanation:</strong> This chapter takes children to a farm, which is a place where crops are grown and animals live. Children learn that farms give us food like vegetables, grains, milk, and eggs. They also see that farmers work very hard to grow food for everyone. The chapter helps children understand the connection between nature, food, and the people who grow it. It is useful because it builds respect for farmers and for the food on our plate. Children can relate this to their own meals and the world around them.</p>\
<h3><strong>Grammar focus:</strong></h3>\
<ul>\
<li><strong>Naming words:</strong> farm, farmer, cow, goat, crop</li>\
<li><strong>Plural forms:</strong> cow/cows, crop/crops</li>\
<li><strong>Describing words:</strong> green field, big farm</li>\
<li><strong>Sentence:</strong> The farmer grows crops.</li>\
</ul>\
<h3><strong>Activities:</strong></h3>\
<ul>\
<li>Draw a farm scene with animals and crops.</li>\
<li>Name foods that come from farms.</li>\
<li>Sort food into plant food and animal food.</li>\
</ul>",
      quiz: [{ "question": "Who works on a farm to grow food?", "options": ["Teacher", "Farmer", "Doctor", "Pilot"], "answer": "Farmer" }, { "question": "Which of these is the plural form of cow?", "options": ["Cow", "Cowes", "Cows", "Cowen"], "answer": "Cows" }],
      topics: ["Farm Animals", "Crops and Food", "Singular and Plural"]
    },
    "Fun with Pictures": {
      content: "<h3><strong>Main focus: Vocabulary building through visual learning</strong></h3>\
<p><strong>Detailed explanation:</strong> This chapter helps children learn through pictures, which makes reading easier and more enjoyable. Young learners often understand better when they can see objects and actions before reading the words. The chapter may include animals, toys, fruits, or daily life objects. Children learn to connect each picture with its name and meaning. This helps them remember words for a longer time. It also prepares them to read independently because they begin to recognize patterns in what they see.</p>\
<h3><strong>Grammar focus:</strong></h3>\
<ul>\
<li>Naming words from visual objects</li>\
<li>Singular and plural recognition</li>\
<li>Word-picture association</li>\
<li>Basic sentence building</li>\
</ul>\
<h3><strong>Activities:</strong></h3>\
<ul>\
<li>Make flashcards with pictures and words.</li>\
<li>Tell a story from a set of pictures.</li>\
<li>Point to objects and say their names.</li>\
</ul>",
      quiz: [{ "question": "What does visual learning involve?", "options": ["Reading text only", "Learning through pictures", "Listening to a song", "Writing numbers"], "answer": "Learning through pictures" }, { "question": "What does word-picture association help with?", "options": ["Forgetting words", "Remembering words longer", "Drawing faster", "Running faster"], "answer": "Remembering words longer" }],
      topics: ["Visual Vocabulary", "Word Association", "Simple Sentences"]
    },
    "The Food We Eat": {
      content: "<h3><strong>Main focus: Food, health, and daily habits</strong></h3>\
<p><strong>Detailed explanation:</strong> This chapter teaches children about the food we eat every day. It shows that food gives us energy, helps us grow, and keeps us healthy. Children can learn to name fruits, vegetables, grains, milk, and other simple foods. The chapter also helps them understand that clean and healthy food is better for the body. It may also encourage children to eat a variety of foods rather than only one kind. This makes the chapter important for both language learning and health awareness.</p>\
<h3><strong>Grammar focus:</strong></h3>\
<ul>\
<li><strong>Food names:</strong> apple, rice, milk, banana, chapati</li>\
<li>Singular and plural food words</li>\
<li><strong>Describing words:</strong> tasty, fresh, hot, sweet</li>\
<li><strong>Sentence:</strong> I eat an apple.</li>\
</ul>\
<h3><strong>Activities:</strong></h3>\
<ul>\
<li>Make a healthy food chart.</li>\
<li>Sort foods into fruits, vegetables, and grains.</li>\
<li>Talk about your favorite healthy breakfast.</li>\
</ul>",
      quiz: [{ "question": "Why do we eat food?", "options": ["To stay hungry", "To get energy and grow", "To sleep all day", "To fly"], "answer": "To get energy and grow" }, { "question": "Which is a describing word for food?", "options": ["Chair", "Tasty", "Run", "Milk"], "answer": "Tasty" }],
      topics: ["Food Names", "Healthy Habits", "Describing Food"]
    },
    "The Four Seasons": {
      content: "<h3><strong>Main focus: Nature, weather, seasonal change</strong></h3>\
<p><strong>Detailed explanation:</strong> This chapter introduces children to the idea that weather changes during the year. Some days are hot, some are cold, some bring rain, and some feel pleasant. Children learn that different seasons need different clothes, food, and habits. This is a useful chapter because it connects English with real life. Children can understand that nature changes in a cycle and that we should observe the sky and weather. The lesson also builds vocabulary related to rain, sun, wind, and cold.</p\
<h3><strong>Grammar focus:</strong></h3>\
<ul>\
<li><strong>Season words:</strong> summer, winter, rainy, spring</li>\
<li><strong>Weather words:</strong> hot, cold, windy, sunny</li>\
<li>Use of 'is' and 'are' in simple sentences</li>\
<li>Describing the weather</li>\
</ul>\
<h3><strong>Activities:</strong></h3>\
<ul>\
<li>Make a seasons wheel with drawings.</li>\
<li>Say what clothes we wear in each season.</li>\
<li>Draw a rainy day and a sunny day.</li>\
</ul>",
      quiz: [{ "question": "Which of the following is a season word?", "options": ["Sun", "Cold", "Summer", "Wind"], "answer": "Summer" }, { "question": "What kind of clothes do we wear in winter?", "options": ["Cotton clothes", "Raincoats", "Warm clothes", "Swimsuits"], "answer": "Warm clothes" }],
      topics: ["Summer and Winter", "Rainy Season", "Weather Words"]
    },
    "Anandi’s Rainbow": {
      content: "<h3><strong>Main focus: Colours, beauty of nature, observation</strong></h3>\
<p><strong>Detailed explanation:</strong> This chapter shows the beauty of a rainbow in the sky. A rainbow appears when sunlight and rain come together in the right way. Children enjoy learning the names of colours because colours are easy to see and remember. The story encourages children to look at nature carefully and feel happy about it. It also builds curiosity because children often ask when and why a rainbow appears. This makes science, language, and imagination come together in one lovely chapter.</p>\
<h3><strong>Grammar focus:</strong></h3>\
<ul>\
<li><strong>Colour words:</strong> red, blue, green, yellow, orange</li>\
<li><strong>Describing words:</strong> bright, beautiful, colourful</li>\
<li><strong>Simple sentence:</strong> The rainbow is colourful.</li>\
<li>Using 'looks' and 'is' in short sentences</li>\
</ul>\
<h3><strong>Activities:</strong></h3>\
<ul>\
<li>Draw and colour a rainbow.</li>\
<li>Name colours around you in the room.</li>\
<li>Make a colour matching game.</li>\
</ul>",
      quiz: [{ "question": "When does a rainbow appear?", "options": ["At night", "When sunlight and rain come together", "When it snows", "When it is very hot and dry"], "answer": "When sunlight and rain come together" }, { "question": "Which is a describing word for a rainbow?", "options": ["Boring", "Colourful", "Small", "Invisible"], "answer": "Colourful" }],
      topics: ["Colours", "Nature Observation", "Rainbow Formation"]
    },

    "My Family and Me": {
      content: `
<h3><strong>What this chapter is about</strong></h3>
<p>This chapter begins Class 1 English with the child’s own world: the body, simple actions, cleanliness, and the people around them. It helps children learn the names of body parts and understand why each part is useful. It also introduces the idea that we should keep ourselves clean and healthy. The lesson is designed in a very gentle way so children can learn by seeing, saying, doing, and repeating. The chapter also builds confidence because children talk about themselves, their family, and the things they do every day. NCERT’s Class 1 English introduction shows that the book is built around familiar themes like family, body parts, politeness, animals, and plants, so children connect language to real life.</p>

<h3><strong>Detailed explanation</strong></h3>
<p>A small child learns first from the things closest to them. This chapter uses that idea very well. Children look at their own hands, eyes, legs, nose, mouth, ears, and other body parts. They slowly understand that each part has a job. Hands help us hold, clap, write, and eat. Eyes help us see. Ears help us hear. Legs help us walk and run. Nose helps us smell. Mouth helps us speak and eat. The chapter also teaches that body parts should be kept clean and cared for, because cleanliness is part of good health. This makes the lesson useful in daily life, not just in the classroom.</p>
<p>The chapter is also important because it connects language with movement. When a child says “clap,” they can clap. When they say “blink,” they can blink. When they say “walk,” they can walk. This is how young children learn better: by doing the action while saying the word.</p>
<p>Another important idea in this chapter is self-awareness. Children begin to notice that their body is special and valuable. They understand that they should wash hands, brush teeth, bathe, comb hair, and keep their nails clean.</p>

<h3><strong>Word meanings</strong></h3>
<p><strong>Body parts</strong></p>
<ul>
<li><strong>hand</strong> — part of the body used for holding and doing work</li>
<li><strong>eye</strong> — part of the body used for seeing</li>
<li><strong>ear</strong> — part of the body used for hearing</li>
<li><strong>nose</strong> — part of the body used for smelling</li>
<li><strong>mouth</strong> — part of the body used for eating and speaking</li>
<li><strong>leg</strong> — part of the body used for walking and running</li>
</ul>

<p><strong>Action words</strong></p>
<ul>
<li><strong>clap</strong> — to strike hands together</li>
<li><strong>blink</strong> — to close and open eyes quickly</li>
<li><strong>walk</strong> — to move on feet</li>
<li><strong>run</strong> — to move fast on feet</li>
<li><strong>smile</strong> — to show happiness on the face</li>
</ul>

<p><strong>Cleanliness words</strong></p>
<ul>
<li><strong>clean</strong> — free from dirt</li>
<li><strong>wash</strong> — to remove dirt using water</li>
<li><strong>healthy</strong> — strong and well</li>
<li><strong>neat</strong> — tidy and well kept</li>
</ul>

<h3><strong>Grammar for kids</strong></h3>
<p><strong>1. Naming words</strong><br/>
These are words that name people, places, animals, or things.<br/>
Examples: hand, eye, leg, child, family</p>

<p><strong>2. Action words</strong><br/>
These are words that show what we do.<br/>
Examples: clap, run, walk, blink, smile</p>

<p><strong>3. Describing words</strong><br/>
These tell us more about a noun.<br/>
Examples: clean hands, big eyes, little child, healthy body</p>

<p><strong>4. Simple sentence pattern</strong><br/>
I + action word + body part<br/>
Examples: I clap my hands. I blink my eyes.</p>

<p><strong>5. “This is” and “These are”</strong><br/>
This is my hand. This is my nose. These are my eyes. These are my legs.</p>

<h3><strong>Subtopics in this chapter</strong></h3>
<ul>
<li>body parts</li>
<li>actions of body parts</li>
<li>cleanliness and hygiene</li>
<li>speaking about self</li>
<li>simple sentence building</li>
<li>observation and identification</li>
</ul>

<h3><strong>Step-by-step understanding</strong></h3>
<ol>
<li>First, children look at a picture or their own body and identify parts one by one.</li>
<li>Then they repeat the words aloud so they remember them.</li>
<li>After that, they connect each body part with its job, such as seeing, hearing, walking, or writing.</li>
<li>Next, they learn why staying clean is important.</li>
<li>Finally, they use full simple sentences to talk about themselves.</li>
</ol>

<h3><strong>Activity ideas</strong></h3>
<ul>
<li>You can ask the child to stand in front of a mirror and point to each body part.</li>
<li>You can also play a simple game: say “touch your eyes,” “clap your hands,” or “stamp your feet.”</li>
<li>Another useful activity is drawing a child and labeling the body parts.</li>
<li>A hygiene chart can also be made showing brush teeth, wash hands, bathe, comb hair, and trim nails.</li>
</ul>

<h3><strong>Teacher or parent note</strong></h3>
<p>This chapter should be taught with actions, not only reading. The child should point, touch, repeat, and speak. That makes learning easier and more fun. Praise the child when they say complete sentences, even if the sentence is very small. Gentle repetition works best here.</p>
`,
      quiz: [
        { question: "What do we use our eyes for?", options: ["Smelling", "Hearing", "Seeing", "Walking"], answer: "Seeing" },
        { question: "Which word is an action word?", options: ["Hand", "Clap", "Nose", "Child"], answer: "Clap" },
        { question: "What do we say when we wake up?", options: ["Good Night", "Good Morning", "Goodbye", "Sorry"], answer: "Good Morning" },
        { question: "Who are our parents?", options: ["Uncles", "Mother and Father", "Friends", "Teachers"], answer: "Mother and Father" },
        { question: "How many hands do we have?", options: ["One", "Two", "Three", "Four"], answer: "Two" },
        { question: "We use our ___ to smell a flower.", options: ["Ear", "Eye", "Nose", "Hand"], answer: "Nose" },
        { question: "Which of these is a polite word?", options: ["Run", "Please", "Jump", "Loud"], answer: "Please" },
        { question: "Where do we cook food?", options: ["Bedroom", "Bathroom", "Kitchen", "Garden"], answer: "Kitchen" },
        { question: "We should ___ our hands before eating.", options: ["Dirty", "Wash", "Hide", "Paint"], answer: "Wash" },
        { question: "Who tells us stories in the family?", options: ["Grandparents", "Pets", "Toys", "Strangers"], answer: "Grandparents" }
      ],
      lessons: [
        { 
          title: "Introduction: My Family", 
          explanation: "Every person is special and unique! This chapter begins by looking at your own world: your body and the people around you. There was a little boy who loved his family very much. He lived in a happy house with his mother, father, and sister. He realized that a family is a group of people who live together and care for each other.", 
          words: ["Boy", "Family", "Love", "Together", "House", "Live", "Happy"],
          activities: "Think about your family. Who lives with you in your house? Draw a small picture of your family holding hands."
        },
        { 
          title: "Concept Deep-Dive: My Parents", 
          explanation: "A small child learns first from the things closest to them. Our mother and father are our parents. They take care of us, give us food, and help us learn new things every day. They work hard to keep us safe and healthy. In NCERT's introduction, we learn that family is the first school for any child.", 
          words: ["Mother", "Father", "Parents", "Care", "Food", "Learn", "Safe", "Healthy"],
          activities: "List two things your mother or father did for you today (like making breakfast or helping with homework). Say 'Thank You' to them!"
        },
        { 
          title: "My Siblings & Friends", 
          explanation: "Brothers and sisters are called siblings. They are our first friends at home. We share our toys, play games, and grow up together. Having siblings means you always have someone to play with. You learn to share and be kind.", 
          words: ["Brother", "Sister", "Siblings", "Share", "Play", "Games", "Grow"],
          activities: "What is your favorite game to play with your brother, sister, or friend? Write the name of the game."
        },
        { 
          title: "Grandparents & Elders", 
          explanation: "Grandparents are the parents of our parents. They tell us wonderful stories about the past and give us lots of love and special treats! They are the oldest and wisest members of our family. We should always respect and listen to them.", 
          words: ["Grandfather", "Grandmother", "Stories", "Love", "Treats", "Elders", "Respect"],
          activities: "Ask your grandfather or grandmother to tell you a story about when they were little children. What was their favorite toy?"
        },
        { 
          title: "Helping Each Other", 
          explanation: "In a happy family, everyone helps each other. We can help by keeping our room tidy, putting toys away, and being neat and clean. When everyone helps, the house stays happy and beautiful. Cleanliness is a very important part of staying healthy.", 
          words: ["Help", "Tidy", "Kind", "Manners", "Neat", "Clean", "Responsible"],
          activities: "Go to your room and find three toys that are not in their place. Put them back neatly where they belong!"
        },
        { 
          title: "Review: My Body & Family", 
          explanation: "We have learned that our body is a wonderful machine and our family is our support. We use our hands to clap, eyes to see, and feet to walk. We must keep our body clean and our family happy by being polite and helpful every day.", 
          words: ["Hand", "Eye", "Ear", "Nose", "Mouth", "Leg", "Clap", "Blink", "Walk", "Run", "Smile", "Wash", "Review"],
          activities: "Stand in front of a mirror. Point to your eyes, ears, and nose. Now, smile big and say 'I love my family!'"
        }
      ]
    },

    "A Happy Child": {
      content: "<h3><strong>Main focus: This chapter teaches us about a little child who is always happy and enjoys their day playing and laughing.</strong></h3><p>Imagine a happy little child! This child has a pretty red house. All day long, they play under a green tree and laugh a lot. Even if they cry sometimes, it's only for a little while, and then they are happy again. Being a happy child means enjoying simple things like playing outside and smiling!</p><h3><strong>Key Concepts:</strong></h3><ul><li>Being happy and cheerful in everyday life.</li><li>Enjoying playing and spending time outdoors.</li><li>Learning about colors like red and green.</li></ul>",
      quiz: [{"question":"What color is the child's house?","options":["[A] Blue","[B] Red","[C] Yellow","[D] Green"],"answer":"[B] Red"},{"question":"What does the happy child like to do all day?","options":["[A] Sleep","[B] Study","[C] Play and laugh","[D] Cry"],"answer":"[C] Play and laugh"},{"question":"What color is the tree mentioned in the poem?","options":["[A] Brown","[B] Red","[C] Green","[D] Orange"],"answer":"[C] Green"},{"question":"Does the child cry a lot?","options":["[A] Yes, all day","[B] No, only a little while","[C] Never","[D] Only at night"],"answer":"[B] No, only a little while"},{"question":"What is the main feeling the poem talks about?","options":["[A] Sadness","[B] Anger","[C] Happiness","[D] Sleepiness"],"answer":"[C] Happiness"}]
    },
    "Three Little Pigs": {
      content: "<h3><strong>Main focus: This story teaches us that working hard and being wise helps us stay safe and strong.</strong></h3><p>Once upon a time, there were three little pigs who left their home to build their own houses. The first pig built his house very quickly with light straw. The second pig built his house a bit faster with sticks. But the third pig, who was very clever and worked hard, took his time and built a strong house with bricks. A big bad wolf came to blow down their houses. He easily blew down the straw house and the stick house, but no matter how hard he tried, he could not blow down the sturdy brick house! The wise third pig saved his brothers from the wolf, teaching them the importance of hard work and making good choices.</p><h3><strong>Key Concepts:</strong></h3><ul><li>Working hard and planning carefully is important.</li><li>Being wise helps you make good choices for your safety.</li><li>A strong foundation keeps things safe and secure.</li></ul>",
      quiz: [{"question":"How many little pigs were there in the story?","options":["[A] Two","[B] Three","[C] Four","[D] Five"],"answer":"[B] Three"},{"question":"What did the first pig build his house with?","options":["[A] Sticks","[B] Bricks","[C] Straw","[D] Mud"],"answer":"[C] Straw"},{"question":"Which material did the third pig use for his house?","options":["[A] Straw","[B] Sticks","[C] Leaves","[D] Bricks"],"answer":"[D] Bricks"},{"question":"Who wanted to blow down the pigs' houses?","options":["[A] A Fox","[B] A Bear","[C] A Wolf","[D] A Lion"],"answer":"[C] A Wolf"},{"question":"What did the third pig teach his brothers?","options":["[A] How to play","[B] How to sleep","[C] How to build a strong house","[D] How to run fast"],"answer":"[C] How to build a strong house"}]
    },
    "After a Bath": {
      content: "Welcome to the lesson on After a Bath! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in After a Bath?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from After a Bath?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "The Bubble, the Straw and the Shoe": {
      content: "Welcome to the lesson on The Bubble, the Straw and the Shoe! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in The Bubble, the Straw and the Shoe?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from The Bubble, the Straw and the Shoe?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "One Little Kitten": {
      content: "<h3><strong>Main focus: Counting different animals from one to ten and learning their names.</strong></h3><p>Hello little friends! Imagine you are in a big jungle or a farm. What animals would you see? Maybe a tiny kitten, a fat cat, a happy butterfly, or a busy rat! This chapter helps us count these amazing animals, one by one, all the way to ten. We also get to learn their names and how they look! It's fun to count and discover new animal friends!</p><h3><strong>Key Concepts:</strong></h3><ul><li>Counting numbers from 1 to 10.</li><li>Identifying and naming different animals (like kitten, cat, butterfly, rat, fish, seal, seagull, bear, alligator, elephant).</li><li>Understanding simple descriptions of animals.</li></ul>",
      quiz: [{"question":"How many kittens are mentioned in the poem \"One Little Kitten\"?","options":["One","Two","Three","Four"],"answer":"One"},{"question":"Which animal is described as \"fat\" in the poem?","options":["Kitten","Cat","Rat","Fish"],"answer":"Cat"},{"question":"What animal has \"four\" legs and is mentioned after the butterfly?","options":["Kitten","Rat","Fish","Seal"],"answer":"Rat"},{"question":"Which animal swims in the water?","options":["Seagull","Bear","Fish","Butterfly"],"answer":"Fish"},{"question":"The biggest animal mentioned at the end of the poem is a huge _____.","options":["Alligator","Elephant","Bear","Seal"],"answer":"Elephant"}]
    },
    "Lalu and Peelu": {
      content: "<h3><strong>Main focus: Lalu and Peelu teaches us about loving colours, making mistakes, and helping our friends when they are in trouble.</strong></h3><p>Once upon a time, there was a Mother Hen who had two little chicks named Lalu and Peelu. Lalu loved all things red! If he saw something red, he would go to it right away. Peelu loved all things yellow! If he saw something yellow, he would run to it. One day, Lalu saw something red and quickly ate it. Oh no! It was a red chilli, and his mouth started burning! He cried, \"Maa! Maa!\" Mother Hen quickly asked Peelu to bring something yellow. Peelu brought a yummy yellow laddoo for Lalu. Lalu ate the laddoo, and his mouth felt better! Everyone was happy.</p><h3><strong>Key Concepts:</strong></h3><ul><li>Understanding and identifying colours like Red and Yellow.</li><li>The importance of helping friends and family when they are in difficulty.</li></ul>",
      quiz: [{"question":"What colour did Lalu like to eat?","options":["Green","Yellow","Red","Blue"],"answer":"Red"},{"question":"What did Lalu eat by mistake?","options":["A yellow laddoo","A red chilli","A green leaf","A blue berry"],"answer":"A red chilli"},{"question":"Who was Lalu and Peelu's mother?","options":["A Cow","A Dog","A Mother Hen","A Cat"],"answer":"A Mother Hen"},{"question":"What colour did Peelu like?","options":["Red","Blue","Yellow","Green"],"answer":"Yellow"},{"question":"What did Peelu bring to help Lalu feel better?","options":["A red chilli","A green apple","A yellow laddoo","Some water"],"answer":"A yellow laddoo"}]
    },
    "Once I Saw a Little Bird": {
      content: "Welcome to the lesson on Once I Saw a Little Bird! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Once I Saw a Little Bird?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Once I Saw a Little Bird?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Mittu and the Yellow Mango": {
      content: "Welcome to the lesson on Mittu and the Yellow Mango! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Mittu and the Yellow Mango?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Mittu and the Yellow Mango?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Merry-Go-Round": {
      content: "Welcome to the lesson on Merry-Go-Round! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Merry-Go-Round?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Merry-Go-Round?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Circle": {
      content: "Welcome to the lesson on Circle! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Circle?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Circle?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "If I Were an Apple": {
      content: "Welcome to the lesson on If I Were an Apple! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in If I Were an Apple?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from If I Were an Apple?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Our Tree": {
      content: "Welcome to the lesson on Our Tree! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Our Tree?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Our Tree?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "A Kite": {
      content: "Welcome to the lesson on A Kite! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in A Kite?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from A Kite?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Sundari": {
      content: "Welcome to the lesson on Sundari! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Sundari?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Sundari?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "A Little Turtle": {
      content: "Welcome to the lesson on A Little Turtle! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in A Little Turtle?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from A Little Turtle?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "The Tiger and the Mosquito": {
      content: "Welcome to the lesson on The Tiger and the Mosquito! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in The Tiger and the Mosquito?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from The Tiger and the Mosquito?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Clouds": {
      content: "Welcome to the lesson on Clouds! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Clouds?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Clouds?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Anandi’s Rainbow": {
      content: "Welcome to the lesson on Anandi’s Rainbow! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Anandi’s Rainbow?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Anandi’s Rainbow?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Jhoola": {
      content: "Welcome to the lesson on Jhoola! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Jhoola?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Jhoola?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Aam Ki Kahani": {
      content: "Welcome to the lesson on Aam Ki Kahani! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Aam Ki Kahani?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Aam Ki Kahani?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Aam Ki Tokri": {
      content: "Welcome to the lesson on Aam Ki Tokri! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Aam Ki Tokri?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Aam Ki Tokri?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Patte Hi Patte": {
      content: "Welcome to the lesson on Patte Hi Patte! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Patte Hi Patte?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Patte Hi Patte?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Pakodi": {
      content: "Welcome to the lesson on Pakodi! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Pakodi?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Pakodi?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Chhuk-Chhuk Gaadi": {
      content: "Welcome to the lesson on Chhuk-Chhuk Gaadi! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Chhuk-Chhuk Gaadi?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Chhuk-Chhuk Gaadi?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Rasoighar": {
      content: "Welcome to the lesson on Rasoighar! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Rasoighar?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Rasoighar?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Chuho! Myau So Rahi Hai": {
      content: "Welcome to the lesson on Chuho! Myau So Rahi Hai! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Chuho! Myau So Rahi Hai?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Chuho! Myau So Rahi Hai?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Bandar Aur Gilhari": {
      content: "Welcome to the lesson on Bandar Aur Gilhari! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Bandar Aur Gilhari?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Bandar Aur Gilhari?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Pagdi": {
      content: "Welcome to the lesson on Pagdi! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Pagdi?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Pagdi?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Patang": {
      content: "Welcome to the lesson on Patang! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Patang?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Patang?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Gend-Balla": {
      content: "Welcome to the lesson on Gend-Balla! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Gend-Balla?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Gend-Balla?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Bandar Gaya Khet Mein": {
      content: "Welcome to the lesson on Bandar Gaya Khet Mein! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Bandar Gaya Khet Mein?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Bandar Gaya Khet Mein?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Ek Budhiya": {
      content: "Welcome to the lesson on Ek Budhiya! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Ek Budhiya?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Ek Budhiya?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Main Bhi": {
      content: "Welcome to the lesson on Main Bhi! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Main Bhi?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Main Bhi?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Shapes and Space": {
      content: `<h3><strong>Main focus: Space words and shapes that roll or slide</strong></h3>
<p><strong>Chapter summary:</strong> Before we count numbers, we must understand <em>where</em> things are. This chapter teaches position words called "Map Words" — <strong>Inside / Outside, On / Under, Above / Below, Near / Far, Top / Bottom</strong>. We also learn that shapes move in special ways: <strong>round things roll</strong> (ball, orange, coin on its edge) and <strong>long flat things slide</strong> (pencil, book, matchbox). Some objects like a coin can both roll and slide!</p>
<h3><strong>Key concepts:</strong></h3>
<ul>
<li><strong>Position words:</strong> Inside, Outside, On, Under, Above, Below, Near, Far, Top, Bottom</li>
<li><strong>Round shapes</strong> have no corners and like to <strong>Roll</strong></li>
<li><strong>Long / flat shapes</strong> have flat sides and like to <strong>Slide</strong></li>
<li>A coin can slide when flat, but rolls when standing on its edge</li>
</ul>`,
      quiz: [
        { question: "A bird is flying in the sky. The bird is _____ you.", options: ["Below", "Under", "Above", "Inside"], answer: "Above" },
        { question: "Which of these objects will ROLL on the floor?", options: ["A matchbox", "A book", "A ball", "A pencil"], answer: "A ball" },
        { question: "The cat is sitting in the basket. The cat is _____ the basket.", options: ["Outside", "Above", "Inside", "Below"], answer: "Inside" },
        { question: "Which shape movement does a pencil usually make when pushed on the floor?", options: ["Roll", "Slide", "Jump", "Spin"], answer: "Slide" },
        { question: "On a traffic signal, the red light is at the _____.", options: ["Bottom", "Middle", "Top", "Side"], answer: "Top" }
      ]
    },
    "Numbers from One to Nine": {
      content: `<h3><strong>Main focus: Counting 1–9, More / Less, and Zero</strong></h3>
<p><strong>Chapter summary:</strong> Counting is giving a name to "how many." Each number is <strong>one more</strong> than the number before it. We compare groups using <strong>More</strong> (bigger group) and <strong>Less</strong> (smaller group). We also learn about <strong>Zero (0)</strong>, which means nothing is there — if you eat all 5 apples, 0 apples are left!</p>
<h3><strong>Key concepts:</strong></h3>
<ul>
<li>Numbers 1–9 in order: 1, 2, 3, 4, 5, 6, 7, 8, 9</li>
<li>Each number is <strong>one more</strong> than the previous</li>
<li><strong>More vs Less:</strong> 7 chocolates is more than 3 chocolates</li>
<li><strong>Zero (0)</strong> means none / nothing</li>
</ul>`,
      quiz: [
        { question: "How many fingers are on one hand?", options: ["4", "5", "6", "3"], answer: "5" },
        { question: "What is one more than 4?", options: ["3", "4", "5", "6"], answer: "5" },
        { question: "Which group has LESS: 3 chocolates or 7 chocolates?", options: ["7 chocolates", "3 chocolates", "Both are equal", "Cannot say"], answer: "3 chocolates" },
        { question: "You have 5 apples and eat all 5. How many are left?", options: ["1", "5", "2", "0"], answer: "0" },
        { question: "Which number comes just before 9?", options: ["7", "10", "8", "6"], answer: "8" }
      ]
    },
    "Addition": {
      content: "<h3><strong>Major Extension: The World of Combining Numbers</strong></h3>\
<p>Addition is the foundation of all mathematics. When we put two groups together, we find a new, bigger number called the SUM. Imagine you have a basket of 3 red apples and another basket with 4 green apples. When you pour them all into one big basket, you can count them all: 1, 2, 3, 4, 5, 6, 7! This is the magic of addition.</p>\
<h3><strong>Key Concepts:</strong></h3>\
<ul>\
<li><strong>The Plus Sign (+):</strong> This symbol tells us 'Put them together!'</li>\
<li><strong>The Equals Sign (=):</strong> This symbol tells us 'The result is...'</li>\
<li><strong>Adding Zero:</strong> A very important trick! Any number plus zero stays exactly the same.</li>\
<li><strong>Counting On:</strong> If you have 5 and want to add 3, start at 5 and count forward 3 steps: 6, 7, 8!</li>\
</ul>",
      quiz: [
        { question: "What is 2 + 3?", options: ["4", "5", "6", "7"], answer: "5" },
        { question: "If you have 1 ball and buy 1 more, how many do you have?", options: ["1", "2", "3", "0"], answer: "2" },
        { question: "3 plus 0 equals ___.", options: ["0", "1", "2", "3"], answer: "3" },
        { question: "What is 4 + 4?", options: ["7", "8", "9", "10"], answer: "8" },
        { question: "One more than 5 is ___.", options: ["4", "5", "6", "7"], answer: "6" },
        { question: "If there are 4 birds and 2 more join, how many total?", options: ["5", "6", "7", "8"], answer: "6" },
        { question: "What is 7 + 2 using counting on?", options: ["8", "9", "10", "11"], answer: "9" },
        { question: "Which sign is for addition?", options: ["-", "+", "=", "x"], answer: "+" }
      ],
      lessons: [
        { title: "The Concept of 'All Together'", explanation: "Addition is like building a tower. Each block you add makes the tower taller. In this lesson, we learn that when we have two separate groups (like 2 cats and 1 cat), we can bring them together to find the total. 'All together' is the most important phrase in addition! Whether it is toys, fruits, or friends, adding them up helps us see the big picture.", words: ["Together", "Total", "Combine", "Tower", "Group", "Sum"], activities: "Take 3 pencils. Now take 2 more. Put them in one hand. Count them: 1, 2, 3, 4, 5!" },
        { title: "The Magic Plus Sign (+)", explanation: "The plus sign (+) is like a bridge. It connects two numbers and asks them to become one new number. In this lesson, we practice drawing the plus sign and placing it between numbers. When we see 2 + 2, we know the bridge is bringing the two groups of 2 together to form a group of 4. It is the most used sign in the world of math!", words: ["Plus", "Bridge", "Symbol", "Connect", "Operation", "Sign"], activities: "Draw 5 big plus signs on a paper and decorate them with your favorite colors." },
        { title: "Counting On Strategy", explanation: "This is a super-fast trick! Instead of starting from 1, we start from the bigger number. If you have 6 + 2, you don't count 1, 2, 3, 4, 5, 6... you just start at 6 and say: '6... 7, 8!' Two more steps. This 'Counting On' trick makes adding much faster as numbers get bigger. Practice starting from 5, 7, or 9 and adding small numbers.", words: ["Strategy", "Trick", "Fast", "Forward", "Next", "Steps"], activities: "Try to add 4 + 3 by starting at 4 and counting 3 steps forward. What do you get?" },
        { title: "Addition with Zero", explanation: "Zero (0) is a very special number. It means 'nothing'. So, if you have 8 chocolates and your friend gives you 0 more, you still have 8 chocolates! In this lesson, we learn that any number added to zero remains the same. It's like adding an empty box to a full one. 1+0=1, 2+0=2, and even 9+0=9. Zero is the hero who doesn't change anything!", words: ["Zero", "Nothing", "Empty", "Same", "Rule", "Hero"], activities: "What is 7 + 0? What is 0 + 5? Write the answers and notice how they don't change!" },
        { title: "Real Life Addition Stories", explanation: "We use addition every day! 'I have 2 cookies, mom gives me 2 more. How many now?' These are addition stories. They help us understand why we learn math. From counting money to counting friends at a party, addition is everywhere. In this lesson, we will make up our own stories about toys, animals, and school items.", words: ["Stories", "Real-life", "Problem", "Logic", "Everyday", "Cookies"], activities: "Tell a story about 3 birds on a branch and 2 more flying in. How many birds are in your story?" },
        { title: "Final Review & Speed Test", explanation: "Now you are an Addition Expert! We have learned the bridge sign (+), the counting on trick, and the zero rule. Let's practice adding quickly. Speed comes with practice! We will solve many small problems to see how fast we can find the sum. Remember: practice makes perfect in the world of numbers.", words: ["Expert", "Speed", "Practice", "Perfect", "Numbers", "Review"], activities: "Solve 10 simple addition problems (like 1+1, 2+2) as fast as you can!" }
      ]
    },

    "Subtraction": {
      content: "<h3><strong>Major Extension: The Art of Taking Away</strong></h3>\
<p>Subtraction is like a magic trick where things disappear! It is the process of taking some things away from a group to find out what is LEFT or REMAINING. If you have 6 balloons and 2 burst, you can't have 6 anymore. You subtract the 2 to find your answer. It is the opposite of addition. Where addition builds up, subtraction counts down.</p>\
<h3><strong>Key Concepts:</strong></h3>\
<ul>\
<li><strong>The Minus Sign (-):</strong> This symbol says 'Take it away!'</li>\
<li><strong>The Difference:</strong> The result of a subtraction problem.</li>\
<li><strong>Subtracting Zero:</strong> Just like addition, subtracting nothing leaves the number the same.</li>\
<li><strong>Subtracting from Itself:</strong> If you have 5 and take away 5, you always get ZERO.</li>\
</ul>",
      quiz: [
        { question: "What is 5 - 2?", options: ["2", "3", "4", "5"], answer: "3" },
        { question: "If you have 4 balloons and 1 bursts, how many are left?", options: ["2", "3", "4", "5"], answer: "3" },
        { question: "9 minus 0 equals ___.", options: ["0", "9", "1", "8"], answer: "9" },
        { question: "What is 8 - 8?", options: ["0", "1", "8", "16"], answer: "0" },
        { question: "One less than 6 is ___.", options: ["4", "5", "6", "7"], answer: "5" },
        { question: "If there are 10 eggs and 2 break, how many are left?", options: ["7", "8", "9", "11"], answer: "8" },
        { question: "What is the minus sign?", options: ["+", "-", "=", "x"], answer: "-" }
      ],
      lessons: [
        { title: "The Concept of 'Remaining'", explanation: "Subtraction is about finding out what is 'Remaining' or 'Left over'. Imagine a plate of 5 cookies. You eat 2. The cookies didn't just disappear—they were taken away by you! Now you count what is left: 1, 2, 3. In this lesson, we focus on the word 'Remaining'. Whenever something is eaten, lost, broken, or given away, we use subtraction.", words: ["Remaining", "Left-over", "Eaten", "Lost", "Broken", "Away"], activities: "Take 6 toy cars. Move 3 away. Count how many are 'remaining' on the floor." },
        { title: "The Minus Sign (-) & Difference", explanation: "The minus sign (-) is a small horizontal line. It is the symbol for subtraction. When you see it, you know a group is going to get smaller. The answer we get in subtraction is called the 'Difference'. If we subtract 2 from 10, the difference is 8. In this lesson, we practice writing the minus sign and identifying the difference in simple problems.", words: ["Minus", "Sign", "Difference", "Smaller", "Symbol", "Operation"], activities: "Draw a big minus sign. Under it, write 'I make things smaller!' in your best handwriting." },
        { title: "Counting Back Strategy", explanation: "Just like addition has counting on, subtraction has 'Counting Back'. To solve 8 - 3, start at 8 and count backward 3 steps: 7, 6, 5! You landed on 5, so that is the answer. Counting back is like walking down the stairs. Each step makes the number smaller until you reach your answer. This is a very useful trick for quick math.", words: ["Backwards", "Strategy", "Steps", "Stairs", "Landed", "Quick"], activities: "Try to count backwards from 10 to 1 out loud. 10, 9, 8... Now try 7 minus 2 by counting back." },
        { title: "Subtracting Zero and Itself", explanation: "Subtraction has two very easy rules! First, any number minus zero is the same number (8 - 0 = 8). Second, any number minus ITSELF is always zero (8 - 8 = 0). If you have 5 apples and give 5 apples away, you have none left! In this lesson, we learn these two special cases that make subtraction feel like a game.", words: ["Zero", "Itself", "Nothing", "Rule", "Empty", "None"], activities: "What is 10 - 0? What is 10 - 10? Notice the big difference between the two!" },
        { title: "Subtraction Stories in the Wild", explanation: "Let's tell stories about subtraction! 'Ten birds were in a tree. Six flew away. How many stay?' We use subtraction to solve mysteries like these. In this lesson, we will look at pictures of animals, toys, and foods and create stories where things are taken away. Being able to tell a math story means you really understand how it works!", words: ["Mystery", "Wild", "Stay", "Flew", "Pictures", "Understand"], activities: "Tell a story about 5 balloons. One pops! How many are left in your story?" },
        { title: "Final Review: Subtraction Master", explanation: "You are now a Subtraction Master! You know the minus sign (-), the difference, and the counting back trick. You can solve stories and work with zero. Subtraction is a key skill for sharing and organizing your life. From sharing snacks to knowing how many days are left until your birthday, you will use subtraction every single day. Keep practicing!", words: ["Master", "Skill", "Life", "Sharing", "Days", "Practice"], activities: "Practice subtracting from 10. How many problems can you solve in 1 minute?" }
      ]
    },
    "Numbers from Ten to Twenty": {
      content: `<h3><strong>Main focus: The secret of 10 — Tens and Ones (10–20)</strong></h3>
<p><strong>Chapter summary:</strong> This is the most important secret in maths! Once we have 10 ones, we tie them into a <strong>Bundle</strong> called <strong>1 Ten</strong>. So: 11 = 1 Ten + 1 One, 15 = 1 Ten + 5 Ones, 20 = 2 Tens. By grouping into tens, we can count large numbers quickly!</p>
<h3><strong>Key concepts:</strong></h3>
<ul>
<li><strong>10 Ones = 1 Ten (a bundle)</strong></li>
<li>11 = 1 Ten + 1 One</li>
<li>15 = 1 Ten + 5 Ones</li>
<li>19 comes just before 20; 20 comes just after 19</li>
<li>Numbers 10–20 in order: 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20</li>
</ul>`,
      quiz: [
        { question: "How many Tens are in the number 10?", options: ["0", "2", "10", "1"], answer: "1" },
        { question: "What number is 1 Ten and 3 Ones?", options: ["3", "31", "13", "103"], answer: "13" },
        { question: "You have 18 sticks. How many bundles of ten can you make? How many are left over?", options: ["1 bundle, 8 left", "2 bundles, 8 left", "1 bundle, 18 left", "8 bundles, 1 left"], answer: "1 bundle, 8 left" },
        { question: "What number comes just after 19?", options: ["18", "21", "20", "15"], answer: "20" },
        { question: "15 = 1 Ten + ___ Ones", options: ["1", "15", "5", "10"], answer: "5" }
      ]
    },
    "Time": {
      content: `<h3><strong>Main focus: Order of events and parts of the day</strong></h3>
<p><strong>Chapter summary:</strong> Time is about the <strong>order</strong> of things. We do things in the <strong>Morning</strong> (brush teeth), <strong>Afternoon</strong> (have lunch), and <strong>Night</strong> (sleep). We use words like <strong>First, Next, and Last</strong> to describe our day. Some activities take more time (watching a movie) and some take less time (brushing teeth).</p>
<h3><strong>Key concepts:</strong></h3>
<ul>
<li><strong>Parts of the day:</strong> Morning → Afternoon → Night</li>
<li><strong>Sequence words:</strong> First, Next, Last</li>
<li>We see <strong>stars at Night</strong>, not in the Morning</li>
<li>Days of the week in order: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday</li>
</ul>`,
      quiz: [
        { question: "What do you do FIRST: Put on socks or put on shoes?", options: ["Put on shoes", "Put on socks", "Both at the same time", "Neither"], answer: "Put on socks" },
        { question: "When do you see stars in the sky?", options: ["Morning", "Afternoon", "Night", "Noon"], answer: "Night" },
        { question: "Which takes MORE time: Brushing teeth or watching a movie?", options: ["Brushing teeth", "Watching a movie", "Both take the same time", "Cannot say"], answer: "Watching a movie" },
        { question: "What day comes after Friday?", options: ["Thursday", "Sunday", "Monday", "Saturday"], answer: "Saturday" },
        { question: "We have lunch in the ___.", options: ["Morning", "Night", "Afternoon", "Midnight"], answer: "Afternoon" }
      ]
    },
    "Measurement": {
      content: `<h3><strong>Main focus: Measuring without a ruler — Taller/Shorter, Heavier/Lighter</strong></h3>
<p><strong>Chapter summary:</strong> We can measure things without a ruler by using our <strong>Handspan</strong> (thumb to pinky), <strong>Footsteps</strong>, or a <strong>String</strong>. We compare things using: <strong>Taller / Shorter</strong> (for height), <strong>Heavier / Lighter</strong> (for weight), and <strong>Thicker / Thinner</strong> (for width). We also measure capacity: how many glasses fill a bottle?</p>
<h3><strong>Key concepts:</strong></h3>
<ul>
<li><strong>Handspan</strong> = distance from thumb to little finger</li>
<li>Compare height: Taller / Shorter</li>
<li>Compare weight: Heavier / Lighter</li>
<li>Compare width: Thicker / Thinner</li>
<li>Capacity: how many small cups fill a large container</li>
</ul>`,
      quiz: [
        { question: "Which is HEAVIER: a spoon or a bucket of water?", options: ["A spoon", "A bucket of water", "Both are equal", "Cannot say"], answer: "A bucket of water" },
        { question: "We can measure the length of a table using our ___.", options: ["Eyes", "Handspan", "Voice", "Colour"], answer: "Handspan" },
        { question: "Is a thread THINNER or THICKER than a rope?", options: ["Thicker", "Thinner", "Same width", "Cannot compare"], answer: "Thinner" },
        { question: "To compare the heights of two children, we use which words?", options: ["Heavier / Lighter", "Thicker / Thinner", "Taller / Shorter", "Near / Far"], answer: "Taller / Shorter" },
        { question: "We measure length without a ruler using ___.", options: ["A coin", "Footsteps", "A ball", "Water"], answer: "Footsteps" }
      ]
    },
    "Numbers from Twenty-One to Fifty": {
      content: `<h3><strong>Main focus: Numbers 21–99 as bundles of Tens and Ones</strong></h3>
<p><strong>Chapter summary:</strong> Numbers 21 to 99 are just more bundles of Tens! 30 = 3 Tens, 54 = 5 Tens + 4 Ones, 99 = 9 Tens + 9 Ones. To compare two numbers, always look at the <strong>Tens digit first</strong>. 52 is bigger than 25 because 5 Tens > 2 Tens. We also learn to count by tens: 10, 20, 30, 40…</p>
<h3><strong>Key concepts:</strong></h3>
<ul>
<li>30 = 3 Tens + 0 Ones; 54 = 5 Tens + 4 Ones</li>
<li>To compare numbers, look at the <strong>Tens digit first</strong></li>
<li>Count by tens: 10, 20, 30, 40, 50, 60, 70, 80, 90</li>
<li>Number name for 50 = <strong>Fifty</strong></li>
</ul>`,
      quiz: [
        { question: "What is the number for 7 Tens and 2 Ones?", options: ["27", "72", "720", "207"], answer: "72" },
        { question: "Which is bigger: 48 or 84?", options: ["48", "84", "Both are equal", "Cannot say"], answer: "84" },
        { question: "Count by tens: 10, 20, 30, ___, ___, 60. What are the missing numbers?", options: ["35, 50", "40, 50", "31, 41", "45, 55"], answer: "40, 50" },
        { question: "What is the number name for 50?", options: ["Fifteen", "Five", "Sixty", "Fifty"], answer: "Fifty" },
        { question: "What number comes between 66 and 68?", options: ["65", "69", "67", "70"], answer: "67" }
      ]
    },
    "Data Handling": {
      content: `<h3><strong>Main focus: Sorting, counting, and comparing groups of objects</strong></h3>
<p><strong>Chapter summary:</strong> Data handling is <strong>sorting and counting</strong>. If you have a pile of toys, you count how many cars, how many dolls, and how many balls. Then you can answer: "Which toy do I have the most of?" and "Which is the least?" Sorting helps us organise the world around us.</p>
<h3><strong>Key concepts:</strong></h3>
<ul>
<li><strong>Sort</strong> = putting similar things together in groups</li>
<li><strong>Count</strong> each group to find how many</li>
<li>Compare groups: <strong>Most / Least</strong></li>
<li>We can sort toys, fruits, colours, shapes, and more</li>
</ul>`,
      quiz: [
        { question: "There are 5 red cars and 2 blue cars. Which colour car is more?", options: ["Blue", "Red", "Both are same", "Cannot say"], answer: "Red" },
        { question: "Data handling means:", options: ["Adding big numbers", "Sorting and counting objects in groups", "Drawing shapes", "Measuring length"], answer: "Sorting and counting objects in groups" },
        { question: "In the word MATHEMATICS, which letter appears the most?", options: ["M", "T", "A", "E"], answer: "A" },
        { question: "You have 4 stars, 2 circles, and 4 stars again. How many stars are there in total?", options: ["6", "4", "8", "10"], answer: "8" },
        { question: "Why do we sort and count things into groups?", options: ["To make them look pretty", "To answer questions like which is most or least", "To make them bigger", "To subtract them"], answer: "To answer questions like which is most or least" }
      ]
    },
    "Patterns": {
      content: `<h3><strong>Main focus: Recognising and continuing repeating patterns</strong></h3>
<p><strong>Chapter summary:</strong> A pattern is a <strong>rule that repeats</strong>. It is like a dance: Step, Clap, Step, Clap. In maths we look for what comes next. If the pattern is 2, 4, 2, 4 — the next number must be 2. If it is square, triangle, square, triangle — the next shape is a square. Patterns are everywhere: on your clothes, on floor tiles, and in numbers!</p>
<h3><strong>Key concepts:</strong></h3>
<ul>
<li>A pattern has a <strong>repeating rule</strong></li>
<li>Colour patterns: Red, Blue, Red, Blue…</li>
<li>Shape patterns: ◻ △ ◻ △ …</li>
<li>Number patterns: 5, 10, 15, 20 (counting by 5s); 2, 4, 6, 8 (counting by 2s)</li>
</ul>`,
      quiz: [
        { question: "Complete this pattern: A, B, A, B, ___, ___", options: ["B, A", "A, B", "A, A", "B, B"], answer: "A, B" },
        { question: "What is the rule for: 5, 10, 15, 20, 25?", options: ["Add 2 each time", "Add 10 each time", "Add 5 each time", "Add 3 each time"], answer: "Add 5 each time" },
        { question: "Pattern: ◻ △ ◻ △ ___. What comes next?", options: ["△", "◻", "○", "★"], answer: "◻" },
        { question: "The pattern is: Sun, Moon, Star, Sun, Moon, ___. What comes next?", options: ["Sun", "Moon", "Star", "Cloud"], answer: "Star" },
        { question: "Which of these is a number pattern counting by 2s?", options: ["1, 3, 5, 7", "2, 4, 6, 8", "5, 10, 15, 20", "10, 20, 30, 40"], answer: "2, 4, 6, 8" }
      ]
    },
    "All About Me": {
      content: `<h3><strong>Main focus: Self-introduction and identity</strong></h3>
<p><strong>Chapter summary:</strong> Every person is special and unique! This chapter helps you introduce yourself. You learn about your name, your age, your favorite things (hobbies), and your birthday. Knowing yourself is the first step to knowing the world.</p>
<h3><strong>Key concepts:</strong></h3>
<ul>
<li>Introducing yourself: "My name is...", "I am ... years old"</li>
<li>Knowing your birthday and age</li>
<li>Identifying hobbies and things you love</li>
<li>Knowing physical traits (hair and eye color)</li>
</ul>
<h3><strong>Practice Questions:</strong></h3>
<ul>
<li>Write three things you love to do (Example: Drawing, playing, singing).</li>
<li>When do you celebrate your birthday?</li>
<li>How many candles were on your last birthday cake?</li>
<li>What is the color of your hair and eyes?</li>
<li>Draw a picture of yourself doing something you love.</li>
</ul>`,
      quiz: [
        { question: "What is the first step to knowing the world?", options: ["Knowing your name", "Knowing yourself", "Knowing your teacher", "Knowing your toys"], answer: "Knowing yourself" },
        { question: "What do we use to celebrate our birthday?", options: ["Books", "Candles and cake", "Pens", "Shoes"], answer: "Candles and cake" },
        { question: "Which of these is a hobby?", options: ["Sleeping in class", "Drawing and singing", "Crying", "Breaking toys"], answer: "Drawing and singing" },
        { question: "How many candles would be on your cake if you are 6 years old?", options: ["4", "5", "6", "7"], answer: "6" },
        { question: "Every person is ___ and unique.", options: ["Same", "Bored", "Special", "Common"], answer: "Special" },
        { question: "What color can your eyes be?", options: ["Blue or Brown", "Purple", "Pink", "Silver"], answer: "Blue or Brown" },
        { question: "Things we love to do in free time are called ___.", options: ["Work", "Hobbies", "Sleep", "Chores"], answer: "Hobbies" },
        { question: "Your name is your ___.", options: ["Identity", "Secret", "Number", "Grade"], answer: "Identity" },
        { question: "We celebrate our birthday ___ a year.", options: ["Once", "Twice", "Every month", "Never"], answer: "Once" },
        { question: "Everyone has a ___ hair and eye color.", options: ["Same", "Different", "Invisible", "Grey"], answer: "Different" }
      ],
      lessons: [
        { 
          title: "My Name & Identity", 
          explanation: "Every person is special and unique! This chapter helps you introduce yourself. The first step to knowing the world is knowing who you are. Your name is your identity, and no one else is exactly like you.", 
          words: ["Name", "Special", "Unique", "Identity", "Self", "Student"],
          activities: "Write your full name in big letters. Decorate it with your favorite colors!"
        },
        { 
          title: "My Age & Birthday", 
          explanation: "Your birthday is a very special day! We use candles on a cake to show how many years old we are. Growing older means you can do more things by yourself and learn more about the world.", 
          words: ["Birthday", "Age", "Candles", "Celebrate", "Cake", "Years"],
          activities: "When do you celebrate your birthday? How many candles were on your last birthday cake? Draw the cake with the right number of candles."
        },
        { 
          title: "My Favorite Things", 
          explanation: "We all have things we like more than others. These can be toys, colors, foods, or animals. Knowing what you like helps you share your feelings with your friends and family.", 
          words: ["Favorite", "Toy", "Color", "Choice", "Like", "Loves"],
          activities: "What is your favorite color? Find three things in your room that are that color."
        },
        { 
          title: "My Hobbies", 
          explanation: "Hobbies are activities we love to do in our free time, like drawing, singing, playing, or reading. Doing things you love makes you a happy and special person.", 
          words: ["Hobbies", "Drawing", "Singing", "Playing", "Free time", "Fun"],
          activities: "Write three things you love to do (Example: Drawing, playing, singing). Draw a picture of yourself doing something you love."
        },
        { 
          title: "My Physical Traits", 
          explanation: "Everyone looks different and that is what makes us beautiful! We have different hair colors, eye colors, and heights. Knowing your own traits is part of knowing yourself.", 
          words: ["Hair", "Eyes", "Traits", "Appearance", "Color", "Brown", "Black"],
          activities: "Look in the mirror. What is the color of your hair and eyes? Is your hair long or short?"
        },
        { 
          title: "Review: All About Me", 
          explanation: "Now you know how to introduce yourself and share all the special things about you! You are a unique individual with your own favorites, hobbies, and features.", 
          words: ["Introduction", "Special", "Unique", "Friend", "Myself", "Identify"],
          activities: "Stand up and introduce yourself to an imaginary friend. Say your name, your age, and one thing you love to do!"
        }
      ]
    },
    "My Body and Sense Organs": {
      content: `<h3><strong>Main focus: Body parts and the 5 senses</strong></h3>
<p><strong>Chapter summary:</strong> Your body is like a wonderful machine with different parts. But your "Superpowers" are your 5 Sense Organs. They help you know what is happening around you:</p>
<ul>
<li><strong>Eyes:</strong> To see colors and shapes</li>
<li><strong>Ears:</strong> To hear music and voices</li>
<li><strong>Nose:</strong> To smell flowers and food</li>
<li><strong>Tongue:</strong> To taste sweet, salty, or sour</li>
<li><strong>Skin:</strong> To feel hot, cold, soft, or prickly</li>
</ul>
<h3><strong>Practice Questions:</strong></h3>
<ul>
<li>Which sense organ helps you know that a bell is ringing?</li>
<li>How many toes do you have in total?</li>
<li>Match the following:
  <ul>
    <li>Ice cream → (Eyes / Tongue)</li>
    <li>Rainbow → (Nose / Eyes)</li>
    <li>Soft Teddy Bear → (Skin / Ears)</li>
  </ul>
</li>
<li>What part of your body helps you run and jump?</li>
<li>True or False: We have two noses.</li>
</ul>`,
      quiz: [
        { question: "Which sense organ helps you know that a bell is ringing?", options: ["Nose", "Eyes", "Ears", "Tongue"], answer: "Ears" },
        { question: "How many toes do humans usually have in total?", options: ["5", "8", "10", "12"], answer: "10" },
        { question: "Which organ helps you taste an ice cream?", options: ["Skin", "Tongue", "Nose", "Ears"], answer: "Tongue" },
        { question: "We use our ___ to feel if a teddy bear is soft.", options: ["Eyes", "Ears", "Nose", "Skin"], answer: "Skin" },
        { question: "True or False: We have two noses.", options: ["True", "False"], answer: "False" }
      ],
      lessons: [
        { title: "My Wonderful Body", explanation: "Your body is like a wonderful machine with many parts that work together to help you move and play.", words: ["Body", "Machine", "Parts", "Movement"] },
        { title: "Seeing & Hearing", explanation: "Our eyes help us see colors and shapes. Our ears help us hear music, voices, and bells.", words: ["Eyes", "Ears", "See", "Hear"] },
        { title: "Smelling & Tasting", explanation: "Our nose helps us smell flowers and yummy food. Our tongue helps us taste sweet, salty, and sour things.", words: ["Nose", "Tongue", "Smell", "Taste"] },
        { title: "Feeling with Skin", explanation: "Our skin is all over our body. it helps us feel if something is hot, cold, soft, or prickly.", words: ["Skin", "Feel", "Touch", "Temperature"] },
        { title: "Action Words", explanation: "Our body parts help us do actions. We use legs to run and jump, and hands to clap and write.", words: ["Run", "Jump", "Clap", "Write", "Walk"] },
        { title: "The 5 Sense Organs", explanation: "Remember your 5 superpowers! Eyes, Ears, Nose, Tongue, and Skin help you know everything about the world.", words: ["Senses", "Organs", "Superpower", "Knowledge"] }
      ]
    },
    "My Family and Home": {
      content: `<h3><strong>Main focus: Types of families and rooms in a home</strong></h3>
<p><strong>Chapter summary:</strong> A family is a group of people who live together and care for each other.</p>
<ul>
<li><strong>Small Family:</strong> Mother, Father, and one or two children.</li>
<li><strong>Large/Joint Family:</strong> Grandparents, Uncles, Aunts, and Cousins all living together.</li>
</ul>
<p>Your home is the place where you feel safe. Every room has a use: the <strong>Kitchen</strong> for cooking, the <strong>Bedroom</strong> for sleeping, and the <strong>Bathroom</strong> for cleaning up.</p>
<h3><strong>Practice Questions:</strong></h3>
<ul>
<li>Who are your parents? (Your Mother and Father).</li>
<li>What do you call your father’s father?</li>
<li>In which room does your mother cook food?</li>
<li>How do you help your family at home? (Example: Keeping toys in place).</li>
<li>Name one thing you do with your family on holidays.</li>
</ul>`,
      quiz: [
        { question: "Who are your parents?", options: ["Grandparents", "Mother and Father", "Uncles and Aunts", "Friends"], answer: "Mother and Father" },
        { question: "What do you call your father's father?", options: ["Brother", "Uncle", "Grandfather", "Cousin"], answer: "Grandfather" },
        { question: "In which room does your mother cook food?", options: ["Bedroom", "Bathroom", "Kitchen", "Drawing room"], answer: "Kitchen" },
        { question: "Helping your family means ___.", options: ["Leaving toys on floor", "Keeping toys in place", "Shouting", "Not eating"], answer: "Keeping toys in place" },
        { question: "A family is a group of people who ___.", options: ["Live together and care", "Only fight", "Never talk", "Stay far away"], answer: "Live together and care" }
      ],
      lessons: [
        { title: "What is a Family?", explanation: "A family is a group of people who live together and care for each other. They love and support you. Your family is your biggest team, helping you when you are sad and celebrating with you when you are happy. You learn how to speak, how to eat, and how to be a good person from your family members. Even if your family is small or big, the most important part is the love and care you share every single day.", words: ["Family", "Love", "Care", "Together", "Support", "Team"], activities: "Draw a picture of your family. Who is in it? Give each person a big smile in your drawing." },
        { title: "Small Family", explanation: "A small family has a Mother, Father, and one or two children. It is also called a nuclear family. In a small family, you often get to do many fun things together, like going to the park, reading books, or helping in the kitchen. Everyone helps each other to keep the home happy and organized. It is a cozy place where you grow up feeling safe and very loved by your parents.", words: ["Small", "Parents", "Children", "Nuclear", "Cozy", "Happy"], activities: "What is one thing you like doing with your parents? Share it with your class." },
        { title: "Large/Joint Family", explanation: "A joint family is big and wonderful! It includes grandparents, uncles, aunts, and cousins all living in one home. Living in a joint family means there is always someone to play with or talk to. You learn to share your toys, your stories, and your snacks. You get lots of love from your grandparents and have great fun with your cousins. It is a busy and joyful house where everyone works together to help each other.", words: ["Large", "Joint", "Relatives", "Cousins", "Joyful", "Sharing"], activities: "How many people are in your family? Ask your parents for all their names and write them down." },
        { title: "Our Home & Safety", explanation: "Our home is the place where we feel safe. It protects us from rain, sun, cold weather, and wild animals. A home is not just four walls and a roof; it is the place where you share meals, play games, and sleep peacefully. Because our home protects us, we should also take care of it by keeping it clean and beautiful. A clean home is a healthy and happy home for everyone who lives inside it.", words: ["Home", "Safe", "Protect", "Shelter", "Clean", "Peaceful"], activities: "Why is a home important? Think of two reasons and tell your partner." },
        { title: "Rooms in a Home", explanation: "Every room has a special use. We cook in the kitchen, sleep in the bedroom, and bathe in the bathroom. The living room is where we sit with guests and talk. The dining room is where we eat our meals together. Knowing which room is for which activity helps us stay organized. When we are done playing, we should put our toys back in the room they belong to. Keeping rooms tidy makes our house feel even better!", words: ["Kitchen", "Bedroom", "Bathroom", "Living room", "Dining room", "Tidy"], activities: "Go on a tour of your home. Name the rooms you walk through. What is the most important activity in each room?" },
        { title: "Helping at Home", explanation: "We should help our family by keeping our toys in place and keeping our home clean. Helping makes you a responsible member of the family! You can help by putting your plate in the sink, folding your clothes, or dusting the shelves. When everyone helps, the work gets done quickly and everyone has more time to play and relax together. Helping is a way to say 'I love you' to your family members.", words: ["Help", "Clean", "Toys", "Responsible", "Work", "Relax"], activities: "Choose one small job you can do to help at home today. Did your parents say thank you?" }
      ]
    },
    "Food We Eat": {
      content: `<h3><strong>Main focus: Sources of food and healthy habits</strong></h3>
<p><strong>Detailed explanation:</strong> Food is the basic necessity for all living beings. It provides the energy required for various activities like playing, studying, and growing. We get our food from two main sources: plants and animals. Plants provide us with fruits, vegetables, pulses, and cereals. Animals provide us with milk, eggs, and meat. It is important to eat a balanced diet that includes a variety of foods to stay healthy. We should also follow good eating habits, such as washing hands before and after meals, eating slowly, and not wasting food. Drinking plenty of water is also essential for our body to function properly.</p>
<h3><strong>Grammar focus:</strong></h3>
<ul>
<li><strong>Healthy food:</strong> fruits, vegetables, milk</li>
<li><strong>Junk food:</strong> chips, burgers, cold drinks</li>
<li><strong>Meals:</strong> breakfast, lunch, dinner</li>
</ul>
<h3><strong>Activities:</strong></h3>
<ul>
<li>Make a list of foods you ate yesterday and categorize them.</li>
<li>Draw your favorite fruit and vegetable.</li>
<li>Identify which foods come from plants and which from animals.</li>
</ul>`,
      quiz: [
        { question: "Why do we need food?", options: ["To sleep", "To get energy and grow", "To cry", "To watch TV"], answer: "To get energy and grow" },
        { question: "Which of these do we get from plants?", options: ["Milk", "Eggs", "Fruits and Vegetables", "Meat"], answer: "Fruits and Vegetables" },
        { question: "Which is a healthy snack?", options: ["Burger", "Chips", "Apple", "Cold drink"], answer: "Apple" },
        { question: "How many main meals do we usually eat in a day?", options: ["1", "2", "3", "5"], answer: "3" },
        { question: "We should wash our hands ___ eating.", options: ["Only before", "Only after", "Before and after", "Never"], answer: "Before and after" },
        { question: "Which of these gives us energy?", options: ["Sleeping", "Food", "Crying", "Sitting"], answer: "Food" },
        { question: "Which meal do we eat in the morning?", options: ["Lunch", "Dinner", "Breakfast", "Snack"], answer: "Breakfast" },
        { question: "Fruits and vegetables keep us ___.", options: ["Weak", "Sick", "Healthy", "Tired"], answer: "Healthy" },
        { question: "We should ___ our food well.", options: ["Gulp", "Chew", "Drink", "Throw"], answer: "Chew" },
        { question: "Milk comes from ___.", options: ["Plants", "Animals", "Clouds", "Rivers"], answer: "Animals" }
      ],
      lessons: [
        { title: "Why We Need Food", explanation: "Food is like fuel for our body! Just like a car needs petrol to run, our body needs food to play, run, and think. When we eat good food, our body gets energy. Energy is what helps us jump high and run fast. Without food, we would feel very tired and weak. Food also helps us grow from a small baby into a big child. It builds our muscles and makes our bones strong. So, eating is not just for fun, it's for staying alive and growing big!", words: ["Energy", "Grow", "Strong", "Alive", "Fuel", "Health"], activities: "Jump up and down 10 times. How do you feel? You need energy for that! Draw a picture of one food that gives you energy." },
        { title: "Food from Plants", explanation: "Plants are amazing because they make food for us! When we walk in a garden or a farm, we see many plants. Some give us sweet fruits like mangoes, apples, and bananas. Others give us healthy vegetables like carrots, potatoes, and spinach. We also get grains like rice and wheat from plants, which we use to make chapatis and bread. Pulses like dal also come from plants. Nature is very kind to give us so many different things to eat from the soil!", words: ["Plants", "Fruits", "Vegetables", "Grains", "Pulses", "Nature"], activities: "Look in your kitchen. Find one fruit and one vegetable. Touch them and feel their skin. Are they smooth or rough?" },
        { title: "Food from Animals", explanation: "Animals are also our friends who give us food. Cows, buffaloes, and goats give us fresh milk. We use milk to make many yummy things like curd, butter, and cheese. Hens and ducks give us eggs, which are very good for our health. Some people also eat meat from animals like goats or fish. Drinking a glass of milk every day makes our teeth and bones very strong because milk has something called calcium. It is important to be kind to animals who help us!", words: ["Animals", "Milk", "Eggs", "Meat", "Curd", "Calcium"], activities: "Do you like drinking milk? Name three things your mother makes using milk (like curd, kheer, or paneer)." },
        { title: "Healthy vs Junk Food", explanation: "Not all food is the same! Some food is 'Healthy' and some is 'Junk'. Healthy food like milk, fruits, green veggies, and dal makes us super strong and protects us from falling sick. It has vitamins and minerals. Junk food like chips, burgers, and sugary cold drinks might taste good, but it doesn't help our body grow. If we eat too much junk food, we might feel lazy or get a tummy ache. It's okay to have a treat sometimes, but most of the time, we should choose healthy food to be a champion!", words: ["Healthy", "Junk", "Nutrition", "Vitamins", "Minerals", "Champion"], activities: "Imagine you are a superhero. Which food would you eat to get your powers? Draw a 'Healthy Hero Meal' on a paper plate." },
        { title: "Our Daily Meals", explanation: "We have a routine for eating! We usually eat three main meals. In the morning, we have Breakfast to start our day with energy. In the middle of the day, when we come back from school, we have Lunch. And at night, before we go to sleep, we have Dinner with our whole family. Sometimes we have a small snack in the evening too. Eating at the right time helps our tummy stay happy and our body work perfectly throughout the day.", words: ["Breakfast", "Lunch", "Dinner", "Meals", "Morning", "Night"], activities: "What did you eat for breakfast today? Ask your mother what is for dinner tonight. Try to help her set the table!" },
        { title: "Food Hygiene", explanation: "Staying clean while eating is very important! We should always wash our hands with soap before we touch our food, and wash them again after we finish. This keeps away the tiny germs that can make us sick. We should also wash fruits and vegetables before eating them. While eating, we should sit properly, chew our food slowly, and not talk with food in our mouth. Also, remember never to waste food, because many people work hard to grow it for us!", words: ["Hygiene", "Wash", "Chew", "Cleanliness", "Germs", "Soap", "Waste"], activities: "Practice washing your hands the right way for 20 seconds. Count to 20 while you scrub with soap!" }
      ]
    },
    "Shapes and Space": {
      content: "<h3><strong>Main focus: Spatial understanding and basic shapes</strong></h3>\
<p><strong>Detailed explanation:</strong> This chapter introduces children to the world of shapes and their positions in space. It covers concepts like inside-outside, bigger-smaller, top-bottom, nearer-farther, on-under, and above-below. Understanding these positions helps children describe the world around them. The chapter also introduces basic 2D shapes like circles, triangles, and squares through everyday objects. By observing objects, children learn to identify their shapes and relative positions.</p>\
<h3><strong>Key Concepts:</strong></h3>\
<ul>\
<li><strong>Positions:</strong> inside, outside, top, bottom, near, far</li>\
<li><strong>Comparisons:</strong> bigger, smaller, longest, shortest</li>\
<li><strong>Basic shapes:</strong> circle, triangle, square, rectangle</li>\
</ul>",
      quiz: [
        { question: "Where is the bird in the sky?", options: ["Under the tree", "Above the tree", "Inside the tree", "Near the tree"], answer: "Above the tree" },
        { question: "Which is bigger: An Elephant or a Mouse?", options: ["Elephant", "Mouse"], answer: "Elephant" },
        { question: "Where do we keep our books?", options: ["Inside the bag", "Outside the bag", "On top of the bag", "Under the bag"], answer: "Inside the bag" },
        { question: "A ball is which shape?", options: ["Triangle", "Square", "Circle", "Rectangle"], answer: "Circle" },
        { question: "The fan is ___ our head.", options: ["Under", "Above", "Inside", "Near"], answer: "Above" },
        { question: "Which is the shortest finger?", options: ["Thumb", "Pinky", "Middle", "Index"], answer: "Pinky" },
        { question: "If a cat is on the roof, it is at the ___.", options: ["Bottom", "Top", "Side", "Under"], answer: "Top" },
        { question: "Which shape has three sides?", options: ["Square", "Circle", "Triangle", "Rectangle"], answer: "Triangle" }
      ],
      lessons: [
        { title: "Inside and Outside", explanation: "Imagine you have a beautiful pencil box. When your pencils are inside the box, they are safe. When you take them out to write, they are outside. Just like you are inside your house when it rains, and outside when you play in the park. 'Inside' means something is within a container or space, and 'outside' means it is in the open space around it. Can you think of more things that stay inside and outside?", words: ["Inside", "Outside", "Box", "House", "Park", "Open"], activities: "Put your favorite toy inside a box. Now take it out. Say 'The toy is inside' and 'The toy is outside' out loud!" },
        { title: "Bigger and Smaller", explanation: "The world is full of things of different sizes! Some things are very big, like an elephant, a mountain, or a big bus. Some things are very small, like an ant, a pebble, or a tiny eraser. When we compare two things, we say one is 'bigger' and the other is 'smaller'. Look at your hand and your father's hand—which one is bigger? Look at a football and a tennis ball—which one is smaller? Size helps us identify things!", words: ["Bigger", "Smaller", "Elephant", "Ant", "Compare", "Size"], activities: "Find two spoons in your kitchen—a big one and a small one. Which one is bigger? Which one is smaller?" },
        { title: "Top and Bottom", explanation: "Look at a tall building or a tree. The part that touches the sky is the 'Top'. The part that touches the ground is the 'Bottom'. When you sit on a slide, you are at the top first, and then you slide down to the bottom. If you put a cap on your head, it is on the top of your body. Your shoes are at the bottom. Understanding top and bottom helps us find things!", words: ["Top", "Bottom", "Sky", "Ground", "Slide", "Height"], activities: "Put your hand on the top of your head. Now touch the bottom of your feet. Up and down!" },
        { title: "Nearer and Farther", explanation: "Distance tells us how close something is. If a ball is right next to you, it is 'Nearer'. If it is across the field, it is 'Farther'. If you are standing near your mother, you can hold her hand. If she is far away, you have to call her. We use these words to know how much we need to walk or reach for something. Which is nearer to you right now: your book or the door?", words: ["Nearer", "Farther", "Close", "Distance", "Reach", "Away"], activities: "Stand in the middle of the room. Point to something that is near you. Now point to something that is far away." },
        { title: "On, Under, Above, Below", explanation: "These words tell us exactly where things are! A cat can sit 'On' the table. A dog might sleep 'Under' the table. The fan is 'Above' your head, and the carpet is 'Below' your feet. 'Above' and 'Below' are like 'Top' and 'Bottom' but for things that might not be touching. 'On' and 'Under' are for things that are usually touching or very close. Is your ceiling fan above or below you?", words: ["On", "Under", "Above", "Below", "Position", "Locate"], activities: "Place a book on the table. Now put your hand under the table. Look up at the ceiling—it is above you!" },
        { title: "Shapes Around Us", explanation: "Look around! Everything has a shape. A clock is often a 'Circle'—it is round and round. A slice of pizza or a sandwich can be a 'Triangle' with three sharp corners. Your notebook or the door is a 'Rectangle' or a 'Square' with four sides. Shapes make the world look interesting! Can you find a circle in your room? How about a square window?", words: ["Circle", "Triangle", "Square", "Rectangle", "Corners", "Sides"], activities: "Take a piece of paper and try to draw a circle, a triangle, and a square. Color the circle red, the triangle blue, and the square green!" }
      ]
    },
    "Numbers from One to Nine": {
      content: "<h3><strong>Main focus: Counting and identifying numbers 1-9</strong></h3>\
<p><strong>Detailed explanation:</strong> Counting is the foundation of mathematics. This chapter teaches children to count objects up to nine. It involves matching objects with numbers, understanding the concept of 'more' and 'less', and learning to write the digits 1, 2, 3, 4, 5, 6, 7, 8, and 9. Children also learn the concept of zero (0) as 'nothing' or the absence of objects. Activities like counting fingers, fruits, and toys help reinforce these concepts.</p>\
<h3><strong>Key Concepts:</strong></h3>\
<ul>\
<li><strong>Counting:</strong> 1, 2, 3, 4, 5, 6, 7, 8, 9</li>\
<li><strong>Comparison:</strong> more than, less than, equal to</li>\
<li><strong>Zero:</strong> the concept of none</li>\
</ul>",
      quiz: [
        { question: "How many fingers do you have on one hand?", options: ["4", "5", "6", "10"], answer: "5" },
        { question: "Which number comes after 3?", options: ["2", "4", "5", "6"], answer: "4" },
        { question: "If you have 2 apples and you eat both, how many are left?", options: ["1", "2", "0", "3"], answer: "0" },
        { question: "Count the legs of a chair.", options: ["2", "3", "4", "5"], answer: "4" },
        { question: "Which number is greater: 7 or 4?", options: ["7", "4"], answer: "7" }
      ],
      lessons: [
        { title: "Counting 1 to 3", explanation: "Let's start counting! One (1) is like the Sun in the sky. Two (2) is like your two eyes or two ears. Three (3) is like the wheels on a rickshaw or the sides of a triangle. Counting is just saying numbers in order while pointing at things. One... Two... Three! Can you find three things on your table?", words: ["One", "Two", "Three", "Count", "Order", "Number"], activities: "Hold up one finger. Now two. Now three! Wiggle them around." },
        { title: "Counting 4 to 6", explanation: "Moving up! Four (4) is like the legs of a table or a dog. Five (5) is special because you have five fingers on one hand! Six (6) is the number of legs on an insect like an ant. As we count higher, the group of things gets bigger. 1, 2, 3, 4, 5, 6! It's like climbing stairs!", words: ["Four", "Five", "Six", "Higher", "Fingers", "Legs"], activities: "Clap your hands six times while counting out loud: 1, 2, 3, 4, 5, 6!" },
        { title: "Counting 7 to 9", explanation: "Almost at ten! Seven (7) is the number of colors in a rainbow. Eight (8) is the number of legs on a spider. Nine (9) is the biggest single-digit number! When you have nine of something, you have a lot! Counting to nine helps us talk about many things, like nine crayons in a box or nine stars in a drawing.", words: ["Seven", "Eight", "Nine", "Rainbow", "Spider", "Many"], activities: "Draw nine small circles on a paper and count them one by one as you color them." },
        { title: "More or Less", explanation: "When we compare two groups, we can see which one has 'More' and which has 'Less'. If you have 5 candies and your friend has 2, you have more! 'More' means a bigger number, and 'Less' means a smaller number. If both have the same number, we say it is 'Equal'. Understanding more and less helps us share things fairly.", words: ["More", "Less", "Equal", "Compare", "Group", "Share"], activities: "Put 3 pencils in one pile and 1 pencil in another. Which pile has more? Which has less?" },
        { title: "The Story of Zero", explanation: "What happens when you have a plate of cookies and you eat them ALL? Now you have 'Zero' (0) cookies! Zero means 'nothing' or 'none'. It is a very important number because it tells us when something is empty. If there are no birds in a tree, we say there are zero birds. Zero is round like a circle and represents an empty space.", words: ["Zero", "None", "Nothing", "Empty", "Round", "Space"], activities: "Close your hand into a fist. How many fingers are you holding up? Zero! Now open them one by one." },
        { title: "Review: Counting Fun", explanation: "Wow! You can now count from 0 all the way to 9. You can identify numbers and tell if a group is big or small. Numbers are everywhere—on houses, on phones, and even on your birthday cake. Keep practicing your counting every day by counting your steps or your toys!", words: ["Count", "Identify", "Practice", "Numbers", "Review", "Master"], activities: "Walk across the room and count every step you take. How many steps did it take to reach the other side?" }
      ]
    },
    "Addition": {
      content: "<h3><strong>Main focus: Combining groups of objects</strong></h3>\
<p><strong>Detailed explanation:</strong> Addition is the mathematical process of putting things together. When we add two or more numbers, we get a larger number called the 'Sum'. For example, if you have 2 balloons and your friend gives you 1 more, you now have 3 balloons in total. We use the plus sign (+) to show addition. This chapter uses pictures of fruits, animals, and toys to help children understand how to combine groups and find the total count.</p>\
<h3><strong>Key Concepts:</strong></h3>\
<ul>\
<li><strong>Plus sign (+):</strong> the symbol for adding</li>\
<li><strong>Equals sign (=):</strong> the symbol for the result</li>\
<li><strong>Total/Sum:</strong> the final count</li>\
</ul>",
      quiz: [
        { question: "What is 2 + 3?", options: ["4", "5", "6", "7"], answer: "5" },
        { question: "If you have 1 ball and buy 1 more, how many do you have?", options: ["1", "2", "3", "0"], answer: "2" },
        { question: "3 plus 0 equals ___.", options: ["0", "1", "2", "3"], answer: "3" },
        { question: "What is 4 + 4?", options: ["7", "8", "9", "10"], answer: "8" },
        { question: "One more than 5 is ___.", options: ["4", "5", "6", "7"], answer: "6" }
      ],
      lessons: [
        { title: "Adding One More", explanation: "Addition can be as simple as adding 'One More'. If you have 1 apple and you get 1 more, you have 2. If you have 5 and get 1 more, you have 6. It's like taking one step forward on a number line. Adding 1 always gives you the next number! Let's try: What is 8 and 1 more?", words: ["Add", "Plus", "Total", "More", "Next", "Step"], activities: "Put one toy on the table. Add one more. Count them: 1, 2! Addition is fun." },
        { title: "Combining Two Groups", explanation: "Addition is also about putting two different groups together. If there are 2 birds on a branch and 3 more fly in, we count them all together: 1, 2, 3, 4, 5! We write this as 2 + 3 = 5. The '+' sign is like a bridge that connects the two groups. The '=' sign tells us the final answer. Can you add 2 pens and 2 pencils?", words: ["Groups", "Combine", "Bridge", "Together", "Sum", "Plus"], activities: "Use your fingers. Show 2 on one hand and 3 on the other. Put them together and count all of them." },
        { title: "Addition with Zero", explanation: "Adding zero is a special trick! Zero means nothing. So, if you have 4 chocolates and you get 0 more, you still have 4 chocolates. The number doesn't change at all! Any number plus zero is always that same number. 5 + 0 = 5. 9 + 0 = 9. It's like adding an empty box—the count stays the same.", words: ["Zero", "Same", "No change", "Empty", "Rule", "Trick"], activities: "Hold up 5 fingers. Add zero more fingers (keep your other hand closed). How many fingers now? Still 5!" },
        { title: "Addition Stories", explanation: "We can use addition to tell stories! 'Rahul has 3 balls. Sarah gives him 2 more. How many balls does Rahul have now?' These are called word problems. We look for words like 'total', 'altogether', or 'sum' to know we need to add. Stories make math feel real and useful. Can you make up an addition story about your toys?", words: ["Stories", "Total", "Altogether", "Problem", "Real", "Math"], activities: "Tell a story: 'I have 2 cookies. My dad gives me 1 more. I have 3 cookies!' Now you try one." },
        { title: "Horizontal & Vertical Addition", explanation: "We can write addition in two ways! Horizontal is like a sentence: 2 + 2 = 4. Vertical is when we write numbers one below the other with a line at the bottom. Both ways give the same answer! Vertical addition is very helpful when we start adding bigger numbers later on. It's like stacking blocks—one on top of the other.", words: ["Horizontal", "Vertical", "Stack", "Line", "Below", "Ways"], activities: "Write '3 + 1 = 4' on a piece of paper. Now try writing the 3 on top of the 1 with a plus sign. Does it look different?" },
        { title: "Review: Addition Master", explanation: "Congratulations! You are now an Addition Master. You know how to combine groups, add zero, and tell addition stories. Adding helps us in shops, in games, and even when we share snacks with friends. Keep looking for things to add together everywhere you go!", words: ["Master", "Combine", "Addition", "Practice", "Review", "Skills"], activities: "Find two groups of objects (like 4 spoons and 2 forks). Add them together. What is the total count?" }
      ]
    },
    "Plants Around Us": {
      content: `<h3><strong>Main focus: Types of plants and their parts</strong></h3>
<p><strong>Chapter summary:</strong> Plants are our green friends. They can be:</p>
<ul>
<li><strong>Big Trees:</strong> Like Mango or Banyan.</li>
<li><strong>Small Shrubs:</strong> Like Rose or Tulsi.</li>
<li><strong>Climbers:</strong> Plants that need support to grow up, like money plants.</li>
</ul>
<p>Most plants have <strong>Leaves</strong> (usually green), <strong>Flowers</strong>, and <strong>Fruits</strong>. They need sunlight, water, and soil to live.</p>
<h3><strong>Practice Questions:</strong></h3>
<ul>
<li>What does a plant need to grow?</li>
<li>Name a tree that gives us fruit.</li>
<li>Which part of the plant stays under the ground? (Roots).</li>
<li>Can plants move from one place to another like us?</li>
<li>Draw a leaf and color it.</li>
</ul>`,
      quiz: [
        { question: "What does a plant need to grow?", options: ["Chocolate", "Sunlight, water, and soil", "Television", "Plastic"], answer: "Sunlight, water, and soil" },
        { question: "Which part of the plant stays under the ground?", options: ["Flower", "Leaf", "Roots", "Fruit"], answer: "Roots" },
        { question: "Which of these is a big tree?", options: ["Rose", "Money plant", "Banyan", "Grass"], answer: "Banyan" },
        { question: "Can plants move from one place to another like us?", options: ["Yes", "No"], answer: "No" },
        { question: "Plants that need support to grow up are called ___.", options: ["Trees", "Shrubs", "Climbers", "Herbs"], answer: "Climbers" }
      ],
      topics: ["Plants are Our Friends", "Big Trees and Small Shrubs", "Climbers", "Parts of a Plant"]
    },
    "Animals Around Us": {
      content: `<h3><strong>Main focus: Classification of animals</strong></h3>
<p><strong>Chapter summary:</strong> The world is full of different animals:</p>
<ul>
<li><strong>Wild Animals:</strong> Live in the jungle (Lion, Elephant).</li>
<li><strong>Domestic/Farm Animals:</strong> Live with us or on farms (Cow, Goat, Hen).</li>
<li><strong>Pet Animals:</strong> Our friends at home (Dog, Cat, Rabbit).</li>
<li><strong>Birds:</strong> Have feathers and wings to fly.</li>
<li><strong>Insects:</strong> Very small animals with 6 legs (Ant, Butterfly).</li>
</ul>
<h3><strong>Practice Questions:</strong></h3>
<ul>
<li>Name an animal that gives us milk.</li>
<li>Which animal is called the "King of the Jungle"?</li>
<li>How many legs does an insect have?</li>
<li>Name a bird that cannot fly but can run fast. (Ostrich / Penguin).</li>
<li>Which animal guards our house?</li>
</ul>`,
      quiz: [
        { question: "Which animal is called the 'King of the Jungle'?", options: ["Elephant", "Lion", "Tiger", "Giraffe"], answer: "Lion" },
        { question: "How many legs does an insect usually have?", options: ["2", "4", "6", "8"], answer: "6" },
        { question: "Which animal gives us milk?", options: ["Dog", "Cow", "Lion", "Cat"], answer: "Cow" },
        { question: "Which animal guards our house?", options: ["Cat", "Rabbit", "Dog", "Hen"], answer: "Dog" },
        { question: "A bird that cannot fly but runs fast is the ___.", options: ["Parrot", "Sparrow", "Ostrich", "Crow"], answer: "Ostrich" }
      ],
      topics: ["Wild Animals", "Domestic and Farm Animals", "Pet Animals", "Birds and Insects"]
    },
    "Water and Air": {
      content: `<h3><strong>Main focus: Importance of air and water</strong></h3>
<p><strong>Air:</strong> It is all around us. We cannot see it, but we can feel it when it moves (<strong>Wind</strong>). All living things need air to breathe.</p>
<p><strong>Water:</strong> We need it for drinking, bathing, cooking, and cleaning. Plants and animals need it too. We should never waste water!</p>
<h3><strong>Practice Questions:</strong></h3>
<ul>
<li>Can we see air?</li>
<li>Write two uses of water.</li>
<li>Where does rain water go?</li>
<li>Fill in the blank: Moving air is called __________.</li>
<li>How can you save water at home?</li>
</ul>`,
      quiz: [
        { question: "Can we see air?", options: ["Yes", "No"], answer: "No" },
        { question: "Moving air is called ___.", options: ["Water", "Cloud", "Wind", "Dust"], answer: "Wind" },
        { question: "Which of these is NOT a use of water?", options: ["Drinking", "Bathing", "Watching TV", "Cooking"], answer: "Watching TV" },
        { question: "Where does rain water go?", options: ["Into the sky", "Into rivers and lakes", "Nowhere", "Into the fire"], answer: "Into rivers and lakes" },
        { question: "We should ___ water at home.", options: ["Waste", "Throw", "Save", "Hide"], answer: "Save" }
      ],
      topics: ["Air is All Around Us", "Breathing Air", "Uses of Water", "Saving Water"]
    },
    "People Who Help Us": {
      content: `<h3><strong>Main focus: Community helpers in our neighborhood</strong></h3>
<p><strong>Chapter summary:</strong> We cannot do everything by ourselves. Many people in our neighborhood help us:</p>
<ul>
<li><strong>Doctor:</strong> Treats us when we are sick.</li>
<li><strong>Teacher:</strong> Helps us learn at school.</li>
<li><strong>Postman:</strong> Brings our letters.</li>
<li><strong>Police Officer:</strong> Keeps us safe.</li>
<li><strong>Farmer:</strong> Grows food for us.</li>
</ul>
<h3><strong>Practice Questions:</strong></h3>
<ul>
<li>Who mends our shoes? (Cobbler).</li>
<li>Where do you go when you are sick?</li>
<li>Who brings bread and milk to your house?</li>
<li>Who uses a whistle and a baton to keep us safe?</li>
<li>What does a tailor do?</li>
</ul>`,
      quiz: [
        { question: "Who mends our shoes when they are torn?", options: ["Tailor", "Doctor", "Cobbler", "Postman"], answer: "Cobbler" },
        { question: "Where do you go when you are sick?", options: ["Park", "Hospital/Doctor", "School", "Market"], answer: "Hospital/Doctor" },
        { question: "Who brings bread and milk to your house?", options: ["Policeman", "Tailor", "Milkman/Baker", "Barber"], answer: "Milkman/Baker" },
        { question: "Who uses a whistle and a baton to keep us safe?", options: ["Farmer", "Police Officer", "Teacher", "Doctor"], answer: "Police Officer" },
        { question: "What does a tailor do?", options: ["Grows crops", "Stitches clothes", "Fixes taps", "Bakes bread"], answer: "Stitches clothes" }
      ],
      topics: ["Who is a Neighbor?", "People who Help Us", "Our Neighborhood Places"]
    },
    "Good Habits and Safety": {
      content: `<h3><strong>Main focus: Good manners and personal safety</strong></h3>
<p><strong>Chapter summary:</strong> Being a "Good Child" means having good habits: brushing twice a day, sleeping on time, and saying "Please" and "Thank You."</p>
<p><strong>Safety means staying away from danger:</strong></p>
<ul>
<li><strong>On the Road:</strong> Cross at the Zebra Crossing. Follow the traffic lights.</li>
<li><strong>At Home:</strong> Do not touch sharp knives or electric plugs.</li>
</ul>
<h3><strong>Practice Questions:</strong></h3>
<ul>
<li>What does the Red light say?</li>
<li>Where should we walk on the road? (Footpath).</li>
<li>Is it safe to play with fire or matchsticks?</li>
<li>Write two "Magic Words" (Example: Sorry, Thank you).</li>
<li>Why should we trim our nails regularly?</li>
</ul>`,
      quiz: [
        { question: "What does the Red traffic light say?", options: ["Go", "Wait", "Stop", "Run"], answer: "Stop" },
        { question: "Where should we walk on the road?", options: ["In the middle", "On the footpath", "Anywhere", "Close your eyes"], answer: "On the footpath" },
        { question: "Which of these is a 'Magic Word'?", options: ["Give me", "Stop", "Thank you", "Go away"], answer: "Thank you" },
        { question: "Is it safe to play with matchsticks?", options: ["Yes", "No"], answer: "No" },
        { question: "Why should we trim our nails regularly?", options: ["To look scary", "To keep them clean and avoid germs", "To play better", "To waste time"], answer: "To keep them clean and avoid germs" }
      ],
      topics: ["Good Habits", "Road Safety", "Safety at Home", "Magic Words"]
    },
    "First Day at School": {
      content: `<h3><strong>Main focus: Feelings and imagination on the first day of school</strong></h3>
<p><strong>Chapter summary:</strong> A young child wonders about many things on their first day at school. Will their drawing be as good as others? Will the other children like them or just stare? Will the teacher look like their Mom or Grandmom? And most importantly, will their puppy wonder where they are? This poem captures the <strong>curiosity</strong> and <strong>nervousness</strong> we all feel when starting something new.</p>
<h3><strong>Key concepts:</strong></h3>
<ul>
<li>Vocabulary: Wonder, stare, puppy, teacher, drawing</li>
<li>Expressing feelings: Nervousness and excitement</li>
<li>Rhyming words: Day/Stay, Look/Book</li>
<li>Using "I wonder..." to express curiosity</li>
</ul>`,
      quiz: [
        { question: "What does the child wonder about their drawing?", options: ["If it will be colorful", "If it will be as good as others", "If it will be big", "If it will be small"], answer: "If it will be as good as others" },
        { question: "Who does the child wonder if the teacher will look like?", options: ["Their brother", "Their Dad", "Their Mom or Grandmom", "Their friend"], answer: "Their Mom or Grandmom" },
        { question: "Which pet is mentioned in the poem?", options: ["Kitten", "Puppy", "Rabbit", "Parrot"], answer: "Puppy" },
        { question: "The word 'Wonder' means to ___.", options: ["Be sure", "Be curious or ask yourself", "Run fast", "Sleep"], answer: "Be curious or ask yourself" },
        { question: "Find a rhyming word for 'Stare'.", options: ["Star", "Bear", "Store", "Stair"], answer: "Bear" }
      ]
    },
    "Haldi’s Adventure": {
      content: `<h3><strong>Main focus: Surprise, adventure, and learning new things</strong></h3>
<p><strong>Chapter summary:</strong> Haldi meets a giraffe named Smiley on her way to school. Smiley wears glasses and carries a book! He tells Haldi about the wonderful things he sees. Haldi hops on his back and they "fly" to school. She learns that the world is full of surprises and that <strong>learning is an adventure</strong>. This story encourages children to be imaginative and observe the world around them.</p>
<h3><strong>Key concepts:</strong></h3>
<ul>
<li>Vocabulary: Adventure, giraffe, glasses, surprised, wonderful</li>
<li>Describing characters: Smiley the Giraffe</li>
<li>Days of the week (mentioning going to school on Monday)</li>
<li>The idea that school can be fun and exciting</li>
</ul>`,
      quiz: [
        { question: "Who did Haldi meet on her way to school?", options: ["An elephant", "A giraffe", "A lion", "A rabbit"], answer: "A giraffe" },
        { question: "What was the giraffe's name?", options: ["Tallie", "Smiley", "Longy", "Happy"], answer: "Smiley" },
        { question: "What was the giraffe wearing?", options: ["A hat", "Glasses", "A scarf", "Shoes"], answer: "Glasses" },
        { question: "How did Haldi reach school in the end?", options: ["She ran", "She went by bus", "She rode on the giraffe's back", "She walked"], answer: "She rode on the giraffe's back" },
        { question: "What did the giraffe carry in his hand?", options: ["A bag", "A book", "A pencil", "A flower"], answer: "A book" }
      ]
    },
    "I Am Lucky": {
      content: `<h3><strong>Main focus: Self-acceptance and gratitude</strong></h3>
<p><strong>Chapter summary:</strong> If I were a butterfly, I'd be thankful for my wings. If I were a maina, I'd be thankful I could sing. If I were an elephant, I'd be thankful for my trunk. But I am just ME, and I am lucky to be me! This poem teaches children to <strong>value themselves</strong> and be happy with who they are, rather than wishing to be someone else.</p>
<h3><strong>Key concepts:</strong></h3>
<ul>
<li>Vocabulary: Thankful, wings, trunk, lucky, giggle</li>
<li>Naming animals and their special features</li>
<li>Theme: Self-esteem and self-love</li>
<li>Using "If I were..." for imaginary situations</li>
</ul>`,
      quiz: [
        { question: "What is the butterfly thankful for?", options: ["Its song", "Its wings", "Its trunk", "Its legs"], answer: "Its wings" },
        { question: "Why is the elephant thankful?", options: ["Because it can fly", "Because it can raise its trunk", "Because it can sing", "Because it is small"], answer: "Because it can raise its trunk" },
        { question: "The main message of the poem is to be happy being ___.", options: ["A butterfly", "An elephant", "A fish", "YOURSELF"], answer: "YOURSELF" },
        { question: "A maina is thankful because it can ___.", options: ["Swim", "Hop", "Sing", "Run"], answer: "Sing" },
        { question: "Which animal is thankful for its tail?", options: ["Fish", "Kangaroo", "Monkey", "Cat"], answer: "Monkey" }
      ]
    },
    "I Want": {
      content: `<h3><strong>Main focus: Contentment and being happy with oneself</strong></h3>
<p><strong>Chapter summary:</strong> A little monkey wants to be big and strong. A wise woman gives him a magic wand. He gets a giraffe's neck, an elephant's trunk, and a zebra's stripes. But then he looks in the water and is scared of himself — he looks like a monster! He realizes he was <strong>happier as a monkey</strong>. He throws away the wand and never wants to be anyone else again.</p>
<h3><strong>Key concepts:</strong></h3>
<ul>
<li>Vocabulary: Strong, magic wand, monster, stripes, stretch</li>
<li>Consequences of wishing to be something we are not</li>
<li>Animal features: Long neck (giraffe), trunk (elephant), stripes (zebra)</li>
<li>Value: Being happy with our own identity</li>
</ul>`,
      quiz: [
        { question: "What did the little monkey want to be?", options: ["Small", "Big and strong", "Funny", "Fast"], answer: "Big and strong" },
        { question: "Who gave the monkey a magic wand?", options: ["An elephant", "A wise woman", "A lion", "A bird"], answer: "A wise woman" },
        { question: "The monkey got stripes like a ___.", options: ["Tiger", "Zebra", "Cat", "Snake"], answer: "Zebra" },
        { question: "Why did the monkey cry 'Help!' when he saw himself in the river?", options: ["He saw a crocodile", "He thought he looked like a monster", "He fell in", "He was hungry"], answer: "He thought he looked like a monster" },
        { question: "In the end, what did the monkey do with the magic wand?", options: ["He kept it", "He gave it to a friend", "He threw it into the water", "He broke it"], answer: "He threw it into the water" }
      ]
    },
    "A Smile": {
      content: `<h3><strong>Main focus: Spreading happiness and the "contagious" nature of smiles</strong></h3>
<p><strong>Chapter summary:</strong> A smile is a very funny thing! It wrinkles up your face, and when it's gone, you can never find its secret hiding place. But the best thing is: if you smile at someone, they smile back, and then <strong>one smile makes two</strong>! This simple poem teaches children the power of kindness and how a small action can make someone else happy.</p>
<h3><strong>Key concepts:</strong></h3>
<ul>
<li>Vocabulary: Wrinkles, secret, hiding place, funny</li>
<li>Rhyming words: Thing/Sing, Place/Face</li>
<li>Theme: Kindness and positivity</li>
<li>Metaphor: A smile as a "funny thing"</li>
</ul>`,
      quiz: [
        { question: "What does a smile do to your face?", options: ["Makes it dirty", "Wrinkles it up", "Makes it long", "Makes it red"], answer: "Wrinkles it up" },
        { question: "Where does a smile go when it's gone?", options: ["Under the bed", "To a secret hiding place", "To the market", "To school"], answer: "To a secret hiding place" },
        { question: "According to the poem, what happens when you smile at someone?", options: ["They run away", "They cry", "They smile back", "They get angry"], answer: "They smile back" },
        { question: "One smile can make ___.", options: ["Zero", "One", "Two", "Ten"], answer: "Two" },
        { question: "A smile is called a '___ thing'.", options: ["Sad", "Boring", "Funny", "Scary"], answer: "Funny" }
      ]
    },
    "The Wind and the Sun": {
      content: `<h3><strong>Main focus: Gentleness vs Force</strong></h3>
<p><strong>Chapter summary:</strong> The Wind and the Sun have a competition: who can make a man take off his coat? The Wind blows harder and harder, but the man just pulls his coat tighter. Then the Sun shines brightly. The man feels the warmth and takes off his coat. The Sun wins! This story teaches that <strong>gentleness and warmth are often more powerful than force and anger</strong>.</p>
<h3><strong>Key concepts:</strong></h3>
<ul>
<li>Vocabulary: Competition, coat, puffing, shining, victory</li>
<li>Characters: The forceful Wind and the gentle Sun</li>
<li>Opposites: Cold/Hot, Hard/Soft</li>
<li>Moral: Kindness is more effective than strength</li>
</ul>`,
      quiz: [
        { question: "What was the competition between the Wind and the Sun?", options: ["Who can run faster", "Who can make a man take off his coat", "Who can make it rain", "Who is brighter"], answer: "Who can make a man take off his coat" },
        { question: "What did the man do when the Wind blew hard?", options: ["He took off his coat", "He ran away", "He pulled his coat tighter", "He started singing"], answer: "He pulled his coat tighter" },
        { question: "How did the Sun win?", options: ["By making it rain", "By shining brightly and making it hot", "By blowing hard", "By hiding"], answer: "By shining brightly and making it hot" },
        { question: "The Wind said, 'I can get his coat off ___ than you can.'", options: ["Slower", "More quickly", "Better", "Later"], answer: "More quickly" },
        { question: "In the end, who won?", options: ["The Wind", "The Man", "The Sun", "No one"], answer: "The Sun" }
      ]
    },
    "Rain": {
      content: `<h3><strong>Main focus: Observing nature during the rainy season</strong></h3>
<p><strong>Chapter summary:</strong> The rain is falling all around! It falls on the field and the tree, it rains on the umbrellas here, and on the ships at sea. This short, rhythmic poem helps children observe how rain covers the entire world, from land to sea. It encourages them to think about <strong>nature's patterns</strong> and how we protect ourselves (like with umbrellas).</p>
<h3><strong>Key concepts:</strong></h3>
<ul>
<li>Vocabulary: Field, umbrella, ship, sea, around</li>
<li>Rhyming words: Tree/Sea, Around/Ground</li>
<li>Theme: Universal nature of rain</li>
<li>Observation of surroundings during weather changes</li>
</ul>`,
      quiz: [
        { question: "Where does the rain fall?", options: ["Only in the garden", "All around", "Only on the roof", "Only in the park"], answer: "All around" },
        { question: "What does the rain fall on, besides the field?", options: ["The car", "The tree", "The house", "The dog"], answer: "The tree" },
        { question: "Where else is it raining, according to the poem?", options: ["On the mountains", "On the ships at sea", "On the moon", "On the birds"], answer: "On the ships at sea" },
        { question: "What do we use to stay dry in the rain?", options: ["A hat", "An umbrella", "A book", "A fan"], answer: "An umbrella" },
        { question: "Find a rhyming word for 'Sea'.", options: ["See", "Say", "Sun", "Sky"], answer: "See" }
      ]
    },
    "Storm in the Garden": {
      content: `<h3><strong>Main focus: Courage, small creatures, and nature's power</strong></h3>
<p><strong>Chapter summary:</strong> Sunu-sunu the snail is playing in the garden with his friends, the ants. Suddenly, a storm comes! There is lightning (Zich-zich!), thunder (Gadam-gudum!), and heavy rain. Sunu-sunu hides inside his shell. When it's over, he is safe and dry. This story introduces children to <strong>weather phenomena</strong> and shows how even small animals have ways to protect themselves.</p>
<h3><strong>Key concepts:</strong></h3>
<ul>
<li>Vocabulary: Snail, storm, lightning, thunder, shell</li>
<li>Onomatopoeia: Words that sound like what they describe (Gadam-gudum, Shee-shee)</li>
<li>Animal features: Snail's shell as a house</li>
<li>Coping with fear during scary situations</li>
</ul>`,
      quiz: [
        { question: "Who was Sunu-sunu?", options: ["An ant", "A snail", "A bird", "A frog"], answer: "A snail" },
        { question: "Who were Sunu-sunu's friends?", options: ["Ants", "Bees", "Butterflies", "Snakes"], answer: "Ants" },
        { question: "Where did Sunu-sunu hide during the storm?", options: ["Under a leaf", "Inside his shell", "In a hole", "Under a stone"], answer: "Inside his shell" },
        { question: "What sound did the lightning make?", options: ["Gadam-gudum", "Zich-zich", "Shee-shee", "Phip-phip"], answer: "Zich-zich" },
        { question: "Did Sunu-sunu get wet in the storm?", options: ["Yes", "No"], answer: "No" }
      ]
    },
    "Zoo Manners": {
      content: `<h3><strong>Main focus: Respect for animals and proper behavior in public places</strong></h3>
<p><strong>Chapter summary:</strong> When you visit the Zoo, be careful what you say or do! Don't make fun of the Camel's hump or laugh too much at the Chimpanzee. Animals have feelings too. If you treat them with respect, you will always be <strong>welcome at the Zoo</strong>. This poem teaches <strong>empathy</strong> and manners when dealing with living creatures.</p>
<h3><strong>Key concepts:</strong></h3>
<ul>
<li>Vocabulary: Manners, hump, chimpanzee, penguin, strutting</li>
<li>The idea that animals are "wise" and "noble"</li>
<li>Social skills: How to behave in a public place like a zoo</li>
<li>Comparing animal features to human traits (the Chimpanzee thinks he's wise)</li>
</ul>`,
      quiz: [
        { question: "What should we be careful about at the Zoo?", options: ["What we eat", "What we say or do", "Where we walk", "What we wear"], answer: "What we say or do" },
        { question: "Which animal has a 'proud' hump?", options: ["Lion", "Camel", "Elephant", "Tiger"], answer: "Camel" },
        { question: "Who thinks he is as wise as you or me?", options: ["The Penguin", "The Chimpanzee", "The Bear", "The Snake"], answer: "The Chimpanzee" },
        { question: "Which birds can understand what you say (according to the poem)?", options: ["Parrots", "Penguins", "Sparrows", "Ducks"], answer: "Penguins" },
        { question: "The word 'Strutting' means ___.", options: ["Running fast", "Walking with pride", "Sleeping", "Eating"], answer: "Walking with pride" }
      ]
    },
    "Funny Bunny": {
      content: `<h3><strong>Main focus: Thinking before following others and being cautious</strong></h3>
<p><strong>Chapter summary:</strong> One day, a nut falls on Funny Bunny's head. He thinks the sky is falling! He goes to tell the King. On the way, he meets many animals (Henny Penny, Cocky Locky, etc.) who all follow him. Finally, they meet Woxy Foxy, who leads them into his den and eats them up! This story is a warning to <strong>not believe everything blindly</strong> and to beware of strangers.</p>
<h3><strong>Key concepts:</strong></h3>
<ul>
<li>Vocabulary: Falling, King, den, follow, together</li>
<li>Names with alliteration: Henny Penny, Ducky Lucky, Goosey Poosey</li>
<li>Theme: Foolishness and the danger of following the crowd</li>
<li>Logic: A falling nut is not the "sky falling"</li>
</ul>`,
      quiz: [
        { question: "What fell on Funny Bunny's head?", options: ["The sky", "A nut", "An apple", "A leaf"], answer: "A nut" },
        { question: "What did Funny Bunny think happened?", options: ["It was raining", "The sky was falling", "The King was calling", "He was hurt"], answer: "The sky was falling" },
        { question: "Who did Funny Bunny want to tell?", options: ["His Mom", "His friends", "The King", "The Doctor"], answer: "The King" },
        { question: "Who was the clever animal that ate everyone in the end?", options: ["Cocky Locky", "Woxy Foxy", "Ducky Lucky", "Lion"], answer: "Woxy Foxy" },
        { question: "Which animal did Funny Bunny meet FIRST?", options: ["Cocky Locky", "Henny Penny", "Lucky Ducky", "Foxy"], answer: "Henny Penny" }
      ]
    },
    "Mr Nobody": {
      content: `<h3><strong>Main focus: Responsibility and the habit of blaming others</strong></h3>
<p><strong>Chapter summary:</strong> Mr. Nobody is a quiet little man who does all the mischief in every house. He breaks plates, tears books, and leaves doors open. But no one ever sees his face! This poem is a humorous way to talk about <strong>taking responsibility</strong> for our mistakes instead of saying "I didn't do it" or blaming an invisible "Mr. Nobody."</p>
<h3><strong>Key concepts:</strong></h3>
<ul>
<li>Vocabulary: Mischief, quiet, cracked, mouse, agree</li>
<li>Rhyming words: Mouse/House, Face/Place</li>
<li>Theme: Honesty and accountability</li>
<li>The idea of a "funny" invisible character who does wrong</li>
</ul>`,
      quiz: [
        { question: "How is Mr. Nobody described?", options: ["Loud and big", "Quiet and little", "Strong and fast", "Scary"], answer: "Quiet and little" },
        { question: "Mr. Nobody is as quiet as a ___.", options: ["Cat", "Dog", "Mouse", "Rabbit"], answer: "Mouse" },
        { question: "Who does the mischief in every house?", options: ["The children", "The parents", "Mr. Nobody", "The pet"], answer: "Mr. Nobody" },
        { question: "Has anyone ever seen Mr. Nobody's face?", options: ["Yes", "No", "Only the kids", "Only the cat"], answer: "No" },
        { question: "When a plate is cracked, who is blamed?", options: ["The cook", "The child", "Mr. Nobody", "The wind"], answer: "Mr. Nobody" }
      ]
    },
    "Curlylocks and the Three Bears": {
      content: `<h3><strong>Main focus: Curisosity, boundaries, and consequences</strong></h3>
<p><strong>Chapter summary:</strong> Curlylocks enters a house in the forest while the Bear family is out. She eats their porridge (too hot, too cold, then just right), sits on their chairs (too big, too high, then breaks the small one), and sleeps in their beds. When the Bears return, they are surprised! Curlylocks wakes up, see them, and runs away. This classic story teaches about <strong>respecting other people's property</strong>.</p>
<h3><strong>Key concepts:</strong></h3>
<ul>
<li>Vocabulary: Porridge, forest, cottage, middle-size, tiny</li>
<li>Comparison: Hot/Cold, Big/Small, Hard/Soft</li>
<li>Sequencing: First, then, finally</li>
<li>Theme: Respecting privacy and property</li>
</ul>`,
      quiz: [
        { question: "Where was the house that Curlylocks went into?", options: ["In the city", "In the forest", "Near the beach", "On a hill"], answer: "In the forest" },
        { question: "Who lived in the cottage?", options: ["A family of rabbits", "A family of bears", "A giant", "A grandmother"], answer: "A family of bears" },
        { question: "Whose porridge did Curlylocks finish?", options: ["Papa Bear's", "Mama Bear's", "Baby Bear's", "She didn't eat any"], answer: "Baby Bear's" },
        { question: "What happened to the tiny chair when Curlylocks sat on it?", options: ["It was too high", "It was too hard", "It broke", "It was just right"], answer: "It broke" },
        { question: "Where did the Bears find Curlylocks sleeping?", options: ["In the kitchen", "In Papa Bear's bed", "In Mama Bear's bed", "In Baby Bear's bed"], answer: "In Baby Bear's bed" }
      ]
    },
    "Oont Chala": {
      content: "Welcome to the lesson on Oont Chala! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Oont Chala?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Oont Chala?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Bhalu Ne Kheli Football": {
      content: "Welcome to the lesson on Bhalu Ne Kheli Football! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Bhalu Ne Kheli Football?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Bhalu Ne Kheli Football?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Mera Parivar": {
      content: "Welcome to the lesson on Mera Parivar! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Mera Parivar?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Mera Parivar?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Adhyapak Ji": {
      content: "Welcome to the lesson on Adhyapak Ji! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Adhyapak Ji?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Adhyapak Ji?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Andher Nagari": {
      content: "Welcome to the lesson on Andher Nagari! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Andher Nagari?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Andher Nagari?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Budhiya Ki Topi": {
      content: "Welcome to the lesson on Budhiya Ki Topi! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Budhiya Ki Topi?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Budhiya Ki Topi?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Meethe Bol": {
      content: "Welcome to the lesson on Meethe Bol! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Meethe Bol?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Meethe Bol?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Titli Aur Kali": {
      content: "Welcome to the lesson on Titli Aur Kali! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Titli Aur Kali?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Titli Aur Kali?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Bulbul": {
      content: "Welcome to the lesson on Bulbul! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Bulbul?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Bulbul?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Mera Khilauna": {
      content: "Welcome to the lesson on Mera Khilauna! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Mera Khilauna?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Mera Khilauna?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "What is Long, What is Round?": {
      content: `<h3><strong>Main focus: Shapes — Roll vs Slide</strong></h3>
<p><strong>Chapter summary:</strong> Everything has a shape, and shapes move in special ways. <strong>Round things</strong> (ball, orange, marble) have no corners and like to <strong>Roll</strong>. <strong>Long things</strong> (pencil, scale, book) have flat sides and like to <strong>Slide</strong>. Some things like a coin can do both! A square box cannot roll because it has corners and flat sides.</p>
<h3><strong>Key concepts:</strong></h3>
<ul>
<li>Round things → <strong>Roll</strong> (ball, orange, ladoo)</li>
<li>Long / flat things → <strong>Slide</strong> (pencil, scale, matchbox)</li>
<li>Coin → can <strong>both slide AND roll</strong> depending on position</li>
<li>A square box cannot be used as a football because it has corners</li>
</ul>`,
      quiz: [
        { question: "Which of these will ROLL on the floor?", options: ["A pencil lying flat", "A matchbox", "An orange", "A ruler"], answer: "An orange" },
        { question: "If you push a matchbox on the floor, will it roll or slide?", options: ["Roll", "Slide", "Both", "Neither"], answer: "Slide" },
        { question: "A ladoo (round sweet) is which type of shape?", options: ["Long", "Flat", "Round", "Square"], answer: "Round" },
        { question: "Why can't we play football with a square box?", options: ["It is too small", "It has corners, so it does not roll properly", "It is too heavy", "It has no colour"], answer: "It has corners, so it does not roll properly" },
        { question: "A banana is best described as ___.", options: ["Round", "Long", "Flat", "Square"], answer: "Long" }
      ]
    },
    "Counting in Groups": {
      content: `<h3><strong>Main focus: Skip Counting — the secret of multiplication!</strong></h3>
<p><strong>Chapter summary:</strong> Instead of counting by ones, we count in <strong>Groups</strong>. If you have 3 groups of 2 cherries, count them as 2, 4, 6 — that is skip counting by 2s! If one bicycle has 2 wheels, then 3 bicycles have 6 wheels. It is like a frog jumping over numbers!</p>
<h3><strong>Key concepts:</strong></h3>
<ul>
<li>Count by <strong>2s</strong>: 2, 4, 6, 8, 10…</li>
<li>Count by <strong>5s</strong>: 5, 10, 15, 20, 25…</li>
<li>Count by <strong>10s</strong>: 10, 20, 30, 40…</li>
<li>4 hands × 5 fingers = 20 fingers total</li>
</ul>`,
      quiz: [
        { question: "Count by 2s: 2, 4, 6, ___, ___", options: ["7, 8", "8, 10", "8, 9", "9, 11"], answer: "8, 10" },
        { question: "One bicycle has 2 wheels. How many wheels do 3 bicycles have?", options: ["3", "5", "6", "4"], answer: "6" },
        { question: "Count by 5s: 5, 10, 15, ___, ___", options: ["16, 17", "20, 25", "18, 20", "19, 24"], answer: "20, 25" },
        { question: "There are 4 hands. Each hand has 5 fingers. How many fingers in total?", options: ["15", "9", "25", "20"], answer: "20" },
        { question: "Skip counting by 2s is like a ___.", options: ["Turtle walking slowly", "Frog jumping over numbers", "Fish swimming backwards", "Snail moving one step"], answer: "Frog jumping over numbers" }
      ]
    },
    "How Much Can You Carry?": {
      content: `<h3><strong>Main focus: Weight — Heavier and Lighter</strong></h3>
<p><strong>Chapter summary:</strong> We compare weights using a <strong>balance (weighing scale)</strong>. The heavier side goes down and the lighter side goes up. We can also use nonstandard units like small stones or blocks to measure weight. This chapter introduces us to comparing and estimating weight.</p>
<h3><strong>Key concepts:</strong></h3>
<ul>
<li>Heavier object makes the balance go <strong>down</strong></li>
<li>Lighter object goes <strong>up</strong> on the balance</li>
<li>We can use stones, blocks, or any equal objects to measure weight</li>
<li>Compare: a book vs a pencil → the book is heavier</li>
</ul>`,
      quiz: [
        { question: "On a balance, the heavier object will go ___.", options: ["Up", "Down", "Sideways", "Stay in the middle"], answer: "Down" },
        { question: "Which is heavier: a feather or a stone?", options: ["Feather", "Stone", "Both are equal", "Cannot say"], answer: "Stone" },
        { question: "We use a balance to compare ___.", options: ["Height", "Length", "Weight", "Colour"], answer: "Weight" },
        { question: "If a book weighs 5 blocks and a pencil weighs 1 block, which is heavier?", options: ["Pencil", "Both equal", "Book", "Block"], answer: "Book" },
        { question: "The lighter object on a balance goes ___.", options: ["Down", "Up", "Left", "Right"], answer: "Up" }
      ]
    },
    "Counting in Tens": {
      content: `<h3><strong>Main focus: Grouping into tens for fast counting</strong></h3>
<p><strong>Chapter summary:</strong> When we have many objects, we group them into <strong>bundles of 10</strong> to count faster. 20 = 2 bundles of 10. 50 = 5 bundles of 10. We count by tens: 10, 20, 30, 40, 50… This is the foundation of our whole number system!</p>
<h3><strong>Key concepts:</strong></h3>
<ul>
<li>10 objects = 1 bundle / 1 Ten</li>
<li>20 = 2 Tens, 50 = 5 Tens, 100 = 10 Tens</li>
<li>Counting by 10s: 10, 20, 30, 40, 50, 60, 70, 80, 90, 100</li>
<li>The Tens digit tells us how many bundles there are</li>
</ul>`,
      quiz: [
        { question: "How many tens are in 40?", options: ["2", "4", "40", "1"], answer: "4" },
        { question: "Count by tens: 30, 40, 50, ___", options: ["55", "51", "60", "45"], answer: "60" },
        { question: "30 objects = ___ bundles of ten", options: ["10", "1", "30", "3"], answer: "3" },
        { question: "What comes after 90 when counting by tens?", options: ["91", "95", "100", "99"], answer: "100" },
        { question: "Which number has 7 Tens?", options: ["17", "7", "70", "77"], answer: "70" }
      ]
    },
    "Footprints": {
      content: `<h3><strong>Main focus: Measuring length using footsteps and body parts</strong></h3>
<p><strong>Chapter summary:</strong> Before we use a ruler, we can measure length using <strong>footsteps</strong>, our <strong>handspan</strong>, or a <strong>string</strong>. Different people get different measurements for the same object because body sizes differ. This shows why we eventually need a standard unit. We compare lengths using words: <strong>Longer / Shorter / Taller</strong>.</p>
<h3><strong>Key concepts:</strong></h3>
<ul>
<li>Measuring with <strong>footsteps</strong>: count steps to find length</li>
<li>Measuring with <strong>handspan</strong>: thumb to little finger</li>
<li>Different people get different counts for the same length</li>
<li>Compare: <strong>Longer, Shorter, Taller, Same length</strong></li>
</ul>`,
      quiz: [
        { question: "We measure length using footsteps by ___.", options: ["Drawing footprints", "Counting how many steps fit the length", "Weighing our feet", "Comparing colours"], answer: "Counting how many steps fit the length" },
        { question: "Why might two children get different footstep counts for the same table?", options: ["They counted wrong", "Their feet are different sizes", "The table moved", "They used different numbers"], answer: "Their feet are different sizes" },
        { question: "A pencil is 3 handspans long. A book is 5 handspans long. Which is longer?", options: ["Pencil", "Book", "Both are same", "Cannot say"], answer: "Book" },
        { question: "Which word compares two lengths?", options: ["Heavier", "Taller", "Hotter", "Louder"], answer: "Taller" },
        { question: "We measure length without a ruler using ___.", options: ["A clock", "A balance", "A handspan or footstep", "A coin"], answer: "A handspan or footstep" }
      ]
    },
    "Jugs and Mugs": {
      content: `<h3><strong>Main focus: Capacity — how much a container holds</strong></h3>
<p><strong>Chapter summary:</strong> Capacity is <strong>how much liquid a container can hold</strong>. A jug holds more water than a mug. We compare capacity using: <strong>More / Less / Same</strong>. We can also measure capacity by counting how many small cups fill a big jug. This is our first step toward understanding litres!</p>
<h3><strong>Key concepts:</strong></h3>
<ul>
<li><strong>Capacity</strong> = how much a container holds</li>
<li>A <strong>jug</strong> holds more than a <strong>mug</strong></li>
<li>Compare capacity: <strong>More, Less, Same</strong></li>
<li>Count how many small cups fill a big container</li>
</ul>`,
      quiz: [
        { question: "Capacity means ___.", options: ["The weight of a container", "How much a container can hold", "The height of a container", "The colour of a container"], answer: "How much a container can hold" },
        { question: "A jug holds 6 cups of water. A bottle holds 4 cups. Which holds more?", options: ["Bottle", "Cup", "Jug", "Both same"], answer: "Jug" },
        { question: "Which container holds LESS water?", options: ["A bucket", "A swimming pool", "A teaspoon", "A drum"], answer: "A teaspoon" },
        { question: "We compare capacity using the words ___.", options: ["Taller / Shorter", "Heavier / Lighter", "More / Less / Same", "Near / Far"], answer: "More / Less / Same" },
        { question: "How many glasses of water does it take to fill a bottle? This question is about ___.", options: ["Weight", "Length", "Capacity", "Time"], answer: "Capacity" }
      ]
    },
    "Tens and Ones": {
      content: `<h3><strong>Main focus: Place value — Tens digit and Ones digit</strong></h3>
<p><strong>Chapter summary:</strong> Every 2-digit number has a <strong>Tens place</strong> and a <strong>Ones place</strong>. In 34, the 3 is in the Tens place (= 30) and the 4 is in the Ones place (= 4). So 34 = 3 Tens + 4 Ones. This is called <strong>place value</strong> and is the most important idea in our number system!</p>
<h3><strong>Key concepts:</strong></h3>
<ul>
<li>In any 2-digit number: <strong>left digit = Tens, right digit = Ones</strong></li>
<li>34 = 3 Tens + 4 Ones = 30 + 4</li>
<li>57 = 5 Tens + 7 Ones = 50 + 7</li>
<li>The Tens digit is always worth 10 times more than its face value</li>
</ul>`,
      quiz: [
        { question: "In the number 47, the digit 4 is in the ___ place.", options: ["Ones", "Hundreds", "Tens", "Units"], answer: "Tens" },
        { question: "What is the value of the digit 6 in the number 68?", options: ["6", "8", "60", "68"], answer: "60" },
        { question: "35 = 3 Tens + ___ Ones", options: ["3", "35", "5", "30"], answer: "5" },
        { question: "Which number has 5 in the Tens place?", options: ["25", "52", "15", "55"], answer: "52" },
        { question: "In 2-digit numbers, which digit do we look at FIRST to compare?", options: ["The Ones digit", "Both digits", "The Tens digit", "The last digit"], answer: "The Tens digit" }
      ]
    },
    "My Funday": {
      content: `<h3><strong>Main focus: Money — Indian coins and notes</strong></h3>
<p><strong>Chapter summary:</strong> In India we use <strong>Rupees (₹)</strong>. We have coins: ₹1, ₹2, ₹5, ₹10, and notes: ₹10, ₹20, ₹50. To buy something, we count our money and check if we have enough. If a chocolate costs ₹10, we can give one ₹10 note OR five ₹2 coins — both are equal!</p>
<h3><strong>Key concepts:</strong></h3>
<ul>
<li>Indian currency: coins (₹1, ₹2, ₹5, ₹10) and notes (₹10, ₹20, ₹50)</li>
<li>Count money to find the total amount</li>
<li>Compare prices: ₹50 is more than ₹20</li>
<li>Change = Amount given − Price paid</li>
</ul>`,
      quiz: [
        { question: "How many ₹1 coins make ₹5?", options: ["1", "10", "3", "5"], answer: "5" },
        { question: "An eraser costs ₹3 and a pencil costs ₹5. How much money do you need in total?", options: ["₹2", "₹15", "₹8", "₹9"], answer: "₹8" },
        { question: "Which is more: ₹20 or ₹50?", options: ["₹20", "₹50", "Both are equal", "Cannot say"], answer: "₹50" },
        { question: "You have ₹10. You buy a candy for ₹7. How much change do you get?", options: ["₹17", "₹3", "₹4", "₹7"], answer: "₹3" },
        { question: "Indian money is measured in ___.", options: ["Dollars", "Pounds", "Rupees", "Euros"], answer: "Rupees" }
      ]
    },
    "Add Our Points": {
      content: `<h3><strong>Main focus: Addition up to 20 using counting on</strong></h3>
<p><strong>Chapter summary:</strong> To add bigger numbers, use the <strong>Counting On</strong> trick. To add 12 + 3, start at 12 and count 3 steps forward: "13, 14, 15!" There are 12 carrots and 7 radishes in a garden — how many vegetables in total? 12 + 7 = 19.</p>
<h3><strong>Key concepts:</strong></h3>
<ul>
<li><strong>Counting On:</strong> Start at the bigger number, count forward</li>
<li>11 + 5 = 16 (start at 11, count 5 steps: 12, 13, 14, 15, 16)</li>
<li>10 + 10 = 20</li>
<li>Adding numbers in a story problem step by step</li>
</ul>`,
      quiz: [
        { question: "11 + 5 = ___ (Count on from 11)", options: ["15", "16", "17", "14"], answer: "16" },
        { question: "10 + 10 = ___", options: ["100", "11", "20", "10"], answer: "20" },
        { question: "There are 12 carrots and 7 radishes. How many vegetables in total?", options: ["5", "20", "18", "19"], answer: "19" },
        { question: "To use the 'Counting On' trick for 13 + 4, you start at ___.", options: ["4", "1", "13", "17"], answer: "13" },
        { question: "What is 8 + 6?", options: ["12", "13", "15", "14"], answer: "14" }
      ]
    },
    "Lines and Lines": {
      content: `<h3><strong>Main focus: Types of lines and basic geometry</strong></h3>
<p><strong>Chapter summary:</strong> Lines are everywhere! A <strong>straight line</strong> goes from one point to another without bending. A <strong>curved line</strong> bends. Lines can be <strong>horizontal</strong> (sleeping flat), <strong>vertical</strong> (standing up), or <strong>slanting</strong> (tilted). Shapes are made of lines — a triangle has 3 straight lines, a circle has one curved line.</p>
<h3><strong>Key concepts:</strong></h3>
<ul>
<li><strong>Straight line</strong>: goes directly, no bending</li>
<li><strong>Curved line</strong>: bends or curves</li>
<li><strong>Horizontal</strong>: lying flat (like the horizon)</li>
<li><strong>Vertical</strong>: standing straight up</li>
<li><strong>Slanting</strong>: tilted at an angle</li>
</ul>`,
      quiz: [
        { question: "A line that bends is called a ___ line.", options: ["Straight", "Vertical", "Curved", "Horizontal"], answer: "Curved" },
        { question: "The horizon where the sky meets the ground is an example of a ___ line.", options: ["Vertical", "Curved", "Slanting", "Horizontal"], answer: "Horizontal" },
        { question: "A triangle is made of ___ straight lines.", options: ["2", "4", "3", "5"], answer: "3" },
        { question: "A flagpole standing upright is an example of a ___ line.", options: ["Horizontal", "Curved", "Vertical", "Slanting"], answer: "Vertical" },
        { question: "A circle is made of ___.", options: ["4 straight lines", "3 straight lines", "1 curved line", "2 curved lines"], answer: "1 curved line" }
      ]
    },
    "Give and Take": {
      content: `<h3><strong>Main focus: Subtraction up to 20 using counting back</strong></h3>
<p><strong>Chapter summary:</strong> To subtract bigger numbers, use the <strong>Counting Back</strong> trick. To find 15 − 4, start at 15 and count back 4 steps: "14, 13, 12, 11!" A farmer had 18 eggs and 5 broke: 18 − 5 = 13. Money problems also use subtraction: you have ₹10, buy a candy for ₹7, change = ₹3.</p>
<h3><strong>Key concepts:</strong></h3>
<ul>
<li><strong>Counting Back:</strong> Start at the big number, count backward</li>
<li>15 − 4 = 11 (count back: 14, 13, 12, 11)</li>
<li>Subtraction in shopping: change = amount given − price</li>
<li>Subtracting 0 gives the same number</li>
</ul>`,
      quiz: [
        { question: "15 − 4 = ___ (Count back from 15)", options: ["10", "9", "12", "11"], answer: "11" },
        { question: "A farmer had 18 eggs. 5 broke. How many are left?", options: ["23", "12", "13", "14"], answer: "13" },
        { question: "You have ₹10. You buy a candy for ₹7. How much change do you get?", options: ["₹17", "₹2", "₹4", "₹3"], answer: "₹3" },
        { question: "20 − 0 = ___", options: ["0", "10", "20", "1"], answer: "20" },
        { question: "To use Counting Back for 17 − 3, you start at ___.", options: ["3", "14", "17", "0"], answer: "17" }
      ]
    },
    "The Longest Step": {
      content: `<h3><strong>Main focus: Comparing and ordering lengths</strong></h3>
<p><strong>Chapter summary:</strong> We measure the length of a step using a string or chalk mark. Then we compare steps: whose step is the <strong>longest</strong>? Whose is the <strong>shortest</strong>? We can also order objects from shortest to longest. This chapter builds the skill of comparing and ordering measurements.</p>
<h3><strong>Key concepts:</strong></h3>
<ul>
<li>Measure a step by marking its start and end</li>
<li>Order steps: <strong>Shortest → Longest</strong></li>
<li>Use strings to compare curved or irregular lengths</li>
<li>The <strong>longest</strong> step covers the most distance</li>
</ul>`,
      quiz: [
        { question: "To find the longest step, you need to ___.", options: ["Count the number of toes", "Compare the length of each step", "Weigh each person", "Measure height"], answer: "Compare the length of each step" },
        { question: "Rohan's step is 50 cm. Priya's step is 40 cm. Whose step is longer?", options: ["Priya's", "Both are same", "Rohan's", "Cannot say"], answer: "Rohan's" },
        { question: "To compare a curved path and a straight path, we can use a ___.", options: ["Ruler", "Clock", "String", "Balance"], answer: "String" },
        { question: "Arranging objects from shortest to longest means ordering by ___.", options: ["Colour", "Weight", "Length", "Time"], answer: "Length" },
        { question: "Which unit do we use for big lengths like a road?", options: ["Grams", "Litres", "Kilometres", "Seconds"], answer: "Kilometres" }
      ]
    },
    "Birds Come, Birds Go": {
      content: `<h3><strong>Main focus: Subtraction as difference and data from a table</strong></h3>
<p><strong>Chapter summary:</strong> Birds arrive and birds fly away — we use subtraction to find how many are left! We also look at simple tables of data: if 15 birds came and 6 flew away, 15 − 6 = 9 are left. We learn to read information from a picture or table and answer questions using addition and subtraction.</p>
<h3><strong>Key concepts:</strong></h3>
<ul>
<li>Subtraction finds <strong>how many are left</strong> after some go away</li>
<li>Read data from a <strong>table or picture</strong></li>
<li>15 birds − 6 that flew away = 9 remaining</li>
<li>Addition to find total; subtraction to find difference</li>
</ul>`,
      quiz: [
        { question: "15 birds sat on a tree. 6 flew away. How many are left?", options: ["21", "10", "9", "8"], answer: "9" },
        { question: "Birds Come, Birds Go teaches us to use ___ to find how many remain.", options: ["Addition", "Subtraction", "Multiplication", "Patterns"], answer: "Subtraction" },
        { question: "A table shows 8 sparrows and 5 pigeons. How many birds in total?", options: ["3", "13", "40", "85"], answer: "13" },
        { question: "Reading information from a picture or chart to answer questions is called ___.", options: ["Data reading", "Measurement", "Pattern making", "Skip counting"], answer: "Data reading" },
        { question: "20 birds were on a wire. 11 flew off. How many are still on the wire?", options: ["31", "9", "10", "11"], answer: "9" }
      ]
    },
    "Family": {
      content: `<h3><strong>Main focus: Living together and caring for each other</strong></h3>
<p><strong>Chapter summary:</strong> A family is a group of people who live together and love each other. We learn that every family is special. Some are big (joint family) and some are small (nuclear family). Families celebrate festivals, share meals, and help each other during difficult times. This chapter teaches the importance of <strong>cooperation</strong> and <strong>respect</strong> within the home.</p>
<h3><strong>Key concepts:</strong></h3>
<ul>
<li>Types of families: Nuclear, Joint, Single-parent</li>
<li>Relationships: Grandparents, parents, siblings, cousins</li>
<li>Roles and responsibilities of family members</li>
<li>Celebrating special occasions together</li>
</ul>`,
      quiz: [
        { question: "A family with parents and one or two children is a ___ family.", options: ["Big", "Nuclear", "Joint", "Neighbourhood"], answer: "Nuclear" },
        { question: "Your father's brother is your ___.", options: ["Grandfather", "Cousin", "Uncle", "Nephew"], answer: "Uncle" },
        { question: "What is the most important thing in a family?", options: ["Fighting", "Ignoring each other", "Love and care", "Watching TV"], answer: "Love and care" },
        { question: "In a joint family, who usually lives together?", options: ["Only parents and children", "Only grandparents", "Many relatives like grandparents, uncles, and cousins", "Only friends"], answer: "Many relatives like grandparents, uncles, and cousins" },
        { question: "We should ___ our elders in the family.", options: ["Ignore", "Shout at", "Respect", "Tease"], answer: "Respect" }
      ]
    },
    "Food for Us": {
      content: `<h3><strong>Main focus: Why we need food and different types of food</strong></h3>
<p><strong>Chapter summary:</strong> Food is essential for life. It gives us energy to work and play, helps us grow, and protects us from diseases. We get food from both <strong>plants</strong> (fruits, vegetables, grains) and <strong>animals</strong> (milk, eggs, meat). A balanced diet with clean water and healthy habits like washing hands is the secret to a strong body.</p>
<h3><strong>Key concepts:</strong></h3>
<ul>
<li>Energy-giving food: Rice, potato, sugar</li>
<li>Body-building food: Pulses, milk, eggs</li>
<li>Protective food: Fruits and vegetables</li>
<li>Good eating habits and hygiene</li>
</ul>`,
      quiz: [
        { question: "Which of these gives us energy?", options: ["Water", "Rice and sugar", "Salt", "Nothing"], answer: "Rice and sugar" },
        { question: "Milk and pulses help our body to ___.", options: ["Sleep", "Grow", "Get tired", "Fly"], answer: "Grow" },
        { question: "Fruits and vegetables are called ___ food.", options: ["Bad", "Energy", "Protective", "Junk"], answer: "Protective" },
        { question: "We should eat ___ food to stay healthy.", options: ["Uncovered", "Stale", "Fresh and clean", "Junk"], answer: "Fresh and clean" },
        { question: "Which food do we get from animals?", options: ["Apple", "Rice", "Eggs", "Carrot"], answer: "Eggs" }
      ]
    },
    "Shelter": {
      content: `<h3><strong>Main focus: Different types of houses and their importance</strong></h3>
<p><strong>Chapter summary:</strong> A house protects us from heat, cold, rain, and wild animals. It is our <strong>shelter</strong>. Different places have different types of houses: <strong>Kucha houses</strong> (made of mud/straw) are common in villages, while <strong>Pucca houses</strong> (made of bricks/cement) are found in towns. We also learn about special houses like igloos, houseboats, and tents.</p>
<h3><strong>Key concepts:</strong></h3>
<ul>
<li>Need for a house: Safety and comfort</li>
<li>Types of houses: Kucha and Pucca</li>
<li>Rooms in a house and their uses</li>
<li>A clean house is a healthy house</li>
</ul>`,
      quiz: [
        { question: "A house made of mud and straw is a ___ house.", options: ["Pucca", "Strong", "Kucha", "Big"], answer: "Kucha" },
        { question: "Which of these is used to build a Pucca house?", options: ["Mud", "Straw", "Bricks and cement", "Dry leaves"], answer: "Bricks and cement" },
        { question: "An igloo is a house made of ___.", options: ["Bricks", "Snow/Ice", "Wood", "Cloth"], answer: "Snow/Ice" },
        { question: "A house that can move from place to place is a ___.", options: ["Bungalow", "Flat", "Tent", "Hut"], answer: "Tent" },
        { question: "We should keep our house ___.", options: ["Dirty", "Dusty", "Clean and tidy", "Messy"], answer: "Clean and tidy" }
      ]
    },
    "Travel": {
      content: `<h3><strong>Main focus: Means of transport and safety rules</strong></h3>
<p><strong>Chapter summary:</strong> We use different <strong>means of transport</strong> to travel from one place to another. <strong>Land transport</strong> includes cars, buses, and trains. <strong>Water transport</strong> includes ships and boats. <strong>Air transport</strong> is the fastest way to travel. We must always follow safety rules on the road, like wearing a helmet or crossing at the zebra crossing.</p>
<h3><strong>Key concepts:</strong></h3>
<ul>
<li>Land, Water, and Air transport</li>
<li>Fastest and slowest means of transport</li>
<li>Road safety signs and rules</li>
<li>Need for transport in daily life</li>
</ul>`,
      quiz: [
        { question: "Which is the fastest means of transport?", options: ["Bus", "Train", "Aeroplane", "Bicycle"], answer: "Aeroplane" },
        { question: "A ship is a means of ___ transport.", options: ["Land", "Water", "Air", "Space"], answer: "Water" },
        { question: "Where should we cross the road?", options: ["Anywhere", "At the Zebra crossing", "Running fast", "Between cars"], answer: "At the Zebra crossing" },
        { question: "Which of these has two wheels?", options: ["Car", "Bus", "Bicycle", "Auto-rickshaw"], answer: "Bicycle" },
        { question: "Traffic light: Green means ___.", options: ["Stop", "Wait", "Go", "Look"], answer: "Go" }
      ]
    },
    "Plants and Animals": {
      content: `<h3><strong>Main focus: Living things in nature</strong></h3>
<p><strong>Chapter summary:</strong> Plants and animals are living things that share our world. Plants give us oxygen, food, and shade. Animals provide us with milk, eggs, and wool, or help us carry loads. We learn that we must be <strong>kind to animals</strong> and <strong>take care of plants</strong> because our life depends on them.</p>
<h3><strong>Key concepts:</strong></h3>
<ul>
<li>Uses of plants: Oxygen, food, wood</li>
<li>Uses of animals: Food, transport, wool</li>
<li>Different parts of plants</li>
<li>Domestic vs Wild animals</li>
</ul>`,
      quiz: [
        { question: "What do plants give us that helps us breathe?", options: ["Water", "Oxygen", "Food", "Soil"], answer: "Oxygen" },
        { question: "Which animal gives us wool?", options: ["Cow", "Hen", "Sheep", "Dog"], answer: "Sheep" },
        { question: "The part of the plant that grows under the soil is the ___.", options: ["Leaf", "Stem", "Flower", "Root"], answer: "Root" },
        { question: "A lion is a ___ animal.", options: ["Pet", "Wild", "Domestic", "Friendly"], answer: "Wild" },
        { question: "Which of these do we get from plants?", options: ["Eggs", "Milk", "Fruits", "Meat"], answer: "Fruits" }
      ]
    },
    "Neighbourhood": {
      content: `<h3><strong>Main focus: Places and people around us</strong></h3>
<p><strong>Chapter summary:</strong> The area around our house is our <strong>neighbourhood</strong>. We find many useful places there: the <strong>Market</strong> for shopping, the <strong>Hospital</strong> for treatment, the <strong>Police Station</strong> for safety, and the <strong>Post Office</strong> for sending letters. Good neighbours help each other and keep the neighbourhood clean.</p>
<h3><strong>Key concepts:</strong></h3>
<ul>
<li>Important places in the neighbourhood</li>
<li>Roles of community helpers</li>
<li>Being a good neighbour</li>
<li>Keeping our surroundings clean</li>
</ul>`,
      quiz: [
        { question: "Where do we go when we are sick?", options: ["School", "Market", "Hospital", "Park"], answer: "Hospital" },
        { question: "The place where we go to buy things is the ___.", options: ["Post Office", "Market", "Police Station", "Bank"], answer: "Market" },
        { question: "Who keeps our neighbourhood safe?", options: ["Postman", "Police Officer", "Doctor", "Tailor"], answer: "Police Officer" },
        { question: "A person living near our house is our ___.", options: ["Relative", "Teacher", "Neighbour", "Guest"], answer: "Neighbour" },
        { question: "Where do we go to post a letter?", options: ["Bank", "Post Office", "Hospital", "Library"], answer: "Post Office" }
      ]
    },
    "My School": {
      content: `<h3><strong>Main focus: Learning and growing at school</strong></h3>
<p><strong>Chapter summary:</strong> School is a temple of learning. We learn to read, write, draw, and play games there. We also learn <strong>good manners</strong> and values. Our teachers guide us to become good citizens. We should respect our teachers, make friends, and keep our school clean.</p>
<h3><strong>Key concepts:</strong></h3>
<ul>
<li>Places in school: Classroom, Library, Playground</li>
<li>People in school: Principal, Teachers, Friends</li>
<li>Learning subjects and activities</li>
<li>School rules and discipline</li>
</ul>`,
      quiz: [
        { question: "We go to school to ___.", options: ["Sleep", "Learn and study", "Fight", "Watch TV"], answer: "Learn and study" },
        { question: "The head of the school is the ___.", options: ["Peon", "Teacher", "Principal", "Student"], answer: "Principal" },
        { question: "Where do we play games in school?", options: ["Classroom", "Library", "Playground", "Office"], answer: "Playground" },
        { question: "Who teaches us in the classroom?", options: ["Doctor", "Postman", "Teacher", "Policeman"], answer: "Teacher" },
        { question: "We find many books to read in the school ___.", options: ["Canteen", "Library", "Garden", "Bus"], answer: "Library" }
      ]
    },
    "Festivals": {
      content: `<h3><strong>Main focus: Celebrating together with joy</strong></h3>
<p><strong>Chapter summary:</strong> India is a land of festivals! We celebrate <strong>National Festivals</strong> like Independence Day and <strong>Religious Festivals</strong> like Diwali, Eid, and Christmas. Festivals bring people together. We wear new clothes, eat special food, and share happiness with everyone.</p>
<h3><strong>Key concepts:</strong></h3>
<ul>
<li>National Festivals: Independence Day, Republic Day, Gandhi Jayanti</li>
<li>Religious Festivals: Diwali, Holi, Eid, Christmas, Gurpurab</li>
<li>How we celebrate: Decorations, sweets, prayers</li>
<li>Values: Unity and sharing</li>
</ul>`,
      quiz: [
        { question: "When do we celebrate Independence Day?", options: ["26th January", "15th August", "2nd October", "25th December"], answer: "15th August" },
        { question: "Diwali is also called the Festival of ___.", options: ["Colours", "Lights", "Flowers", "Rain"], answer: "Lights" },
        { question: "On which festival do we play with colours?", options: ["Eid", "Christmas", "Holi", "Diwali"], answer: "Holi" },
        { question: "Whose birthday is celebrated on 2nd October?", options: ["Jawaharlal Nehru", "Mahatma Gandhi", "Subhas Chandra Bose", "Bhagat Singh"], answer: "Mahatma Gandhi" },
        { question: "Special sweet dish 'Sewaiyan' is prepared on ___.", options: ["Diwali", "Eid", "Christmas", "Holi"], answer: "Eid" }
      ]
    },
    "Air and Water": {
      content: `<h3><strong>Main focus: Essential elements for life</strong></h3>
<p><strong>Chapter summary:</strong> All living things need air and water to survive. <strong>Air</strong> is everywhere; we can feel it but not see it. Clean air is important for breathing. <strong>Water</strong> is used for drinking, bathing, and cleaning. We must not waste water or pollute the air and water around us.</p>
<h3><strong>Key concepts:</strong></h3>
<ul>
<li>Moving air is called wind</li>
<li>Uses of water: Drinking, cooking, washing, farming</li>
<li>Sources of water: Rain, rivers, wells</li>
<li>Saving water and preventing pollution</li>
</ul>`,
      quiz: [
        { question: "Moving air is called ___.", options: ["Cloud", "Rain", "Wind", "Storm"], answer: "Wind" },
        { question: "We need water for ___.", options: ["Breathing", "Drinking", "Flying", "Thinking"], answer: "Drinking" },
        { question: "The main source of water on earth is ___.", options: ["Taps", "Bottles", "Rain", "Pipes"], answer: "Rain" },
        { question: "We should ___ the tap while brushing our teeth.", options: ["Keep open", "Close", "Break", "Forget"], answer: "Close" },
        { question: "Dirty air can make us ___.", options: ["Strong", "Happy", "Sick", "Rich"], answer: "Sick" }
      ]
    },
    "Weather and Seasons": {
      content: `<h3><strong>Main focus: Changes in the environment</strong></h3>
<p><strong>Chapter summary:</strong> The weather changes every day. Sometimes it is sunny, sometimes rainy, and sometimes windy. When the same weather continues for a long time, it is called a <strong>Season</strong>. In India, we have five main seasons: Summer, Winter, Monsoon, Spring, and Autumn.</p>
<h3><strong>Key concepts:</strong></h3>
<ul>
<li>Seasons: Summer (hot), Winter (cold), Monsoon (rainy)</li>
<li>Spring and Autumn: Transition seasons</li>
<li>Clothes and food according to seasons</li>
<li>How seasons affect our lives</li>
</ul>`,
      quiz: [
        { question: "In which season do we wear woollen clothes?", options: ["Summer", "Monsoon", "Winter", "Spring"], answer: "Winter" },
        { question: "We use an umbrella during the ___ season.", options: ["Autumn", "Winter", "Monsoon", "Summer"], answer: "Monsoon" },
        { question: "The season when it is very hot is ___.", options: ["Winter", "Summer", "Spring", "Autumn"], answer: "Summer" },
        { question: "In which season do flowers bloom everywhere?", options: ["Winter", "Summer", "Spring", "Monsoon"], answer: "Spring" },
        { question: "Cotton clothes keep us ___.", options: ["Warm", "Cool", "Wet", "Heavy"], answer: "Cool" }
      ]
    },
    "Poonam’s Day Out": {
      content: `<h3><strong>Main focus: Observation of animals in the surroundings</strong></h3>
<p><strong>Chapter summary:</strong> Poonam stays at home because she is sick, but she observes many animals in her garden. She sees birds on trees, insects on leaves, and animals near the pond. We learn that animals live in different places: some on land, some in water, and some on trees. This chapter builds <strong>observation skills</strong> and curiosity about nature.</p>
<h3><strong>Key concepts:</strong></h3>
<ul>
<li>Where animals live: Land, Water, Trees, Air</li>
<li>Animal movements: Walk, Fly, Crawl, Hop, Swim</li>
<li>Sounds made by different animals</li>
<li>Observation of local biodiversity</li>
</ul>`,
      quiz: [
        { question: "Where do fish live?", options: ["Trees", "Land", "Water", "Air"], answer: "Water" },
        { question: "Which animal can hop?", options: ["Snake", "Frog", "Fish", "Elephant"], answer: "Frog" },
        { question: "Birds have ___ to help them fly.", options: ["Fins", "Wings", "Gills", "Hands"], answer: "Wings" },
        { question: "Which of these animals lives on a tree?", options: ["Cow", "Monkey", "Crocodile", "Tiger"], answer: "Monkey" },
        { question: "A snake moves by ___.", options: ["Walking", "Flying", "Crawling", "Swimming"], answer: "Crawling" }
      ]
    },
    "The Plant Fairy": {
      content: `<h3><strong>Main focus: Diversity in plants — leaves, trunks, and flowers</strong></h3>
<p><strong>Chapter summary:</strong> Children play a game called 'The Plant Fairy' where they touch different plants. They notice that plants come in all sizes and shapes. Some have thin trunks, while others have thick ones. Leaves also vary in colour, shape, and margin. We learn to <strong>appreciate the variety</strong> in the plant kingdom and identify plants by their features.</p>
<h3><strong>Key concepts:</strong></h3>
<ul>
<li>Types of plants: Trees, Shrubs, Herbs, Climbers, Creepers</li>
<li>Parts of a plant: Root, Stem, Leaf, Flower, Fruit</li>
<li>Diversity in leaves: Shape, size, and smell</li>
<li>Texture of tree trunks: Smooth vs Rough</li>
</ul>`,
      quiz: [
        { question: "The part of the plant that makes food is the ___.", options: ["Root", "Stem", "Leaf", "Flower"], answer: "Leaf" },
        { question: "A big, strong plant with a thick trunk is called a ___.", options: ["Herb", "Shrub", "Tree", "Climber"], answer: "Tree" },
        { question: "Leaves are usually ___ in colour.", options: ["Red", "Blue", "Green", "Yellow"], answer: "Green" },
        { question: "Which of these plants needs support to grow up?", options: ["Rose", "Mango", "Money plant", "Grass"], answer: "Money plant" },
        { question: "The thick woody stem of a tree is called the ___.", options: ["Branch", "Trunk", "Twig", "Root"], answer: "Trunk" }
      ]
    },
    "Water O Water": {
      content: `<h3><strong>Main focus: Importance, sources, and forms of water</strong></h3>
<p><strong>Chapter summary:</strong> Water is life! This chapter explores the many uses of water — from quenching thirst to farming and industry. We learn about <strong>sources of water</strong> like rain, rivers, lakes, and ground water. Water exists in three forms: Ice (solid), Water (liquid), and Vapour (gas). We must use water wisely and keep our water bodies clean.</p>
<h3><strong>Key concepts:</strong></h3>
<ul>
<li>Uses of water in daily life</li>
<li>Natural and man-made sources of water</li>
<li>Forms of water: Solid, Liquid, Gas</li>
<li>Conservation of water: Reduce, Reuse, Recycle</li>
</ul>`,
      quiz: [
        { question: "Which of these is a natural source of water?", options: ["Tap", "Tank", "River", "Bottle"], answer: "River" },
        { question: "The solid form of water is ___.", options: ["Steam", "Rain", "Ice", "Dew"], answer: "Ice" },
        { question: "What is the process of water changing into vapour called?", options: ["Freezing", "Evaporation", "Melting", "Condensation"], answer: "Evaporation" },
        { question: "We should ___ rainwater to use later.", options: ["Waste", "Ignore", "Harvest/Collect", "Throw"], answer: "Harvest/Collect" },
        { question: "Water is needed by ___.", options: ["Only humans", "Only plants", "Only animals", "All living things"], answer: "All living things" }
      ]
    },
    "Our First School": {
      content: `<h3><strong>Main focus: Family as the primary source of learning</strong></h3>
<p><strong>Chapter summary:</strong> Before we go to a real school, our <strong>family</strong> is our first school. We learn our first words, manners, and habits from our family members. We learn to love, share, and respect others at home. This chapter highlights that family values form the foundation of our personality.</p>
<h3><strong>Key concepts:</strong></h3>
<ul>
<li>Family as the 'First School'</li>
<li>Learning values and habits from elders</li>
<li>Similarities between family members (heredity)</li>
<li>Helping each other in the family</li>
</ul>`,
      quiz: [
        { question: "Which is our first school?", options: ["Play school", "Primary school", "Family", "Library"], answer: "Family" },
        { question: "We learn ___ from our family.", options: ["Only math", "Good manners and values", "Only games", "Nothing"], answer: "Good manners and values" },
        { question: "Family members often look like each other; this is called ___.", options: ["Acting", "Similarity", "Magic", "Mistake"], answer: "Similarity" },
        { question: "Helping our parents at home is a ___ habit.", options: ["Bad", "Good", "Funny", "Strange"], answer: "Good" },
        { question: "Who are the first teachers of a child?", options: ["School teachers", "Friends", "Family members", "Neighbours"], answer: "Family members" }
      ]
    },
    "Chhotu’s House": {
      content: `<h3><strong>Main focus: Concept of a house becoming a home</strong></h3>
<p><strong>Chapter summary:</strong> Chhotu comes to Mumbai and uses a big pipe as his house. He divides the pipe into different areas for sleeping, cooking, and sitting. We learn that a <strong>house</strong> is just a building, but it becomes a <strong>home</strong> when we live there with love and care. We also learn about the different parts of a house and the importance of cleanliness.</p>
<h3><strong>Key concepts:</strong></h3>
<ul>
<li>Difference between House and Home</li>
<li>Parts of a house: Kitchen, Bedroom, Bathroom, Courtyard</li>
<li>Decorating and cleaning the house</li>
<li>Animals that live in our houses (invited and uninvited)</li>
</ul>`,
      quiz: [
        { question: "What did Chhotu use as his house in Mumbai?", options: ["A tent", "A big pipe", "A hut", "A building"], answer: "A big pipe" },
        { question: "A house becomes a home when ___.", options: ["It is very big", "It has many toys", "People live there with love", "It is expensive"], answer: "People live there with love" },
        { question: "Which of these is an 'uninvited' guest in our house?", options: ["Pet dog", "Cat", "Lizard", "Parrot"], answer: "Lizard" },
        { question: "We cook food in the ___.", options: ["Bedroom", "Bathroom", "Kitchen", "Drawing room"], answer: "Kitchen" },
        { question: "On festivals, we ___ our houses.", options: ["Break", "Dirty", "Decorate", "Hide"], answer: "Decorate" }
      ]
    },
    "Foods We Eat": {
      content: `<h3><strong>Main focus: Diversity in food habits and sources</strong></h3>
<p><strong>Chapter summary:</strong> People eat different types of food based on where they live and what is available. Some eat rice, while others eat wheat or millets. We learn that some people are <strong>vegetarians</strong> and some are <strong>non-vegetarians</strong>. It is important to eat a variety of foods to get all the nutrients our body needs.</p>
<h3><strong>Key concepts:</strong></h3>
<ul>
<li>Food from Plants vs Food from Animals</li>
<li>Staple foods in different regions</li>
<li>Eating habits of people of different ages (infants, adults, elders)</li>
<li>Importance of a balanced diet</li>
</ul>`,
      quiz: [
        { question: "Which of these is a plant-based food?", options: ["Milk", "Eggs", "Pulses/Dal", "Meat"], answer: "Pulses/Dal" },
        { question: "People who do not eat meat or fish are called ___.", options: ["Non-vegetarians", "Vegetarians", "Doctors", "Farmers"], answer: "Vegetarians" },
        { question: "Rice is the main food in ___ India.", options: ["North", "South", "West", "Central"], answer: "South" },
        { question: "What should a small baby mainly drink?", options: ["Juice", "Milk", "Tea", "Soda"], answer: "Milk" },
        { question: "Wheat is used to make ___.", options: ["Rice", "Chapati/Roti", "Idli", "Dosa"], answer: "Chapati/Roti" }
      ]
    },
    "Saying Without Speaking": {
      content: `<h3><strong>Main focus: Non-verbal communication — gestures and expressions</strong></h3>
<p><strong>Chapter summary:</strong> We don't always need words to talk! Our face and hands can tell a lot. People who cannot speak or hear use <strong>Sign Language</strong>. Dancers use <strong>Mudras</strong> (hand gestures) and <strong>Bhavas</strong> (facial expressions) to tell stories. This chapter teaches empathy and the power of non-verbal communication.</p>
<h3><strong>Key concepts:</strong></h3>
<ul>
<li>Sign Language and its importance</li>
<li>Facial expressions: Happy, Sad, Angry, Surprised</li>
<li>Mudras and Bhavas in dance</li>
<li>Communicating through actions</li>
</ul>`,
      quiz: [
        { question: "How do people who cannot hear or speak communicate?", options: ["Shouting", "Sign Language", "Running", "Writing only"], answer: "Sign Language" },
        { question: "Hand gestures in dance are called ___.", options: ["Steps", "Mudras", "Styles", "Songs"], answer: "Mudras" },
        { question: "Our ___ can show if we are happy or sad without speaking.", options: ["Feet", "Hands", "Face", "Back"], answer: "Face" },
        { question: "To show 'Yes' without speaking, we usually ___.", options: ["Shake head side to side", "Nod head up and down", "Close eyes", "Jump"], answer: "Nod head up and down" },
        { question: "Facial expressions in dance are called ___.", options: ["Mudras", "Bhavas", "Music", "Rhythm"], answer: "Bhavas" }
      ]
    },
    "Flying High": {
      content: `<h3><strong>Main focus: Common birds — their features and habitats</strong></h3>
<p><strong>Chapter summary:</strong> The sky is full of beautiful birds! Each bird has unique features: the Peacock has a colourful tail, the Parrot has a red beak, and the Woodpecker has a strong beak to tap on trees. We learn about what birds eat, how they fly, and where they build their nests. Birds are an important part of our environment.</p>
<h3><strong>Key concepts:</strong></h3>
<ul>
<li>Identifying birds by feathers, beaks, and feet</li>
<li>Eating habits of birds: Seeds, insects, fruit, fish</li>
<li>Nests: Homes of birds</li>
<li>The National Bird of India: Peacock</li>
</ul>`,
      quiz: [
        { question: "Which bird is known for its beautiful dance in the rain?", options: ["Sparrow", "Peacock", "Crow", "Parrot"], answer: "Peacock" },
        { question: "A bird that can see at night is the ___.", options: ["Eagle", "Owl", "Pigeon", "Duck"], answer: "Owl" },
        { question: "Which bird has a hooked red beak and likes to eat chillies?", options: ["Crow", "Parrot", "Swan", "Crane"], answer: "Parrot" },
        { question: "Birds use their ___ to eat food.", options: ["Teeth", "Beaks", "Hands", "Paws"], answer: "Beaks" },
        { question: "A bird that makes its nest in the hollow of a tree is the ___.", options: ["Woodpecker", "Tailor bird", "Weaver bird", "Eagle"], answer: "Woodpecker" }
      ]
    },
    "It’s Raining": {
      content: `<h3><strong>Main focus: The water cycle and its effect on life</strong></h3>
<p><strong>Chapter summary:</strong> Appu the elephant loves bananas and waters the trees when they are dry. But where does the rain come from? We learn about clouds and how they bring rain. Rain is important for plants, animals, and humans. Without rain, the earth would become dry and life would be difficult. We also learn about the joy of seeing a rainbow!</p>
<h3><strong>Key concepts:</strong></h3>
<ul>
<li>Importance of rain for plants and animals</li>
<li>How clouds are formed (Basic idea)</li>
<li>The Rainbow: Seven colours after rain</li>
<li>Caring for plants during dry weather</li>
</ul>`,
      quiz: [
        { question: "Who watered the banana trees in the story?", options: ["A boy", "Appu the elephant", "The rain only", "A farmer"], answer: "Appu the elephant" },
        { question: "Clouds bring ___.", options: ["Snow only", "Rain", "Dust", "Sweets"], answer: "Rain" },
        { question: "How many colours are there in a rainbow?", options: ["5", "6", "7", "8"], answer: "7" },
        { question: "When it rains, the parched earth becomes ___.", options: ["Dry", "Green and fresh", "Yellow", "Hot"], answer: "Green and fresh" },
        { question: "We see a rainbow when there is both ___ and rain.", options: ["Wind", "Sunlight", "Night", "Clouds only"], answer: "Sunlight" }
      ]
    },
    "Good Morning": {
      content: "Welcome to the lesson on Good Morning! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Good Morning?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Good Morning?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "The Magic Garden": {
      content: "Welcome to the lesson on The Magic Garden! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in The Magic Garden?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from The Magic Garden?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Bird Talk": {
      content: "Welcome to the lesson on Bird Talk! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Bird Talk?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Bird Talk?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Nina and the Baby Sparrows": {
      content: "Welcome to the lesson on Nina and the Baby Sparrows! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Nina and the Baby Sparrows?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Nina and the Baby Sparrows?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Little by Little": {
      content: "Welcome to the lesson on Little by Little! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Little by Little?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Little by Little?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "The Enormous Turnip": {
      content: "Welcome to the lesson on The Enormous Turnip! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in The Enormous Turnip?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from The Enormous Turnip?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Sea Song": {
      content: "Welcome to the lesson on Sea Song! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Sea Song?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Sea Song?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "A Little Fish Story": {
      content: "Welcome to the lesson on A Little Fish Story! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in A Little Fish Story?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from A Little Fish Story?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "The Balloon Man": {
      content: "Welcome to the lesson on The Balloon Man! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in The Balloon Man?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from The Balloon Man?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "The Yellow Butterfly": {
      content: "Welcome to the lesson on The Yellow Butterfly! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in The Yellow Butterfly?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from The Yellow Butterfly?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Kakkoo": {
      content: "Welcome to the lesson on Kakkoo! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Kakkoo?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Kakkoo?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Shekhibaz Makkhi": {
      content: "Welcome to the lesson on Shekhibaz Makkhi! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Shekhibaz Makkhi?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Shekhibaz Makkhi?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Chand Wali Amma": {
      content: "Welcome to the lesson on Chand Wali Amma! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Chand Wali Amma?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Chand Wali Amma?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Mann Karta Hai": {
      content: "Welcome to the lesson on Mann Karta Hai! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Mann Karta Hai?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Mann Karta Hai?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Bahadur Bittu": {
      content: "Welcome to the lesson on Bahadur Bittu! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Bahadur Bittu?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Bahadur Bittu?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Humse Sab Kehte": {
      content: "Welcome to the lesson on Humse Sab Kehte! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Humse Sab Kehte?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Humse Sab Kehte?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Tip Tipwa": {
      content: "Welcome to the lesson on Tip Tipwa! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Tip Tipwa?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Tip Tipwa?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Bandar Bant": {
      content: "Welcome to the lesson on Bandar Bant! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Bandar Bant?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Bandar Bant?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Akbar Birbal": {
      content: "Welcome to the lesson on Akbar Birbal! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Akbar Birbal?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Akbar Birbal?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Where to Look From": {
      content: `<h3><strong>Main focus: Observing objects from different directions</strong></h3>
<p><strong>Chapter summary:</strong> The same object looks different depending on where you look from! A cup seen from the <strong>top</strong> looks like a circle. Seen from the <strong>side</strong>, it looks like a rectangle. This chapter trains us to observe, visualise, and think about <strong>3D shapes from different viewpoints</strong> — a key skill in geometry.</p>
<h3><strong>Key concepts:</strong></h3>
<ul>
<li>Objects look different from <strong>top view</strong>, <strong>side view</strong>, and <strong>front view</strong></li>
<li>A cup from the top looks like a circle</li>
<li>A box from the side may look like a rectangle</li>
<li>Observation and visualisation are key geometry skills</li>
</ul>`,
      quiz: [
        { question: "A cup viewed from the TOP looks like ___.", options: ["A rectangle", "A triangle", "A circle", "A square"], answer: "A circle" },
        { question: "Why does the same object look different from different angles?", options: ["The object changes shape", "We see different faces/sides of it", "Our eyes are wrong", "The colour changes"], answer: "We see different faces/sides of it" },
        { question: "A brick seen from the SIDE looks like ___.", options: ["A circle", "A triangle", "A rectangle", "A star"], answer: "A rectangle" },
        { question: "The skill of imagining how an object looks from another angle is called ___.", options: ["Addition", "Visualisation", "Subtraction", "Measurement"], answer: "Visualisation" },
        { question: "Looking at a book from the TOP, you would see ___.", options: ["The spine", "The pages inside", "A flat rectangle", "Nothing"], answer: "A flat rectangle" }
      ]
    },
    "Fun with Numbers": {
      content: `<h3><strong>Main focus: Numbers 21–999 and place value</strong></h3>
<p><strong>Chapter summary:</strong> We extend our number knowledge to 3-digit numbers! 100 = 10 Tens = 1 Hundred. A 3-digit number has a <strong>Hundreds place, Tens place, and Ones place</strong>. In 354, there are 3 Hundreds, 5 Tens, and 4 Ones. We also compare and order these larger numbers.</p>
<h3><strong>Key concepts:</strong></h3>
<ul>
<li>100 = 10 Tens = 1 Hundred</li>
<li>3-digit number: <strong>Hundreds | Tens | Ones</strong></li>
<li>354 = 300 + 50 + 4 = 3 Hundreds + 5 Tens + 4 Ones</li>
<li>Compare 3-digit numbers by Hundreds digit first</li>
</ul>`,
      quiz: [
        { question: "How many Tens make 1 Hundred?", options: ["1", "100", "10", "1000"], answer: "10" },
        { question: "In the number 472, which digit is in the Hundreds place?", options: ["7", "2", "4", "47"], answer: "4" },
        { question: "354 = 3 Hundreds + 5 Tens + ___ Ones", options: ["53", "35", "3", "4"], answer: "4" },
        { question: "Which is bigger: 582 or 528?", options: ["528", "582", "Both equal", "Cannot say"], answer: "582" },
        { question: "What is the place value of 6 in 631?", options: ["6", "60", "600", "6000"], answer: "600" }
      ]
    },
    "Long and Short": {
      content: `<h3><strong>Main focus: Standard units of length — centimetre and metre</strong></h3>
<p><strong>Chapter summary:</strong> We learned to measure with footsteps and handspans, but these are different for everyone. Now we use <strong>standard units</strong>: the <strong>centimetre (cm)</strong> for small lengths and the <strong>metre (m)</strong> for bigger lengths. 100 cm = 1 m. A ruler has centimetre markings. We use these to measure accurately.</p>
<h3><strong>Key concepts:</strong></h3>
<ul>
<li>Standard units: <strong>centimetre (cm)</strong> and <strong>metre (m)</strong></li>
<li>100 cm = 1 metre</li>
<li>Small things: measured in cm (pencil, book)</li>
<li>Big things: measured in m (room, road)</li>
</ul>`,
      quiz: [
        { question: "How many centimetres make 1 metre?", options: ["10", "1000", "100", "50"], answer: "100" },
        { question: "We measure the length of a pencil in ___.", options: ["Metres", "Kilometres", "Litres", "Centimetres"], answer: "Centimetres" },
        { question: "We measure the length of a football field in ___.", options: ["Centimetres", "Grams", "Litres", "Metres"], answer: "Metres" },
        { question: "A ruler shows markings in ___.", options: ["Kilograms", "Centimetres", "Litres", "Seconds"], answer: "Centimetres" },
        { question: "Why do we use standard units of measurement?", options: ["To make maths harder", "So everyone gets the same answer for the same length", "To use our hands and feet", "To avoid counting"], answer: "So everyone gets the same answer for the same length" }
      ]
    },
    "Shapes and Designs": {
      content: `<h3><strong>Main focus: 2D shapes, symmetry, and tiling patterns</strong></h3>
<p><strong>Chapter summary:</strong> We study 2D shapes: <strong>triangle, square, rectangle, circle, hexagon</strong>. We learn how shapes can <strong>tile</strong> (fit together without gaps). We also explore <strong>symmetry</strong>: a shape is symmetric if one half is the mirror image of the other. A square has 4 lines of symmetry!</p>
<h3><strong>Key concepts:</strong></h3>
<ul>
<li>2D shapes: triangle (3 sides), square (4 equal sides), rectangle, circle, hexagon (6 sides)</li>
<li><strong>Tiling</strong>: shapes that fit together with no gaps or overlaps</li>
<li><strong>Symmetry</strong>: a shape is symmetric when both halves match</li>
<li>A square has <strong>4 lines of symmetry</strong></li>
</ul>`,
      quiz: [
        { question: "How many sides does a hexagon have?", options: ["4", "5", "8", "6"], answer: "6" },
        { question: "A shape is symmetric when ___.", options: ["Both halves match exactly", "It has no sides", "It has 3 corners", "It is colourful"], answer: "Both halves match exactly" },
        { question: "Which shape tiles perfectly (fits together with no gaps)?", options: ["Circle", "Square", "Star", "Crescent"], answer: "Square" },
        { question: "How many lines of symmetry does a square have?", options: ["1", "2", "3", "4"], answer: "4" },
        { question: "A triangle has ___ sides.", options: ["4", "2", "6", "3"], answer: "3" }
      ]
    },
    "Fun with Give and Take": {
      content: `<h3><strong>Main focus: Addition and subtraction of 3-digit numbers</strong></h3>
<p><strong>Chapter summary:</strong> We now add and subtract bigger numbers! For <strong>213 + 45</strong>, we add Ones first (3+5=8), then Tens (1+4=5), then Hundreds (2+0=2) to get 258. For subtraction, we do the same in reverse. We also learn about <strong>carrying</strong> (regrouping) when the sum in a column exceeds 9.</p>
<h3><strong>Key concepts:</strong></h3>
<ul>
<li>Add column by column: Ones → Tens → Hundreds</li>
<li>213 + 45 = 258</li>
<li>Subtract column by column: Ones → Tens → Hundreds</li>
<li><strong>Carrying / Regrouping</strong>: when Ones sum > 9, carry 1 to Tens</li>
</ul>`,
      quiz: [
        { question: "213 + 45 = ___", options: ["248", "258", "268", "168"], answer: "258" },
        { question: "When adding two numbers, which column do we start with?", options: ["Hundreds", "Tens", "Ones", "Any column"], answer: "Ones" },
        { question: "356 − 124 = ___", options: ["232", "222", "242", "480"], answer: "232" },
        { question: "When the sum of two Ones digits is more than 9, we ___ to the Tens column.", options: ["Subtract 1", "Carry 1", "Write 0", "Skip it"], answer: "Carry 1" },
        { question: "What is 400 + 50 + 7?", options: ["475", "4507", "457", "407"], answer: "457" }
      ]
    },
    "Time Goes On": {
      content: `<h3><strong>Main focus: Reading a clock — hours and minutes</strong></h3>
<p><strong>Chapter summary:</strong> Time is measured using a <strong>clock</strong>. The <strong>short hand</strong> shows the hour and the <strong>long hand</strong> shows the minutes. When the long hand points to 12, it is <strong>o'clock</strong>. When it points to 6, it is <strong>half past</strong>. There are 60 minutes in 1 hour and 24 hours in 1 day.</p>
<h3><strong>Key concepts:</strong></h3>
<ul>
<li><strong>Short hand</strong> = hours; <strong>Long hand</strong> = minutes</li>
<li>Long hand at 12 → o'clock (e.g. 3 o'clock)</li>
<li>Long hand at 6 → half past (e.g. half past 3)</li>
<li>60 minutes = 1 hour; 24 hours = 1 day</li>
</ul>`,
      quiz: [
        { question: "The short hand on a clock shows the ___.", options: ["Minutes", "Seconds", "Hours", "Days"], answer: "Hours" },
        { question: "When the long hand points to 12, the time is ___.", options: ["Half past", "Quarter past", "O'clock", "Quarter to"], answer: "O'clock" },
        { question: "How many minutes are in 1 hour?", options: ["24", "100", "30", "60"], answer: "60" },
        { question: "When the long hand points to 6, the time is ___.", options: ["O'clock", "Quarter past", "Half past", "Quarter to"], answer: "Half past" },
        { question: "How many hours are in 1 day?", options: ["12", "60", "24", "48"], answer: "24" }
      ]
    },
    "Who is Heavier?": {
      content: `<h3><strong>Main focus: Comparing weights using a balance</strong></h3>
<p><strong>Chapter summary:</strong> We use a <strong>balance scale</strong> to compare weights. The heavier side goes DOWN and the lighter side goes UP. We measure weight using non-standard units (like marbles or blocks) or standard units. We compare objects and use words: <strong>Heavier / Lighter / Equal</strong>.</p>
<h3><strong>Key concepts:</strong></h3>
<ul>
<li>A balance shows which side is <strong>heavier</strong> (it sinks down)</li>
<li>Words: <strong>Heavier, Lighter, Equal</strong></li>
<li>Non-standard units: stones, books, marbles</li>
<li>If both sides of a balance are level, the weight is <strong>equal</strong></li>
</ul>`,
      quiz: [
        { question: "On a balance scale, which side goes down?", options: ["The lighter side", "The heavier side", "Both sides", "Neither side"], answer: "The heavier side" },
        { question: "Which is lighter: a feather or a brick?", options: ["Brick", "Feather", "Both equal", "Cannot tell"], answer: "Feather" },
        { question: "If both sides of a balance are level, the weights are ___.", options: ["Different", "Equal", "Heavier", "Lighter"], answer: "Equal" },
        { question: "A spoon weighs 2 blocks. A cup weighs 6 blocks. Which is heavier?", options: ["Spoon", "Block", "Cup", "Both equal"], answer: "Cup" },
        { question: "We use a ___ to compare two weights.", options: ["Ruler", "Clock", "Balance scale", "Handspan"], answer: "Balance scale" }
      ]
    },
    "How Many Times?": {
      content: `<h3><strong>Main focus: Skip counting as the foundation of multiplication</strong></h3>
<p><strong>Chapter summary:</strong> "How Many Times?" introduces repeated groups. If there are 3 groups of 4 coins, we skip-count by 4: 4, 8, 12. This is secret multiplication! We also look at patterns in skip counting — counting by 2s always gives even numbers. Counting by 5s always ends in 0 or 5.</p>
<h3><strong>Key concepts:</strong></h3>
<ul>
<li>3 groups of 4 = 4 + 4 + 4 = 12 (skip count by 4 three times)</li>
<li>Counting by 2s → always even: 2, 4, 6, 8, 10…</li>
<li>Counting by 5s → ends in 0 or 5: 5, 10, 15, 20…</li>
<li>Skip counting is the building block of multiplication tables</li>
</ul>`,
      quiz: [
        { question: "Count by 2s: 2, 4, 6, ___, ___", options: ["7, 8", "8, 10", "8, 9", "9, 11"], answer: "8, 10" },
        { question: "There are 4 groups of 3 stars each. How many stars in total?", options: ["7", "9", "12", "16"], answer: "12" },
        { question: "Count by 5s: 5, 10, 15, ___, ___", options: ["16, 17", "20, 25", "18, 20", "19, 24"], answer: "20, 25" },
        { question: "When counting by 5s, the numbers always end in ___.", options: ["2 or 4", "0 or 5", "1 or 3", "6 or 8"], answer: "0 or 5" },
        { question: "3 groups of 2 cherries each gives us ___ cherries in total.", options: ["5", "3", "2", "6"], answer: "6" }
      ]
    },
    "Play with Patterns": {
      content: `<h3><strong>Main focus: Identifying and extending patterns in shapes, colours, and numbers</strong></h3>
<p><strong>Chapter summary:</strong> Patterns follow a <strong>rule that repeats</strong>. We find patterns on tiles, fabric, and in number sequences. The key skill is finding the <strong>repeating unit</strong> and then extending it. Number patterns like 2, 4, 6, 8 (add 2 each time) or 5, 10, 15, 20 (add 5 each time) are very useful in maths.</p>
<h3><strong>Key concepts:</strong></h3>
<ul>
<li>Find the <strong>repeating unit</strong> in a pattern</li>
<li>Colour patterns, shape patterns, number patterns</li>
<li>Growing patterns: 1, 3, 5, 7 (add 2 each time)</li>
<li>Patterns on tiles, sarees, and floor designs</li>
</ul>`,
      quiz: [
        { question: "What is the rule for: 1, 3, 5, 7, 9?", options: ["Add 1", "Add 3", "Add 2", "Subtract 1"], answer: "Add 2" },
        { question: "Complete the pattern: Red, Blue, Green, Red, Blue, ___", options: ["Red", "Blue", "Yellow", "Green"], answer: "Green" },
        { question: "Pattern: ○ □ ○ □ ___. What comes next?", options: ["□", "△", "○", "★"], answer: "○" },
        { question: "Which of these is a pattern counting by 10s?", options: ["1, 2, 3, 4", "2, 4, 6, 8", "10, 20, 30, 40", "5, 10, 15, 20"], answer: "10, 20, 30, 40" },
        { question: "Patterns are found on ___.", options: ["Only paper", "Only numbers", "Tiles, fabric, and in numbers", "Only in classrooms"], answer: "Tiles, fabric, and in numbers" }
      ]
    },
    "Poonam’s Day Out": {
      content: "Welcome to the lesson on Poonam’s Day Out! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Poonam’s Day Out?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Poonam’s Day Out?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "The Plant Fairy": {
      content: "Welcome to the lesson on The Plant Fairy! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in The Plant Fairy?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from The Plant Fairy?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Water O Water": {
      content: "Welcome to the lesson on Water O Water! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Water O Water?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Water O Water?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Our First School": {
      content: "Welcome to the lesson on Our First School! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Our First School?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Our First School?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Chhotu’s House": {
      content: "Welcome to the lesson on Chhotu’s House! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Chhotu’s House?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Chhotu’s House?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Foods We Eat": {
      content: "Welcome to the lesson on Foods We Eat! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Foods We Eat?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Foods We Eat?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Saying Without Speaking": {
      content: "Welcome to the lesson on Saying Without Speaking! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Saying Without Speaking?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Saying Without Speaking?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Flying High": {
      content: "Welcome to the lesson on Flying High! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Flying High?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Flying High?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "It’s Raining": {
      content: "Welcome to the lesson on It’s Raining! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in It’s Raining?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from It’s Raining?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Meena’s Family": {
      content: `<h3><strong>अध्याय 1: मीना का परिवार (Meena’s Family)</strong></h3>
<p><strong>पाठ का सारांश:</strong> यह अध्याय मीना नाम की एक लड़की के माध्यम से परिवार की अवधारणा को समझाता है। यह बच्चों को परिवार के सदस्यों को हिंदी में पहचानने और नाम देने में मदद करता है। यह पाठ परिवार के भीतर प्यार और जुड़ाव पर ध्यान केंद्रित करता है। इस अध्याय में, हम रिश्तों के लिए बुनियादी शब्द सीखते हैं: माँ, पिता, भाई, और दादा-दादी। बच्चों को 'मीना' और 'माँ' जैसे नामों के माध्यम से 'म' और 'न' वर्णों को पहचानना सिखाया जाता है।</p>
<p>This chapter introduces the concept of a family through a girl named Meena. It teaches children to identify and name family members in Hindi. The lesson focuses on the love and bond within a family.</p>`,
      quiz: [
        { question: "आपके परिवार में कौन-कौन है?", options: ["दोस्त", "माता-पिता और भाई-बहन", "सिर्फ मैं", "पड़ोसी"], answer: "माता-पिता और भाई-बहन" },
        { question: "'म' अक्षर से शुरू होने वाले दो शब्द कौन से हैं?", options: ["नल, नदी", "माँ, मीना", "घर, घड़ी", "सेब, संतरा"], answer: "माँ, मीना" },
        { question: "मीना के भाई का क्या नाम है?", options: ["नितिन", "राज", "अमित", "राहुल"], answer: "नितिन" },
        { question: "Maa शब्द का हिंदी अर्थ क्या है?", options: ["पिता", "भाई", "माँ", "बहन"], answer: "माँ" },
        { question: "दादा-दादी हमारे परिवार के ___ सदस्य हैं।", options: ["छोटे", "बड़े और बुजुर्ग", "बाहरी", "नए"], answer: "बड़े और बुजुर्ग" }
      ],
      lessons: [
        { title: "Introduction: मेरा परिवार", explanation: "परिवार वह जगह है जहाँ हम सबसे पहले प्यार और देखभाल सीखते हैं। मीना का परिवार एक सुखी परिवार है। उसके घर में सब मिल-जुलकर रहते हैं।\n\nA family is where we first learn love and care. Meena's family is a happy one where everyone lives together.", words: ["परिवार (Family)", "प्यार (Love)", "घर (Home)"], activities: "अपने परिवार के सदस्यों के नाम हिंदी में लिखें।" },
        { title: "Letter Focus: 'म' और 'न'", explanation: "इस पाठ में हम 'म' से 'माँ' और 'न' से 'नल' जैसे शब्दों को पहचानना सीखेंगे। वर्णों की पहचान भाषा सीखने का पहला कदम है।\n\nRecognizing letters like 'Ma' and 'Na' is the first step in learning a language.", words: ["माँ", "नल", "मछली", "नमक"], activities: "'म' अक्षर से शुरू होने वाले 5 शब्द बोलें।" },
        { title: "Concept: रिश्तों के नाम", explanation: "माँ, पिता, भाई, बहन, दादा और दादी - ये हमारे परिवार के मुख्य सदस्य हैं। हर रिश्ते का अपना महत्व है।\n\nMother, Father, Brother, Sister, Grandfather, and Grandmother are key family members.", words: ["पिता", "भाई", "बहन", "रिश्ता"], activities: "अपने पसंदीदा परिवार के सदस्य के बारे में एक वाक्य बोलें।" },
        { title: "Speaking: नमस्ते और बातचीत", explanation: "जब हम अपने बड़ों से मिलते हैं, तो हमें 'नमस्ते' कहना चाहिए। यह विनम्रता और संस्कार की निशानी है।\n\nSaying 'Namaste' to elders is a sign of politeness and good values.", words: ["नमस्ते", "विनम्रता", "बातचीत"], activities: "अपने घर में सबको 'नमस्ते' कहें।" },
        { title: "Writing Practice", explanation: "मीना और माँ शब्दों में 'म' वर्ण आता है। चलिए इसे सुंदर तरीके से लिखने का अभ्यास करते हैं।\n\nThe letter 'Ma' appears in Meena and Maa. Let's practice writing it beautifully.", words: ["लिखना", "सुंदर", "अभ्यास"], activities: "'म' और 'न' वर्ण को 10 बार लिखें।" },
        { title: "Review: मीना का घर", explanation: "हमने मीना के परिवार के बारे में जाना और 'म' व 'न' अक्षर सीखे। परिवार का साथ सबसे सुखद होता है।\n\nWe learned about Meena's family and the letters Ma and Na. Family support is the best.", words: ["सुखद", "साथ", "सीख"], activities: "अध्याय 1 के सभी प्रश्नों को हल करें।" }
      ]
    },

    "Grandparents": {
      content: `<h3><strong>अध्याय 2: दादा-दादी (Grandparents)</strong></h3>
<p><strong>पाठ का सारांश:</strong> यह अध्याय दादा-दादी की भूमिका के बारे में एक सुंदर कविता है। यह बच्चों को बड़ों द्वारा साझा की गई कहानियों और ज्ञान के बारे में सिखाता है। मुख्य ध्यान 'द' और 'ई' वर्णों की ध्वन्यात्मक जागरूकता पर है। बच्चे सीखते हैं कि दादा-दादी खास दोस्त होते हैं जो उनका ख्याल रखते हैं। यह पाठ बच्चों को बड़ों का सम्मान करने और उनके साथ समय बिताने के लिए प्रोत्साहित करता है। यह 'दादा' और 'दादी' जैसे शब्दों के माध्यम से 'आ' की मात्रा से भी परिचय कराता है।</p>
<p>This chapter is a beautiful poem about the role of grandparents. It teaches children about the stories and wisdom shared by elders. The focus is on phonetic awareness of the letter 'द' (Da) and 'ई' (Ee).</p>`,
      quiz: [
        { question: "दादा-दादी आपको कौन सी कहानियाँ सुनाते हैं?", options: ["जंगल की", "पुरानी और ज्ञान वाली", "भूत की", "सिर्फ डरावनी"], answer: "पुरानी और ज्ञान वाली" },
        { question: "'द' अक्षर पर गोला लगाएँ: [म, द, न, र, स]", options: ["म", "द", "न", "स"], answer: "द" },
        { question: "दादी शब्द का तुकबंदी वाला शब्द क्या है?", options: ["नानी", "शादी", "पानी", "हाथी"], answer: "शादी" },
        { question: "दादाजी क्या पहनते हैं?", options: ["कुर्ता-पायजामा / धोती", "जीन्स", "ट्रैकसूट", "कोट-पेंट"], answer: "कुर्ता-पायजामा / धोती" },
        { question: "बड़ों का हमें क्या करना चाहिए?", options: ["शोर", "सम्मान", "परेशान", "गुस्सा"], answer: "सम्मान" }
      ],
      lessons: [
        { title: "Introduction: प्यारी कविता", explanation: "दादा-दादी घर के सबसे बुजुर्ग and अनुभवी सदस्य होते हैं। उनकी बातें कहानियों जैसी होती हैं।\n\nGrandparents are the elders and most experienced. Their talks are like stories.", words: ["बुजुर्ग", "अनुभव", "प्यारी"], activities: "अपने दादा-दादी के साथ एक फोटो खिंचवाएं।" },
        { title: "Letter Focus: 'द' और 'ई'", explanation: "इस पाठ में हम 'द' से 'दाल' और 'ई' की मात्रा वाले शब्दों जैसे 'दादी' को सीखेंगे।\n\nIn this lesson, we learn 'Da' for 'Dal' and the 'Ee' vowel sign.", words: ["दाल", "दीपक", "दादी", "ई"], activities: "'द' अक्षर से शुरू होने वाले 3 शब्द लिखें।" },
        { title: "Concept: कहानियों का पिटारा", explanation: "दादा-दादी हमें परियों, राजाओं और पुराने समय की कहानियाँ सुनाते हैं। ये कहानियाँ हमें बहुत कुछ सिखाती हैं।\n\nGrandparents tell us stories of fairies, kings, and old times that teach us a lot.", words: ["पिटारा", "परी", "राजा"], activities: "अपनी पसंदीदा कहानी का नाम बताएं।" },
        { title: "Grammar: 'आ' की मात्रा", explanation: "'दादा' शब्द में 'ा' की मात्रा लगी है। यह मात्रा आवाज़ को लंबी कर देती है।\n\nThe 'Aa' matra in 'Dada' makes the sound longer.", words: ["मात्रा", "आवाज़", "लंबी"], activities: "'ा' की मात्रा वाले 5 शब्द लिखें।" },
        { title: "Value: बड़ों का सम्मान", explanation: "हमें हमेशा अपने बड़ों का आदर करना चाहिए और उनकी मदद करनी चाहिए।\n\nWe should always respect our elders and help them.", words: ["सम्मान", "आदर", "मदद"], activities: "आज अपने दादा-दादी के पैर छुएं।" },
        { title: "Review: दादा-दादी का घर", explanation: "दादा-दादी के साथ समय बिताना बहुत सुखद होता है। हमने 'द' और 'ई' वर्ण भी सीखे।\n\nSpending time with grandparents is joyful. We also learned Da and Ee.", words: ["सुखद", "समय", "सीख"], activities: "अध्याय 2 के तुकबंदी वाले शब्द लिखें।" }
      ]
    },
    "Welcoming Reema": {
      content: `<h3><strong>अध्याय 3: रीमा का स्वागत (Welcoming Reema)</strong></h3>
<p><strong>पाठ का सारांश:</strong> यह अध्याय रीमा नाम की एक नई लड़की के समूह में शामिल होने के बारे में है। यह बच्चों को विनम्र होना और नए दोस्तों का स्वागत करना सिखाता है। यहाँ सिखाया जाने वाला मुख्य सामाजिक कौशल 'आतिथ्य' (मेहमानों का स्वागत) है। भाषाई रूप से, यह 'र' और 'स' वर्णों का परिचय देता है। छात्र "नमस्ते" और "आइए" जैसे वाक्यांशों का उपयोग करना सीखते हैं। यह छोटे वाक्य बनाने में मदद करता है और कक्षा में सामाजिक मेलजोल को बढ़ावा देता है।</p>
<p>This chapter talks about a new girl, Reema, joining a group. It teaches children how to be polite and welcome new friends. Social skill: 'Hospitality'. Letters: 'र' (Ra) and 'स' (Sa).</p>`,
      quiz: [
        { question: "जब कोई घर आता है तो आप क्या कहते हैं?", options: ["नमस्ते, आइए", "जाओ यहाँ से", "क्यों आए हो", "कुछ नहीं"], answer: "नमस्ते, आइए" },
        { question: "'र' अक्षर से शुरू होने वाला फल है:", options: ["सेब", "रसीला आम (रसभरी)", "केला", "अंगूर"], answer: "रसीला आम (रसभरी)" },
        { question: "'नमस्ते' का क्या अर्थ है?", options: ["नमस्ते/प्रणाम", "खेलना", "खाना", "सोना"], answer: "नमस्ते/प्रणाम" },
        { question: "नए दोस्त बनाने के लिए हमें क्या होना चाहिए?", options: ["गुस्सैल", "विनम्र और मिलनसार", "चुप", "अकेला"], answer: "विनम्र और मिलनसार" },
        { question: "स _ रे _ शब्द को पूरा करें:", options: ["सवेरा", "सपना", "सच", "सड़क"], answer: "सवेरा" }
      ],
      lessons: [
        { title: "Introduction: नई सहेली", explanation: "रीमा आज हमारी कक्षा में नई आई है। नए दोस्तों का स्वागत मुस्कुराकर करना चाहिए।\n\nReema is new in our class. We should welcome new friends with a smile.", words: ["सहेली", "मुस्कुराहट", "नया"], activities: "अपनी नई दोस्त को 'नमस्ते' कहें।" },
        { title: "Letter Focus: 'र' और 'स'", explanation: "'र' से 'रीमा' और 'स' से 'स्वागत'। ये अक्षर आज हमारे मेहमान हैं।\n\n'Ra' for Reema and 'Sa' for Swagat. These letters are our guests today.", words: ["र", "स", "रीमा", "स्वागत"], activities: "'र' और 'स' से शुरू होने वाले दो फल के नाम लिखें।" },
        { title: "Concept: अतिथि सत्कार", explanation: "हमारे देश में मेहमान को भगवान माना जाता है। उन्हें पानी पिलाना और प्यार से बिठाना हमारा कर्तव्य है।\n\nIn our country, guests are considered God. Serving them is our duty.", words: ["अतिथि", "सत्कार", "कर्तव्य"], activities: "घर आए मेहमान को पानी पिलाने का नाटक करें।" },
        { title: "Language: छोटे वाक्य", explanation: "'आइए बैठिए', 'आपका नाम क्या है?' - ऐसे छोटे वाक्यों से हम बातचीत शुरू करते हैं।\n\n'Please sit', 'What is your name?' - we start talking with small sentences.", words: ["बैठिए", "बातचीत", "शुरू"], activities: "अपने दोस्त से उसका नाम पूछें।" },
        { title: "Social Skill: मिलनसार बनें", explanation: "अकेले रहने से अच्छा है सबके साथ मिलकर खेलना। नए लोगों से बात करने से झिझक दूर होती है।\n\nIt's better to play together. Talking to new people removes hesitation.", words: ["मिलनसार", "झिझक", "साथ"], activities: "कक्षा में किसी ऐसे बच्चे से बात करें जिससे आपने पहले बात न की हो।" },
        { title: "Review: रीमा का स्वागत", explanation: "हमने रीमा का स्वागत किया और नए शब्द सीखे। 'र' और 'स' अब हमारे दोस्त हैं।\n\nWe welcomed Reema and learned new words. Ra and Sa are our friends now.", words: ["सफल", "दोस्ती", "सीख"], activities: "अध्याय 3 के सभी प्रश्न हल करें।" }
      ]
    },

    "Wow! My Shoes": {
      content: `<h3><strong>अध्याय 4: वाह! मेरे जूते (Wow! My Shoes)</strong></h3>
<p><strong>पाठ का सारांश:</strong> यह अध्याय एक बच्चे के अपने नए जूतों के प्रति उत्साह के इर्द-गिर्द घूमता है। यह छात्रों को रंगों, आकारों और अपनी चीजों की देखभाल करने के बारे में सिखाता है। ध्यान देने वाले वर्ण 'व' और 'ज' हैं। यह बच्चों को अपने जूते खुद पहनना और उन्हें साफ रखना सिखाकर स्वतंत्र होने के लिए प्रोत्साहित करता है। यह पाठ जोड़ों (बाएं और दाएं) की अवधारणा को भी पेश करता है और बच्चों को "सुnder" (Beautiful) या "Naye" (New) जैसे विशेषणों का उपयोग करके वस्तुओं का वर्णन करने में मदद करता है।</p>
<p>This chapter revolves around a child's excitement for their new shoes. It teaches students about colors, sizes, and taking care of their belongings. Letters: 'व' (Va) and 'ज' (Ja).</p>`,
      quiz: [
        { question: "आपके जूतों का रंग क्या है?", options: ["लाल", "नीला", "काला", "सभी हो सकते हैं"], answer: "सभी हो सकते हैं" },
        { question: "'ज' से शुरू होने वाला शब्द है:", options: ["जल", "नल", "फल", "कल"], answer: "जल" },
        { question: "क्या आप अपने जूते खुद पहन सकते हैं?", options: ["हाँ", "नहीं", "सिर्फ एक", "पता नहीं"], answer: "हाँ" },
        { question: "'सुंदर' शब्द का विलोम क्या है?", options: ["साफ", "बदसूरत", "नया", "बड़ा"], answer: "बदसूरत" },
        { question: "जूते हम कहाँ पहनते हैं?", options: ["हाथ", "पैर", "सिर", "कान"], answer: "पैर" }
      ],
      lessons: [
        { title: "Introduction: सुंदर जूते", explanation: "नए जूते पहनकर बच्चा बहुत उत्साहित है। जूते हमारे पैरों को चोट और धूल से बचाते हैं।\n\nThe child is excited about new shoes. Shoes protect our feet from hurt and dust.", words: ["उत्साहित", "चोट", "धूल"], activities: "अपने जूतों का चित्र बनाएं।" },
        { title: "Letter Focus: 'व' और 'ज'", explanation: "'व' से 'वजन' and 'ज' से 'जूते'। इन वर्णों को पहचानना और लिखना सीखें।\n\nLearn to recognize 'Va' for 'Vajan' and 'Ja' for 'Jute'.", words: ["व", "ज", "वजन", "जूते"], activities: "'व' और 'ज' को अपनी कॉपी में 5 बार लिखें।" },
        { title: "Concept: अपनी चीज़ों की देखभाल", explanation: "जूतों को रोज़ साफ करना चाहिए और उन्हें सही जगह (शू-रैक) पर रखना चाहिए।\n\nClean your shoes daily and keep them in the shoe-rack.", words: ["साफ", "संभालना", "जगह"], activities: "आज अपने जूते खुद पॉलिश या साफ करें।" },
        { title: "Grammar: विलोम शब्द", explanation: "नया का पुराना, सुंदर का बदसूरत, साफ का गंदा। इन्हें विलोम या उल्टा शब्द कहते हैं।\n\nOpposite words: New-Old, Beautiful-Ugly, Clean-Dirty.", words: ["विलोम", "उल्टा", "पुराना"], activities: "5 विलोम शब्दों की जोड़ी बनाएं।" },
        { title: "Independence: खुद पहनना", explanation: "अपने काम खुद करना अच्छी बात है। जूते पहनना और फीते (laces) बाँधना सीखना चाहिए।\n\nDoing your work is good. Learn to wear shoes and tie laces.", words: ["स्वतंत्र", "फीते", "बाँधना"], activities: "जूते पहनने का अभ्यास करें।" },
        { title: "Review: जूतों की कहानी", explanation: "हमने जूतों के बारे में सीखा और 'व' व 'ज' वर्ण जाने। अपनी चीज़ों का ध्यान रखें!\n\nWe learned about shoes and the letters Va and Ja. Take care of your things!", words: ["ध्यान", "कहानी", "सफल"], activities: "अध्याय 4 के सभी प्रश्न हल करें।" }
      ]
    },
  };

  if (specificData[cleanTitle]) {
    data = specificData[cleanTitle] || specificData[title];
    // If we have detailed lessons and the requested lesson number is valid
    if (data.lessons && data.lessons[lessonNum - 1]) {
      const lesson = data.lessons[lessonNum - 1];
      return {
        title: lesson.title,
        content: `<h3><strong>${lesson.title}</strong></h3><p>${lesson.explanation}</p> ${lesson.words ? `<p><strong>Key words:</strong> ${lesson.words.join(', ')}</p>` : ''} ${lesson.activities ? `<p><strong>Activities:</strong> ${lesson.activities}</p>` : ''}`,
        quiz: data.quiz ? data.quiz.slice(0, 5) : []
      };
    }
    // Fallback to the main content if no specific lesson is found
    return data;
  }



  // --- CLASS 9 & 10 MATH ---
  if (title.includes("Number Systems") || title.includes("Real Numbers")) {
    return {
      content: `A number system is defined as a system of writing to express numbers. It is the mathematical notation for representing numbers of a given set by using digits or other symbols in a consistent manner. It provides a unique representation of every number and represents the arithmetic and algebraic structure of the figures.

Real numbers include both rational and irrational numbers. Rational numbers can be expressed as a fraction p/q, where p and q are integers and q is not zero. Irrational numbers cannot be expressed as simple fractions (e.g., √2, π).`,
      quiz: [
        { question: "Which of the following is an irrational number?", options: ["22/7", "3.14", "π", "4"], answer: "π" },
        { question: "Can a real number be both rational and irrational?", options: ["Yes", "No", "Only if it is zero", "Depends on the system"], answer: "No" }
      ]
    };
  } else if (title.includes("Polynomials")) {
    return {
      content: `A polynomial is an expression consisting of variables and coefficients, that involves only the operations of addition, subtraction, multiplication, and non-negative integer exponentiation of variables. 

For example, x² - 4x + 7 is a polynomial. The highest power of the variable in a polynomial is called the degree of the polynomial. A polynomial of degree 1 is linear, degree 2 is quadratic, and degree 3 is cubic.`,
      quiz: [
        { question: "What is the degree of the polynomial 4x³ + 2x² - 5x + 1?", options: ["1", "2", "3", "4"], answer: "3" },
        { question: "A polynomial of degree 2 is called:", options: ["Linear", "Quadratic", "Cubic", "Biquadratic"], answer: "Quadratic" }
      ]
    }
  } else if (title.includes("Quadratic Equations")) {
    return {
      content: `A quadratic equation is a second-degree polynomial equation in a single variable x, with a standard form of ax² + bx + c = 0, where a, b, and c are constants (and a ≠ 0). 

The solutions to a quadratic equation are called its roots. The roots can be found using the quadratic formula: x = [-b ± √(b² - 4ac)] / 2a. The term (b² - 4ac) is the discriminant, which determines the nature of the roots.`,
      quiz: [
        { question: "What is the standard form of a quadratic equation?", options: ["y = mx + c", "ax + b = 0", "ax² + bx + c = 0", "a² + b² = c²"], answer: "ax² + bx + c = 0" },
        { question: "If the discriminant (b² - 4ac) is less than zero, the roots are:", options: ["Real and equal", "Real and distinct", "Complex/Imaginary", "Zero"], answer: "Complex/Imaginary" }
      ]
    };
  }
  // --- CLASS 9 & 10 SCIENCE ---
  else if (title.includes("Matter in Our Surroundings")) {
    return {
      content: `Matter is anything that occupies space and has mass. Early Indian philosophers classified matter in the form of five basic elements – the “Panch Tatva” – air, earth, fire, sky and water.

Modern day scientists have evolved two types of classification of matter based on their physical properties and chemical nature. Physically, matter exists as solids, liquids, and gases. The particles of matter are very small and have spaces between them. They are continuously moving and attract each other.`,
      quiz: [
        { question: "Which state of matter has a definite volume but no definite shape?", options: ["Solid", "Liquid", "Gas", "Plasma"], answer: "Liquid" },
        { question: "The process of a solid changing directly into a gas is called:", options: ["Evaporation", "Condensation", "Sublimation", "Melting"], answer: "Sublimation" }
      ]
    }
  } else if (title.includes("Motion") || title.includes("Laws of Motion")) {
    return {
      content: `Motion is the change in position of an object over time. It can be described in terms of distance, displacement, speed, velocity, and acceleration.

Sir Isaac Newton formulated three laws of motion:
1. An object at rest stays at rest and an object in motion stays in motion unless acted upon by an unbalanced force (Inertia).
2. Force equals mass times acceleration (F = ma).
3. For every action, there is an equal and opposite reaction.`,
      quiz: [
        { question: "What is the SI unit of acceleration?", options: ["m/s", "m/s²", "km/h", "N"], answer: "m/s²" },
        { question: "Which of Newton's laws is also known as the Law of Inertia?", options: ["First Law", "Second Law", "Third Law", "Law of Gravitation"], answer: "First Law" }
      ]
    }
  } else if (title.includes("Chemical Reactions and Equations")) {
    return {
      content: `A chemical reaction is a process that leads to the chemical transformation of one set of chemical substances to another. When a chemical reaction occurs, we can observe changes in state, color, evolution of a gas, or change in temperature.

A chemical equation is the symbolic representation of a chemical reaction in the form of symbols and formulae. It must be balanced to satisfy the Law of Conservation of Mass, meaning the number of atoms of each element must be the same on both the reactant and product sides.`,
      quiz: [
        { question: "What indicates a chemical reaction has taken place?", options: ["Change in state", "Evolution of a gas", "Change in color", "All of the above"], answer: "All of the above" },
        { question: "Why do we balance chemical equations?", options: ["To conserve volume", "To satisfy the Law of Conservation of Mass", "To make it look symmetric", "To conserve energy"], answer: "To satisfy the Law of Conservation of Mass" }
      ]
    }
  } else if (title.includes("Light") || title.includes("Reflection") || title.includes("Refraction")) {
    return {
      content: `Light is a form of electromagnetic radiation that allows the human eye to see or makes objects visible.

Reflection is the bouncing back of light rays when they hit a smooth, polished surface like a mirror. The angle of incidence equals the angle of reflection.
Refraction is the bending of light when it passes from one transparent medium to another, caused by a change in its speed.`,
      quiz: [
        { question: "The angle of incidence is always equal to:", options: ["The angle of refraction", "The angle of reflection", "The critical angle", "90 degrees"], answer: "The angle of reflection" },
        { question: "The bending of light as it passes from air to water is called:", options: ["Reflection", "Dispersion", "Refraction", "Diffraction"], answer: "Refraction" }
      ]
    }
  }
  // --- CLASS 11 & 12 ---
  else if (title.includes("Sets") || title.includes("Relations and Functions")) {
    return {
      content: `A Set is a well-defined collection of distinct objects, considered as an object in its own right. Sets are conventionally denoted with capital letters.

A Relation is a subset of the Cartesian product of two sets. A Function is a special type of relation where every element of the domain (input) is uniquely mapped to exactly one element in the codomain (output). Functions are the fundamental building blocks of calculus and advanced mathematics.`,
      quiz: [
        { question: "What is a set?", options: ["Any group of numbers", "A well-defined collection of distinct objects", "A list of equations", "An unknown variable"], answer: "A well-defined collection of distinct objects" },
        { question: "In a function, can one input have multiple outputs?", options: ["Yes", "No", "Only in quadratic functions", "Only if the output is zero"], answer: "No" }
      ]
    }
  } else if (title.includes("Electric Charges") || title.includes("Units and Measurements")) {
    return {
      content: `Physics is a quantitative science, based on measurement of physical quantities. A physical quantity is a property of a material or system that can be quantified by measurement. The standard measure of each kind of physical quantity is the unit (e.g., Meter for length, Kilogram for mass).

Electric charge is a fundamental physical property of matter that causes it to experience a force when kept in an electric or magnetic field. There are two types of electric charges: positive and negative. Like charges repel, and unlike charges attract.`,
      quiz: [
        { question: "What is the SI unit of electric charge?", options: ["Volt", "Ampere", "Coulomb", "Ohm"], answer: "Coulomb" },
        { question: "What do like charges do?", options: ["Attract", "Repel", "Nothing", "Neutralize"], answer: "Repel" }
      ]
    }
  } else if (title.includes("Solid State") || title.includes("Basic Concepts of Chemistry")) {
    return {
      content: `Chemistry is the science of molecules and their transformations. The central concepts include atoms, molecules, moles, and stoichiometry. The mole is the SI unit for the amount of substance.

The Solid State is a state of matter characterized by structural rigidity and resistance to changes of shape or volume. Solids can be crystalline (highly ordered microscopic structure) or amorphous (non-crystalline). The atoms in a solid are tightly bound to each other in a regular geometric lattice.`,
      quiz: [
        { question: "What is the SI unit for the amount of substance?", options: ["Gram", "Liter", "Mole", "Particle"], answer: "Mole" },
        { question: "Which type of solid lacks a highly ordered microscopic structure?", options: ["Crystalline", "Amorphous", "Metallic", "Ionic"], answer: "Amorphous" }
      ]
    }
  } else if (title.includes("Living World") || title.includes("Reproduction")) {
    return {
      content: `Biology is the story of life on earth. The Living World encompasses diverse organisms. Key characteristics of life include growth, reproduction, ability to sense the environment and mount a suitable response, metabolism, and cellular organization.

Reproduction is a biological process by which an organism reproduces an offspring who is biologically similar to the organism. It enables and ensures the continuity of species, generation after generation. It can be asexual (single parent, no fusion of gametes) or sexual (two parents, fusion of gametes).`,
      quiz: [
        { question: "Which characteristic is NOT a defining property of all living organisms?", options: ["Metabolism", "Cellular organization", "Consciousness", "Ability to fly"], answer: "Ability to fly" },
        { question: "Reproduction involving only one parent without the fusion of gametes is called:", options: ["Sexual reproduction", "Asexual reproduction", "Fertilization", "Pollination"], answer: "Asexual reproduction" }
      ]
    }
  }

  data = specificData[title] || specificData[cleanTitle];
  
  if (data && data.lessons && data.lessons[lessonNum - 1]) {
    const lesson = data.lessons[lessonNum - 1];
    return {
      content: `
        <div class="lesson-header" style="margin-bottom: 2rem;">
          <h2 style="color: var(--accent-red); font-size: 1.8rem; margin-bottom: 1rem;">${lesson.title}</h2>
          <div style="background: rgba(255,255,255,0.03); border-left: 4px solid var(--accent-red); padding: 1.5rem; border-radius: 0 12px 12px 0; margin-bottom: 2rem;">
            <p style="font-size: 1.1rem; line-height: 1.6; color: var(--text-primary);">${lesson.explanation}</p>
          </div>
        </div>

        <div class="vocabulary-section" style="margin-bottom: 2.5rem;">
          <h3 style="font-size: 1.2rem; font-weight: 600; margin-bottom: 1rem; display: flex; alignItems: center; gap: 0.5rem;">
            <span style="background: var(--accent-red); width: 8px; height: 24px; border-radius: 4px; display: inline-block;"></span>
            Key Vocabulary
          </h3>
          <div style="display: flex; flex-wrap: wrap; gap: 0.75rem;">
            ${(lesson.words || []).map(word => `
              <span style="background: rgba(255,255,255,0.05); padding: 0.5rem 1rem; border-radius: 8px; border: 1px solid var(--glass-border); font-size: 0.95rem; color: var(--text-secondary);">
                ${word}
              </span>
            `).join('')}
          </div>
        </div>

        ${lesson.activities ? `
        <div class="activities-section" style="margin-bottom: 2.5rem; padding: 1.5rem; background: rgba(255, 51, 68, 0.05); border-radius: 16px; border: 1px dashed var(--accent-red);">
          <h3 style="font-size: 1.2rem; font-weight: 600; margin-bottom: 1rem; color: var(--accent-red);">🚀 Practice Activity</h3>
          <div style="color: var(--text-primary); line-height: 1.6;">${lesson.activities}</div>
        </div>
        ` : ''}

        <div class="chapter-context" style="opacity: 0.8; font-size: 0.95rem; border-top: 1px dashed var(--glass-border); pt: 1.5rem;">
          <p><strong>Chapter Context:</strong> This is lesson ${lessonNum} of the chapter "${title}".</p>
        </div>
      `,
      quiz: lessonNum === 6 ? (data.quiz || []) : [(data.quiz && data.quiz.length > 0) ? data.quiz[(lessonNum - 1) % data.quiz.length] : { question: "Knowledge Check", options: ["A", "B", "C", "D"], answer: "A" }],
      topics: (data.lessons || []).map(l => l.title)
    };
  }

  // Fallback for missing lesson data - Auto-slice content into 6 lessons
  if (data) {
    const content = data.content;
    let slicedContent = content;
    let topic = "General Learning";

    // Attempt to extract sections based on common headers
    const sections = {
      intro: content.match(/Main focus:.*?<\/h3>(.*?)<p><strong>Detailed explanation:<\/strong>/s)?.[1] || "Introduction to the chapter.",
      explanation: content.match(/Detailed explanation:<\/strong>(.*?)<h3><strong>/s)?.[1] || content.match(/Detailed explanation:<\/strong>(.*?)<\/p>/s)?.[1] || "Detailed study material.",
      grammar: content.match(/Grammar focus:.*?<\/h3>(.*?)<h3><strong>/s)?.[1] || content.match(/Grammar focus:.*?<\/h3>(.*?)<\/div>/s)?.[1] || "Key concepts and rules.",
      activities: content.match(/Activities:.*?<\/h3>(.*?)<\/div>/s)?.[1] || content.match(/Activities:.*?<\/h3>(.*?)<\/ul>/s)?.[0] || "Hands-on activities.",
      summary: "Reviewing the key points and preparing for the final assessment."
    };

    switch(lessonNum) {
      case 1: 
        topic = "Main Focus & Introduction";
        slicedContent = `<div style="padding: 1rem; background: rgba(255, 51, 68, 0.05); border-left: 4px solid var(--accent-red); margin-bottom: 2rem;">
                          <h2 style="font-size: 1.5rem; margin-bottom: 0.5rem;">${topic}</h2>
                          ${sections.intro}
                        </div>`;
        break;
      case 2:
        topic = "Concept Deep-Dive";
        slicedContent = `<div style="padding: 1rem; background: rgba(255, 255, 255, 0.02); border-left: 4px solid var(--accent-red); margin-bottom: 2rem;">
                          <h2 style="font-size: 1.5rem; margin-bottom: 1rem;">${topic}</h2>
                          <p style="font-size: 1.1rem; line-height: 1.8;">${sections.explanation}</p>
                        </div>`;
        break;
      case 3:
        topic = "Key Concepts & Rules";
        slicedContent = `<div style="padding: 1rem; background: rgba(255, 255, 255, 0.02); border-left: 4px solid var(--accent-red); margin-bottom: 2rem;">
                          <h2 style="font-size: 1.5rem; margin-bottom: 1rem;">${topic}</h2>
                          ${sections.grammar}
                        </div>`;
        break;
      case 4:
        topic = "Learning Activities";
        slicedContent = `<div style="padding: 1rem; background: rgba(255, 255, 255, 0.02); border-left: 4px solid var(--accent-red); margin-bottom: 2rem;">
                          <h2 style="font-size: 1.5rem; margin-bottom: 1rem;">${topic}</h2>
                          ${sections.activities}
                        </div>`;
        break;
      case 5:
        topic = "Mission Practice";
        slicedContent = `<div style="padding: 1rem; background: rgba(255, 255, 255, 0.02); border-left: 4px solid var(--accent-red); margin-bottom: 2rem;">
                          <h2 style="font-size: 1.5rem; margin-bottom: 1rem;">${topic}</h2>
                          <p>${sections.summary}</p>
                          <div style="margin-top: 2rem; padding: 1rem; background: rgba(0,0,0,0.2); border-radius: 12px; border: 1px dashed var(--glass-border);">
                            <p><strong>Practice Mission:</strong> Re-read the sections above and answer the quick check below!</p>
                          </div>
                        </div>`;
        break;
      case 6:
        topic = "Chapter Final Assessment";
        slicedContent = `<div style="padding: 1rem; background: rgba(255, 51, 68, 0.1); border-radius: 16px; margin-bottom: 2rem; text-align: center;">
                          <h2 style="font-size: 2rem; margin-bottom: 0.5rem; color: var(--accent-red);">🏆 Final Challenge</h2>
                          <p>You have reached the end of this chapter. Complete the full assessment below to master this mission!</p>
                        </div>`;
        break;
    }

    return {
      content: slicedContent,
      quiz: lessonNum === 6 ? (data.quiz || []) : [(data.quiz && data.quiz.length > 0) ? data.quiz[(lessonNum - 1) % data.quiz.length] : { question: "Knowledge Check", options: ["A", "B", "C", "D"], answer: "A" }],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    };
  }

  // --- ELEMENTARY FALLBACKS ---
  if (title.includes("Addition") || title.includes("Subtraction") || title.includes("Numbers") || title.includes("Math") || title.includes("Shapes")) {
    return {
      content: `<h3><strong>Lesson ${lessonNum}</strong></h3>
                <p>Mathematics starts with numbers and counting. Addition is the process of combining two or more groups of objects into a single larger group. Subtraction is the process of taking away objects from a group.</p>`,
      quiz: [
        { question: "What is 15 + 8?", options: ["21", "22", "23", "24"], answer: "23" }
      ],
      topics: ["Introduction", "Concepts", "Practice"]
    }
  }

  // Check if we have specific data
  data = specificData[cleanTitle];
  
  if (data) {
    // If we have a structured lessons array, use it!
    if (data.lessons && data.lessons[lessonNum - 1]) {
      const lesson = data.lessons[lessonNum - 1];
      return {
        content: `<h3><strong>${lesson.title}</strong></h3>
                  <p>${lesson.explanation || data.content}</p>
                  ${lesson.activities ? `<h4><strong>Activity:</strong></h4><p>${lesson.activities}</p>` : ''}
                  ${lesson.words ? `<h4><strong>Vocabulary:</strong></h4><ul>${lesson.words.map(w => `<li>${w}</li>`).join('')}</ul>` : ''}`,
        quiz: lessonNum === 6 ? (data.quiz || []) : [(data.quiz && data.quiz.length > 0) ? data.quiz[(lessonNum - 1) % data.quiz.length] : { question: "Knowledge Check", options: ["A", "B", "C", "D"], answer: "A" }],
        lessons: data.lessons
      };
    }

    // Ensure exactly 5 questions if possible
    if (data.quiz) {
      if (data.quiz.length > 5) {
        data.quiz = data.quiz.slice(0, 5);
      } else if (data.quiz.length < 5) {
        const extraQuestions = [
          { "question": `What is the most interesting part of ${cleanTitle}?`, "options": ["The beginning", "The middle", "The end", "The whole thing"], "answer": "The whole thing" },
          { "question": `Which tool helps us learn ${cleanTitle} better?`, "options": ["Focus", "Interest", "Food", "Sleep"], "answer": "Focus" },
          { "question": `How do you feel about ${cleanTitle} after this?`, "options": ["Confused", "Confident", "Bored", "Tired"], "answer": "Confident" },
          { "question": `Who can help you if you have questions about ${cleanTitle}?`, "options": ["A teacher", "A cat", "A pillow", "The floor"], "answer": "A teacher" },
          { "question": `Is ${cleanTitle} a fun topic?`, "options": ["Yes!", "No", "Maybe", "I don't know"], "answer": "Yes!" }
        ];
        while (data.quiz.length < 5) {
          data.quiz.push(extraQuestions[data.quiz.length % extraQuestions.length]);
        }
      }
    }
    return data;
  }

  // Fallback for missing content (ensures every lesson in Class 1-12 works)
  const defaultQuiz = [
    { "question": `Which of the following is a key component when studying ${cleanTitle}?`, "options": ["Understanding core principles", "Ignoring the context", "Memorizing without practice", "Skipping the basics"], "answer": "Understanding core principles" },
    { "question": `How does ${cleanTitle} primarily relate to ${subject}?`, "options": [`It provides a foundational understanding of ${subject}`, "It is completely unrelated", "It only applies to historical contexts", "It is only useful for advanced scholars"], "answer": `It provides a foundational understanding of ${subject}` },
    { "question": `What is the best way to master the concepts in ${cleanTitle}?`, "options": ["Consistent practice and review", "Reading the title once", "Guessing the answers", "Skipping the assignments"], "answer": "Consistent practice and review" },
    { "question": `Why is analyzing the structure of ${cleanTitle} important?`, "options": ["It helps break down complex ideas into manageable parts", "It makes the topic more confusing", "It wastes valuable study time", "It is only required for exams"], "answer": "It helps break down complex ideas into manageable parts" },
    { "question": `What is the ultimate goal of completing the lessons in ${cleanTitle}?`, "options": ["To apply the knowledge in real-world scenarios", "To forget it after the test", "To memorize the chapter title", "To skip the final assessment"], "answer": "To apply the knowledge in real-world scenarios" }
  ];

  return {
    content: `<h3><strong>Comprehensive Guide to ${cleanTitle}</strong></h3>\
<p>Welcome to this expansive module on <strong>${cleanTitle}</strong>. This chapter introduces essential concepts that form the backbone of your studies in ${subject}. As you navigate through this material, you will discover the underlying mechanisms that define the topic, allowing you to connect theoretical ideas with practical, real-world applications.</p>\
<br/>\
<p>In today's fast-paced educational landscape, understanding <strong>${cleanTitle}</strong> is more important than ever. The skills and insights you develop here will not only prepare you for your upcoming assessments, but they will also equip you with critical thinking frameworks that you can apply across various disciplines. We will dive into the history, the core mechanics, and the modern-day relevance of these ideas.</p>\
<br/>\
<p>To get the most out of this lesson, we encourage you to engage actively with the content. Do not just passively read; instead, pause to reflect on how these principles apply to scenarios you have encountered in your own life. Write down questions, challenge assumptions, and discuss your findings with classmates.</p>\
<br/>\
<h4><strong>Key Learning Objectives:</strong></h4>\
<ul>\
<li>Define and articulate the primary principles of ${cleanTitle} in a comprehensive manner.</li>\
<li>Analyze real-world scenarios where these concepts are actively applied and demonstrate their impact.</li>\
<li>Develop robust problem-solving strategies using the methodologies discussed throughout this chapter.</li>\
<li>Synthesize multiple viewpoints to form a cohesive understanding of the subject matter.</li>\
</ul>\
<br/>\
<p><em>Note: The full AI-generated reading material for this specific chapter is currently being compiled and processed in the background. In the meantime, use these foundational objectives and the full set of five questions below to jumpstart your preliminary study session.</em></p>`,
    quiz: defaultQuiz,
    lessons: [
      { title: `Introduction to ${cleanTitle}`, explanation: `In this section, we define what ${cleanTitle} is and why it matters in ${subject}.`, words: [cleanTitle, subject, "Foundation"], activities: `Think of one example of ${cleanTitle} you have seen today.` },
      { title: `Core Principles`, explanation: `We look at the basic rules and ideas that make ${cleanTitle} special.`, words: ["Principles", "Logic", "Structure"], activities: `Write down two things you've learned about ${cleanTitle} so far.` },
      { title: `Real-World Examples`, explanation: `Where do we see ${cleanTitle} outside of the classroom?`, words: ["Application", "Reality", "Context"], activities: `Ask a family member if they know anything about ${cleanTitle}.` },
      { title: `Practice Session`, explanation: `Time to test your knowledge!`, words: ["Practice", "Skill", "Accuracy"], activities: `Try to explain ${cleanTitle} to a friend.` },
      { title: `Summary & Review`, explanation: `We wrap up everything we've learned today.`, words: ["Summary", "Review", "Memory"], activities: `Close your eyes and remember the 3 most important parts.` }
    ]
  };
};


const cleanForMatch = (str) => String(str || '').toLowerCase().replace(/[^a-z0-9]/g, '');

const findMatch = (dataObj, classNum, subject, title) => {
  if (!dataObj) return null;
  const cClass = cleanForMatch(`Class ${classNum}`);
  const cSubj = cleanForMatch(subject);
  const cTitle = cleanForMatch(String(title).replace(/^\d+\.\s*/, '')); // remove leading numbers

  for (let key of Object.keys(dataObj)) {
    const cKey = cleanForMatch(key);
    if (cKey.includes(cClass) && cKey.includes(cSubj) && (cKey.includes(cTitle) || cTitle.includes(cKey))) {
      return dataObj[key];
    }
  }
  return null;
};

export const getLessonContent = (title, subject, lessonNum = 1, isSkillTest = false, classNum) => {
  // Try to find exact matches from generated data
  const genReading = findMatch(generatedReadingMaterial, classNum, subject, title);
  const genQuizRaw = findMatch(generatedQuestionBanks, classNum, subject, title);
  
  // Format generated quiz to match expected structure
  let genQuiz = null;
  if (genQuizRaw && Array.isArray(genQuizRaw.questions)) {
    genQuiz = genQuizRaw.questions.map(q => ({
      question: q.question,
      options: q.options,
      answer: q.correctAnswer
    }));
  }

  // Construct reading content from the chapter overview and its sub-lessons
  let genContentHtml = null;
  let genTopics = null;
  if (genReading) {
    genContentHtml = genReading.content || '';
    if (Array.isArray(genReading.lessons)) {
      genTopics = genReading.lessons.map(l => l.title);
      genContentHtml += '<div style="margin-top: 2rem;">';
      genReading.lessons.forEach((lesson, index) => {
        genContentHtml += `
          <div style="margin-bottom: 1.5rem;">
            <h3 style="color: var(--text-primary); margin-bottom: 0.5rem; font-size: 1.25rem;">${index + 1}. ${lesson.title}</h3>
            <p style="color: var(--text-secondary); line-height: 1.6;">${lesson.explanation}</p>
          </div>
        `;
      });
      genContentHtml += '</div>';
    }
  }

  const fallbackResult = getLessonContentOriginal(title, subject, lessonNum, classNum);
  
  const result = {
    content: genContentHtml || fallbackResult.content,
    quiz: genQuiz || fallbackResult.quiz || [],
    topics: genTopics || fallbackResult.topics || []
  };
  
  if (isSkillTest) {
    let megaQuiz = [];
    let baseQuiz = result.quiz && result.quiz.length > 0 ? result.quiz : [
      { question: `What is a key concept in ${title}?`, options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" }
    ];
    
    // Duplicate and modify to reach 25 questions
    for (let i = 0; i < 25; i++) {
      let q = baseQuiz[i % baseQuiz.length];
      megaQuiz.push({
        question: `(Q${i + 1}) ${q.question}`,
        options: q.options,
        answer: q.answer
      });
    }
    
    result.quiz = megaQuiz;
    result.content = `<div style="padding: 1rem; background: rgba(99, 102, 241, 0.1); border-radius: 16px; margin-bottom: 2rem; text-align: center;">
      <h2 style="font-size: 2rem; margin-bottom: 0.5rem; color: #8b5cf6;">🏆 Skill Test</h2>
      <p>This is your Skill Test for ${subject}. Answer all questions correctly to pass and earn massive XP!</p>
    </div>` + result.content;
  }
  
  return result;
};
