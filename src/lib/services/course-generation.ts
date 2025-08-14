import { createServerActionClient } from '@/lib/supabase/server'
import { generateCourseStructure, generateLessonContent, generateAssessment, CourseGenerationOptions } from '@/lib/anthropic/client'
import { ZendeskClient, ZendeskArticle } from '@/lib/zendesk/client'
import { Database } from '@/types/database'

type CourseInsert = Database['public']['Tables']['courses']['Insert']
type ModuleInsert = Database['public']['Tables']['modules']['Insert']
type LessonInsert = Database['public']['Tables']['lessons']['Insert']
type AssessmentInsert = Database['public']['Tables']['assessments']['Insert']
type QuestionInsert = Database['public']['Tables']['questions']['Insert']
type AnswerOptionInsert = Database['public']['Tables']['answer_options']['Insert']

export interface CourseGenerationRequest {
  tenantId: string
  knowledgeSourceId: string
  title?: string
  level?: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  articleIds?: string[]
  sectionIds?: string[]
  categoryIds?: string[]
  labelNames?: string[]
  options?: CourseGenerationOptions
}

export interface CourseGenerationResult {
  courseId: string
  success: boolean
  error?: string
  stats: {
    modulesCreated: number
    lessonsCreated: number
    assessmentsCreated: number
    articlesProcessed: number
  }
}

export class CourseGenerationService {
  private supabase = createServerActionClient()

  async generateCourse(request: CourseGenerationRequest): Promise<CourseGenerationResult> {
    try {
      // 1. Fetch knowledge source configuration
      const { data: knowledgeSource } = await this.supabase
        .from('knowledge_sources')
        .select('*')
        .eq('id', request.knowledgeSourceId)
        .single()

      if (!knowledgeSource) {
        throw new Error('Knowledge source not found')
      }

      // 2. Initialize Zendesk client
      const zendeskConfig = knowledgeSource.config as {
        subdomain: string
        apiToken: string
        email: string
      }
      const zendeskClient = new ZendeskClient(zendeskConfig)

      // 3. Fetch articles based on criteria
      const articles = await this.fetchRelevantArticles(zendeskClient, request)

      if (articles.length === 0) {
        throw new Error('No articles found matching the criteria')
      }

      // 4. Generate course structure using Claude
      const generatedCourse = await generateCourseStructure(
        articles.map(article => ({
          title: article.title,
          content: article.body, // Use body instead of content
          url: article.html_url, // Use html_url instead of url
        })),
        request.options
      )

      // 5. Create course in database
      const courseData: CourseInsert = {
        tenant_id: request.tenantId,
        title: request.title || generatedCourse.title,
        description: generatedCourse.description,
        level: request.level || generatedCourse.level,
        status: 'draft',
        estimated_duration_minutes: generatedCourse.estimatedDurationMinutes,
        learning_objectives: generatedCourse.learningObjectives,
        ai_generated: true,
        last_generated_at: new Date().toISOString(),
      }

      const { data: course, error: courseError } = await this.supabase
        .from('courses')
        .insert(courseData)
        .select()
        .single()

      if (courseError) {
        throw new Error(`Failed to create course: ${courseError.message}`)
      }

      // 6. Create modules, lessons, and assessments
      const stats = await this.createCourseContent(
        course.id,
        generatedCourse.modules,
        articles
      )

      return {
        courseId: course.id,
        success: true,
        stats: {
          ...stats,
          articlesProcessed: articles.length,
        },
      }
    } catch (error) {
      console.error('Course generation failed:', error)
      return {
        courseId: '',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        stats: {
          modulesCreated: 0,
          lessonsCreated: 0,
          assessmentsCreated: 0,
          articlesProcessed: 0,
        },
      }
    }
  }

  private async fetchRelevantArticles(
    zendeskClient: ZendeskClient,
    request: CourseGenerationRequest
  ): Promise<ZendeskArticle[]> {
    if (request.articleIds?.length) {
      // Fetch specific articles by ID
      const articles: ZendeskArticle[] = []
      for (const articleId of request.articleIds) {
        const article = await zendeskClient.getArticleById(parseInt(articleId))
        if (article) {
          articles.push(article)
        }
      }
      return articles
    }

    // Fetch articles by criteria
    return zendeskClient.getAllArticles({
      sectionIds: request.sectionIds?.map(id => parseInt(id)),
      categoryIds: request.categoryIds?.map(id => parseInt(id)),
      labelNames: request.labelNames,
    })
  }

