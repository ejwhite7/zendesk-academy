import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export interface CourseGenerationRequest {
  articles: Array<{
    id: string
    title: string
    content: string
    url: string
  }>
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimatedDuration: number
}

export interface GeneratedCourse {
  title: string
  description: string
  modules: Array<{
    title: string
    description: string
    lessons: Array<{
      title: string
      content: string
      type: 'lesson' | 'video' | 'quiz'
      duration: number
    }>
  }>
  quizzes: Array<{
    title: string
    questions: Array<{
      question: string
      options: Array<{
        text: string
        isCorrect: boolean
      }>
      explanation?: string
    }>
  }>
}

export async function generateCourse(request: CourseGenerationRequest): Promise<GeneratedCourse> {
  const prompt = createCourseGenerationPrompt(request)
  
  const message = await anthropic.messages.create({
    model: 'claude-3-sonnet-20240229',
    max_tokens: 4000,
    messages: [
      {
        role: 'user',
        content: prompt
      }
    ]
  })

  const content = message.content[0]
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Claude')
  }

  try {
    return JSON.parse(content.text) as GeneratedCourse
  } catch (error) {
    throw new Error('Failed to parse Claude response as JSON')
  }
}

function createCourseGenerationPrompt(request: CourseGenerationRequest): string {
  const articlesContent = request.articles
    .map(article => `Title: ${article.title}\nContent: ${article.content}\n---`)
    .join('\n\n')

  return `You are a course creation expert. Transform the following Zendesk knowledge base articles into a structured, interactive course.

Difficulty Level: ${request.difficulty}
Estimated Duration: ${request.estimatedDuration} hours

Articles:
${articlesContent}

Generate a course with the following structure (respond with valid JSON only):

{
  "title": "Course Title",
  "description": "Course Description",
  "modules": [
    {
      "title": "Module Title",
      "description": "Module Description", 
      "lessons": [
        {
          "title": "Lesson Title",
          "content": "Lesson content in HTML format",
          "type": "lesson",
          "duration": 15
        }
      ]
    }
  ],
  "quizzes": [
    {
      "title": "Quiz Title",
      "questions": [
        {
          "question": "Question text",
          "options": [
            {"text": "Option A", "isCorrect": false},
            {"text": "Option B", "isCorrect": true},
            {"text": "Option C", "isCorrect": false}
          ],
          "explanation": "Why this answer is correct"
        }
      ]
    }
  ]
}

Requirements:
- Create 2-4 modules with 2-3 lessons each
- Each lesson should be 10-20 minutes
- Include at least 1 quiz with 3-5 questions
- Content should be engaging and interactive
- Use progressive difficulty
- Return valid JSON only, no other text`
}

export async function generateLessonContent(
  title: string, 
  outline: string, 
  context: string
): Promise<string> {
  const prompt = `Create detailed lesson content for a course lesson.

Title: ${title}
Outline: ${outline}
Context: ${context}

Generate comprehensive lesson content in HTML format that includes:
- Clear explanations
- Examples and scenarios
- Interactive elements
- Key takeaways

The content should be engaging, educational, and take approximately 15 minutes to complete.`

  const message = await anthropic.messages.create({
    model: 'claude-3-sonnet-20240229',
    max_tokens: 2000,
    messages: [
      {
        role: 'user',
        content: prompt
      }
    ]
  })

  const content = message.content[0]
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Claude')
  }

  return content.text
}

export async function generateQuizQuestions(
  topic: string,
  content: string,
  numQuestions: number = 5
): Promise<Array<{
  question: string
  options: Array<{ text: string; isCorrect: boolean }>
  explanation: string
}>> {
  const prompt = `Create ${numQuestions} multiple choice quiz questions based on this content:

Topic: ${topic}
Content: ${content}

Generate questions that test understanding and application. Each question should have 4 options with exactly 1 correct answer.

Respond with valid JSON only in this format:
[
  {
    "question": "Question text?",
    "options": [
      {"text": "Option A", "isCorrect": false},
      {"text": "Option B", "isCorrect": true},
      {"text": "Option C", "isCorrect": false},
      {"text": "Option D", "isCorrect": false}
    ],
    "explanation": "Explanation of why the correct answer is right"
  }
]`

  const message = await anthropic.messages.create({
    model: 'claude-3-sonnet-20240229',
    max_tokens: 2000,
    messages: [
      {
        role: 'user',
        content: prompt
      }
    ]
  })

  const responseContent = message.content[0]
  if (responseContent.type !== 'text') {
    throw new Error('Unexpected response type from Claude')
  }

  try {
    return JSON.parse(responseContent.text)
  } catch (error) {
    throw new Error('Failed to parse quiz questions as JSON')
  }
}