import Anthropic from '@anthropic-ai/sdk'

if (!process.env.ANTHROPIC_API_KEY) {
  throw new Error('ANTHROPIC_API_KEY is not set in environment variables')
}

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export interface CourseGenerationOptions {
  title?: string
  level?: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  maxModules?: number
  maxLessonsPerModule?: number
  includeAssessments?: boolean
}

export interface GeneratedCourse {
  title: string
  description: string
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  estimatedDurationMinutes: number
  learningObjectives: string[]
  modules: GeneratedModule[]
}

export interface GeneratedModule {
  title: string
  description: string
  estimatedDurationMinutes: number
  learningObjectives: string[]
  lessons: GeneratedLesson[]
}

export interface GeneratedLesson {
  title: string
  content: string
  contentType: 'text' | 'video' | 'interactive' | 'quiz'
  estimatedDurationMinutes: number
  sourceArticles?: string[]
}

export interface GeneratedAssessment {
  title: string
  description: string
  assessmentType: 'quiz' | 'scenario' | 'simulation' | 'checkpoint'
  passingScore: number
  questions: GeneratedQuestion[]
}

export interface GeneratedQuestion {
  questionText: string
  questionType: 'multiple_choice' | 'true_false' | 'short_answer' | 'scenario_branch'
  points: number
  explanation?: string
  answerOptions: GeneratedAnswerOption[]
}

export interface GeneratedAnswerOption {
  optionText: string
  isCorrect: boolean
  explanation?: string
}

export const DEFAULT_SYSTEM_PROMPT = `You are an expert instructional designer and course creator. Your role is to transform knowledge base articles into engaging, progressive learning experiences.

Key principles:
1. Create clear learning paths from beginner to expert
2. Break complex topics into digestible modules and lessons
3. Include practical examples and real-world applications
4. Generate assessments that test understanding, not memorization
5. Ensure content is accessible and inclusive
6. Maintain consistency with source material accuracy

Always structure your responses as valid JSON matching the expected interfaces.`

export async function generateCourseStructure(
  articles: Array<{ title: string; content: string; url?: string }>,
  options: CourseGenerationOptions = {}
): Promise<GeneratedCourse> {
  const prompt = `
Based on the following knowledge base articles, generate a comprehensive course structure.

Articles:
${articles.map((article, index) => `
Article ${index + 1}:
Title: ${article.title}
Content: ${article.content.slice(0, 2000)}...
${article.url ? `URL: ${article.url}` : ''}
`).join('\n')}

Course Requirements:
- Level: ${options.level || 'beginner'}
- Max Modules: ${options.maxModules || 5}
- Max Lessons per Module: ${options.maxLessonsPerModule || 6}
- Include Assessments: ${options.includeAssessments !== false}

Generate a complete course structure with:
1. Engaging course title and description
2. Clear learning objectives
3. Progressive modules building from basic concepts to advanced
4. Detailed lessons with rich content
5. Estimated time requirements
6. Reference to source articles where applicable

Respond with valid JSON matching the GeneratedCourse interface.`

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 8000,
      system: DEFAULT_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    const content = response.content[0]
    if (content.type !== 'text') {
      throw new Error('Unexpected response format from Claude')
    }

    const generatedCourse = JSON.parse(content.text) as GeneratedCourse
    return generatedCourse
  } catch (error) {
    console.error('Error generating course structure:', error)
    throw new Error('Failed to generate course structure')
  }
}

export async function generateLessonContent(
  lessonTitle: string,
  moduleContext: string,
  sourceArticles: Array<{ title: string; content: string }>,
  targetAudience: string = 'beginner'
): Promise<{ content: string; estimatedDurationMinutes: number }> {
  const prompt = `
Create detailed lesson content for: "${lessonTitle}"

Module Context: ${moduleContext}

Source Articles:
${sourceArticles.map((article, index) => `
Article ${index + 1}:
Title: ${article.title}
Content: ${article.content.slice(0, 1500)}...
`).join('\n')}

Target Audience: ${targetAudience}

Requirements:
1. Create engaging, educational content suitable for ${targetAudience} level
2. Use clear headings and structure
3. Include practical examples
4. Add callout boxes for important points
5. Suggest interactive elements where appropriate
6. Estimate realistic completion time

Format as markdown with the following structure:
# Lesson Title
## Overview
## Key Concepts
## Detailed Content
## Summary
## Next Steps

Also provide an estimated duration in minutes.

Respond with JSON: { "content": "markdown content", "estimatedDurationMinutes": number }`

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4000,
      system: DEFAULT_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    const content = response.content[0]
    if (content.type !== 'text') {
      throw new Error('Unexpected response format from Claude')
    }

    return JSON.parse(content.text)
  } catch (error) {
    console.error('Error generating lesson content:', error)
    throw new Error('Failed to generate lesson content')
  }
}

export async function generateAssessment(
  lessonContent: string,
  assessmentType: 'quiz' | 'scenario' | 'simulation' | 'checkpoint' = 'quiz',
  numQuestions: number = 5
): Promise<GeneratedAssessment> {
  const prompt = `
Based on this lesson content, create a ${assessmentType} assessment:

Lesson Content:
${lessonContent.slice(0, 2000)}...

Requirements:
- Generate ${numQuestions} questions
- Mix question types (multiple choice, true/false, scenarios)
- Focus on understanding and application, not memorization
- Include explanations for correct answers
- Set appropriate passing score (typically 70-80%)

For ${assessmentType} type assessments:
${assessmentType === 'quiz' ? '- Standard knowledge check format' : ''}
${assessmentType === 'scenario' ? '- Include branching decision points' : ''}
${assessmentType === 'simulation' ? '- Create interactive problem-solving scenarios' : ''}
${assessmentType === 'checkpoint' ? '- Quick comprehension checks' : ''}

Respond with valid JSON matching the GeneratedAssessment interface.`

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 3000,
      system: DEFAULT_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    const content = response.content[0]
    if (content.type !== 'text') {
      throw new Error('Unexpected response format from Claude')
    }

    return JSON.parse(content.text) as GeneratedAssessment
  } catch (error) {
    console.error('Error generating assessment:', error)
    throw new Error('Failed to generate assessment')
  }
}

export async function generateContentUpdate(
  originalContent: string,
  updatedSourceArticles: Array<{ title: string; content: string; lastModified: string }>,
  preserveCustomEdits: boolean = true
): Promise<{
  updatedContent: string
  changeSummary: string
  conflictAreas: string[]
}> {
  const prompt = `
Analyze the original content and updated source articles to generate content updates.

Original Content:
${originalContent.slice(0, 2000)}...

Updated Source Articles:
${updatedSourceArticles.map((article, index) => `
Article ${index + 1}:
Title: ${article.title}
Last Modified: ${article.lastModified}
Content: ${article.content.slice(0, 1500)}...
`).join('\n')}

Requirements:
1. Identify what has changed in the source articles
2. Update the content while ${preserveCustomEdits ? 'preserving custom edits and improvements' : 'replacing with new information'}
3. Provide a clear summary of changes
4. Flag any potential conflicts between original content and new information

Respond with JSON:
{
  "updatedContent": "the updated content",
  "changeSummary": "summary of what changed",
  "conflictAreas": ["list of potential conflicts"]
}`

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4000,
      system: DEFAULT_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    const content = response.content[0]
    if (content.type !== 'text') {
      throw new Error('Unexpected response format from Claude')
    }

    return JSON.parse(content.text)
  } catch (error) {
    console.error('Error generating content update:', error)
    throw new Error('Failed to generate content update')
  }
}