  private async createCourseContent(
    courseId: string,
    modules: any[],
    sourceArticles: ZendeskArticle[]
  ): Promise<{
    modulesCreated: number
    lessonsCreated: number
    assessmentsCreated: number
  }> {
    let modulesCreated = 0
    let lessonsCreated = 0
    let assessmentsCreated = 0

    for (let moduleIndex = 0; moduleIndex < modules.length; moduleIndex++) {
      const moduleData = modules[moduleIndex]

      // Create module
      const moduleInsert: ModuleInsert = {
        course_id: courseId,
        title: moduleData.title,
        description: moduleData.description,
        order_index: moduleIndex,
        estimated_duration_minutes: moduleData.estimatedDurationMinutes,
        learning_objectives: moduleData.learningObjectives,
      }

      const { data: module, error: moduleError } = await this.supabase
        .from('modules')
        .insert(moduleInsert)
        .select()
        .single()

      if (moduleError) {
        console.error('Failed to create module:', moduleError)
        continue
      }

      modulesCreated++

      // Create lessons for this module
      for (let lessonIndex = 0; lessonIndex < moduleData.lessons.length; lessonIndex++) {
        const lessonData = moduleData.lessons[lessonIndex]

        // Generate detailed lesson content
        const detailedContent = await generateLessonContent(
          lessonData.title,
          `${moduleData.title}: ${moduleData.description}`,
          sourceArticles.map(article => ({
            title: article.title,
            content: article.body,
          })),
          'beginner'
        )

        const lessonInsert: LessonInsert = {
          module_id: module.id,
          title: lessonData.title,
          content: detailedContent.content,
          content_type: lessonData.contentType,
          order_index: lessonIndex,
          estimated_duration_minutes: detailedContent.estimatedDurationMinutes,
          source_articles: lessonData.sourceArticles,
          ai_generated: true,
          last_generated_at: new Date().toISOString(),
        }

        const { data: lesson, error: lessonError } = await this.supabase
          .from('lessons')
          .insert(lessonInsert)
          .select()
          .single()

        if (lessonError) {
          console.error('Failed to create lesson:', lessonError)
          continue
        }

        lessonsCreated++

        // Generate assessment for lesson (if content is suitable)
        if (lessonData.contentType === 'text' || lessonData.contentType === 'quiz') {
          try {
            const assessment = await generateAssessment(
              detailedContent.content,
              'quiz',
              5
            )

            const assessmentInsert: AssessmentInsert = {
              lesson_id: lesson.id,
              title: assessment.title,
              description: assessment.description,
              assessment_type: assessment.assessmentType,
              passing_score: assessment.passingScore,
            }

            const { data: assessmentRecord, error: assessmentError } = await this.supabase
              .from('assessments')
              .insert(assessmentInsert)
              .select()
              .single()

            if (assessmentError) {
              console.error('Failed to create assessment:', assessmentError)
              continue
            }

            // Create questions and answer options
            await this.createAssessmentQuestions(assessmentRecord.id, assessment.questions)
            assessmentsCreated++
          } catch (error) {
            console.error('Failed to generate assessment for lesson:', error)
          }
        }
      }
    }

    return {
      modulesCreated,
      lessonsCreated,
      assessmentsCreated,
    }
  }

  private async createAssessmentQuestions(
    assessmentId: string,
    questions: any[]
  ): Promise<void> {
    for (let questionIndex = 0; questionIndex < questions.length; questionIndex++) {
      const questionData = questions[questionIndex]

      const questionInsert: QuestionInsert = {
        assessment_id: assessmentId,
        question_text: questionData.questionText,
        question_type: questionData.questionType,
        order_index: questionIndex,
        points: questionData.points,
        explanation: questionData.explanation,
      }

      const { data: question, error: questionError } = await this.supabase
        .from('questions')
        .insert(questionInsert)
        .select()
        .single()

      if (questionError) {
        console.error('Failed to create question:', questionError)
        continue
      }

      // Create answer options
      for (let optionIndex = 0; optionIndex < questionData.answerOptions.length; optionIndex++) {
        const optionData = questionData.answerOptions[optionIndex]

        const optionInsert: AnswerOptionInsert = {
          question_id: question.id,
          option_text: optionData.optionText,
          is_correct: optionData.isCorrect,
          order_index: optionIndex,
          explanation: optionData.explanation,
        }

        const { error: optionError } = await this.supabase
          .from('answer_options')
          .insert(optionInsert)

        if (optionError) {
          console.error('Failed to create answer option:', optionError)
        }
      }
    }
  }

