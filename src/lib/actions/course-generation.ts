'use server'

import { CourseGenerationService, CourseGenerationRequest } from '@/lib/services/course-generation'

export async function generateCourse(request: CourseGenerationRequest) {
  try {
    const service = new CourseGenerationService()
    const result = await service.generateCourse(request)
    return result
  } catch (error) {
    console.error('Course generation action failed:', error)
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

export async function regenerateCourse(courseId: string) {
  try {
    const service = new CourseGenerationService()
    const result = await service.regenerateCourse(courseId)
    return result
  } catch (error) {
    console.error('Course regeneration action failed:', error)
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

export async function syncKnowledgeSource(knowledgeSourceId: string) {
  try {
    const service = new CourseGenerationService()
    const result = await service.syncWithKnowledgeSource(knowledgeSourceId)
    return result
  } catch (error) {
    console.error('Knowledge source sync action failed:', error)
    return {
      success: false,
      articlesProcessed: 0,
      coursesAffected: [],
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}