  async regenerateCourse(courseId: string): Promise<CourseGenerationResult> {
    try {
      // Get existing course
      const { data: course } = await this.supabase
        .from('courses')
        .select(`
          *,
          tenant_id,
          modules (
            *,
            lessons (
              *,
              source_articles
            )
          )
        `)
        .eq('id', courseId)
        .single()

      if (!course) {
        throw new Error('Course not found')
      }

      // Get knowledge source for the tenant
      const { data: knowledgeSource } = await this.supabase
        .from('knowledge_sources')
        .select('*')
        .eq('tenant_id', course.tenant_id)
        .eq('status', 'active')
        .single()

      if (!knowledgeSource) {
        throw new Error('No active knowledge source found for tenant')
      }

      // Collect source article IDs from existing lessons
      const sourceArticleIds = new Set<string>()
      course.modules?.forEach((module: any) => {
        module.lessons?.forEach((lesson: any) => {
          lesson.source_articles?.forEach((articleId: string) => {
            sourceArticleIds.add(articleId)
          })
        })
      })

      // Regenerate course with updated articles
      return this.generateCourse({
        tenantId: course.tenant_id,
        knowledgeSourceId: knowledgeSource.id,
        title: course.title,
        level: course.level,
        articleIds: Array.from(sourceArticleIds),
        options: {
          level: course.level,
        },
      })
    } catch (error) {
      console.error('Course regeneration failed:', error)
      return {
        courseId: courseId,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        stats: {
          modulesCreated: 0,
          lessonsCreated: 0,
          assessmentsCreated: 0,
          articlesProcessed: 0,
        },
      }
    }
  }

  async syncWithKnowledgeSource(knowledgeSourceId: string): Promise<{
    success: boolean
    articlesProcessed: number
    coursesAffected: string[]
    error?: string
  }> {
    try {
      // Get knowledge source
      const { data: knowledgeSource } = await this.supabase
        .from('knowledge_sources')
        .select('*')
        .eq('id', knowledgeSourceId)
        .single()

      if (!knowledgeSource) {
        throw new Error('Knowledge source not found')
      }

      // Initialize Zendesk client
      const zendeskConfig = knowledgeSource.config as {
        subdomain: string
        apiToken: string
        email: string
      }
      const zendeskClient = new ZendeskClient(zendeskConfig)

      // Get last sync time
      const lastSync = knowledgeSource.last_sync_at || '1970-01-01T00:00:00Z'

      // Fetch updated articles
      const updatedArticles = await zendeskClient.getUpdatedArticlesSince(lastSync)

      // Update articles in database
      let articlesProcessed = 0
      for (const article of updatedArticles) {
        const transformedArticle = zendeskClient.transformArticle(article)

        await this.supabase
          .from('articles')
          .upsert({
            knowledge_source_id: knowledgeSourceId,
            external_id: transformedArticle.externalId,
            title: transformedArticle.title,
            content: transformedArticle.content,
            html_content: transformedArticle.htmlContent,
            url: transformedArticle.url,
            author: transformedArticle.author,
            labels: transformedArticle.labels,
            section: transformedArticle.section,
            category: transformedArticle.category,
            last_modified_at: transformedArticle.lastModifiedAt,
          })

        articlesProcessed++
      }

      // Update last sync time
      await this.supabase
        .from('knowledge_sources')
        .update({
          last_sync_at: new Date().toISOString(),
          status: 'active',
        })
        .eq('id', knowledgeSourceId)

      // Find courses that need to be updated based on changed articles
      const { data: affectedCourses } = await this.supabase
        .from('courses')
        .select('id')
        .eq('tenant_id', knowledgeSource.tenant_id)
        .eq('ai_generated', true)

      return {
        success: true,
        articlesProcessed,
        coursesAffected: affectedCourses?.map(c => c.id) || [],
      }
    } catch (error) {
      console.error('Knowledge source sync failed:', error)
      return {
        success: false,
        articlesProcessed: 0,
        coursesAffected: [],
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      }
    }
  }
}