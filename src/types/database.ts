export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          role: 'admin' | 'learner'
          created_at: string
          updated_at: string
          profile: Json | null
        }
        Insert: {
          id?: string
          email: string
          role?: 'admin' | 'learner'
          created_at?: string
          updated_at?: string
          profile?: Json | null
        }
        Update: {
          id?: string
          email?: string
          role?: 'admin' | 'learner'
          created_at?: string
          updated_at?: string
          profile?: Json | null
        }
      }
      tenants: {
        Row: {
          id: string
          name: string
          subdomain: string | null
          custom_domain: string | null
          branding: Json | null
          zendesk_config: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          subdomain?: string | null
          custom_domain?: string | null
          branding?: Json | null
          zendesk_config?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          subdomain?: string | null
          custom_domain?: string | null
          branding?: Json | null
          zendesk_config?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      knowledge_sources: {
        Row: {
          id: string
          tenant_id: string
          name: string
          type: 'zendesk' | 'confluence' | 'notion' | 'github'
          config: Json
          last_sync_at: string | null
          status: 'active' | 'inactive' | 'syncing' | 'error'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          name: string
          type: 'zendesk' | 'confluence' | 'notion' | 'github'
          config: Json
          last_sync_at?: string | null
          status?: 'active' | 'inactive' | 'syncing' | 'error'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          name?: string
          type?: 'zendesk' | 'confluence' | 'notion' | 'github'
          config?: Json
          last_sync_at?: string | null
          status?: 'active' | 'inactive' | 'syncing' | 'error'
          created_at?: string
          updated_at?: string
        }
      }
      articles: {
        Row: {
          id: string
          knowledge_source_id: string
          external_id: string
          title: string
          content: string
          html_content: string | null
          url: string | null
          author: string | null
          labels: string[] | null
          section: string | null
          category: string | null
          last_modified_at: string
          embedding: number[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          knowledge_source_id: string
          external_id: string
          title: string
          content: string
          html_content?: string | null
          url?: string | null
          author?: string | null
          labels?: string[] | null
          section?: string | null
          category?: string | null
          last_modified_at: string
          embedding?: number[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          knowledge_source_id?: string
          external_id?: string
          title?: string
          content?: string
          html_content?: string | null
          url?: string | null
          author?: string | null
          labels?: string[] | null
          section?: string | null
          category?: string | null
          last_modified_at?: string
          embedding?: number[] | null
          created_at?: string
          updated_at?: string
        }
      }
      courses: {
        Row: {
          id: string
          tenant_id: string
          title: string
          description: string | null
          level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
          status: 'draft' | 'published' | 'archived'
          estimated_duration_minutes: number | null
          prerequisites: string[] | null
          learning_objectives: string[] | null
          version: number
          ai_generated: boolean
          last_generated_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          title: string
          description?: string | null
          level?: 'beginner' | 'intermediate' | 'advanced' | 'expert'
          status?: 'draft' | 'published' | 'archived'
          estimated_duration_minutes?: number | null
          prerequisites?: string[] | null
          learning_objectives?: string[] | null
          version?: number
          ai_generated?: boolean
          last_generated_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          title?: string
          description?: string | null
          level?: 'beginner' | 'intermediate' | 'advanced' | 'expert'
          status?: 'draft' | 'published' | 'archived'
          estimated_duration_minutes?: number | null
          prerequisites?: string[] | null
          learning_objectives?: string[] | null
          version?: number
          ai_generated?: boolean
          last_generated_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      modules: {
        Row: {
          id: string
          course_id: string
          title: string
          description: string | null
          order_index: number
          estimated_duration_minutes: number | null
          learning_objectives: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          course_id: string
          title: string
          description?: string | null
          order_index: number
          estimated_duration_minutes?: number | null
          learning_objectives?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          course_id?: string
          title?: string
          description?: string | null
          order_index?: number
          estimated_duration_minutes?: number | null
          learning_objectives?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      lessons: {
        Row: {
          id: string
          module_id: string
          title: string
          content: string
          content_type: 'text' | 'video' | 'interactive' | 'quiz'
          order_index: number
          estimated_duration_minutes: number | null
          source_articles: string[] | null
          ai_generated: boolean
          last_generated_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          module_id: string
          title: string
          content: string
          content_type?: 'text' | 'video' | 'interactive' | 'quiz'
          order_index: number
          estimated_duration_minutes?: number | null
          source_articles?: string[] | null
          ai_generated?: boolean
          last_generated_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          module_id?: string
          title?: string
          content?: string
          content_type?: 'text' | 'video' | 'interactive' | 'quiz'
          order_index?: number
          estimated_duration_minutes?: number | null
          source_articles?: string[] | null
          ai_generated?: boolean
          last_generated_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      assessments: {
        Row: {
          id: string
          lesson_id: string | null
          module_id: string | null
          course_id: string | null
          title: string
          description: string | null
          assessment_type: 'quiz' | 'scenario' | 'simulation' | 'checkpoint'
          passing_score: number
          max_attempts: number | null
          time_limit_minutes: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          lesson_id?: string | null
          module_id?: string | null
          course_id?: string | null
          title: string
          description?: string | null
          assessment_type?: 'quiz' | 'scenario' | 'simulation' | 'checkpoint'
          passing_score?: number
          max_attempts?: number | null
          time_limit_minutes?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          lesson_id?: string | null
          module_id?: string | null
          course_id?: string | null
          title?: string
          description?: string | null
          assessment_type?: 'quiz' | 'scenario' | 'simulation' | 'checkpoint'
          passing_score?: number
          max_attempts?: number | null
          time_limit_minutes?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      questions: {
        Row: {
          id: string
          assessment_id: string
          question_text: string
          question_type: 'multiple_choice' | 'true_false' | 'short_answer' | 'scenario_branch'
          order_index: number
          points: number
          explanation: string | null
          metadata: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          assessment_id: string
          question_text: string
          question_type?: 'multiple_choice' | 'true_false' | 'short_answer' | 'scenario_branch'
          order_index: number
          points?: number
          explanation?: string | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          assessment_id?: string
          question_text?: string
          question_type?: 'multiple_choice' | 'true_false' | 'short_answer' | 'scenario_branch'
          order_index?: number
          points?: number
          explanation?: string | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      answer_options: {
        Row: {
          id: string
          question_id: string
          option_text: string
          is_correct: boolean
          order_index: number
          explanation: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          question_id: string
          option_text: string
          is_correct?: boolean
          order_index: number
          explanation?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          question_id?: string
          option_text?: string
          is_correct?: boolean
          order_index?: number
          explanation?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      enrollments: {
        Row: {
          id: string
          user_id: string
          course_id: string
          status: 'active' | 'completed' | 'dropped' | 'suspended'
          enrolled_at: string
          started_at: string | null
          completed_at: string | null
          progress_percentage: number
          last_accessed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          course_id: string
          status?: 'active' | 'completed' | 'dropped' | 'suspended'
          enrolled_at?: string
          started_at?: string | null
          completed_at?: string | null
          progress_percentage?: number
          last_accessed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          course_id?: string
          status?: 'active' | 'completed' | 'dropped' | 'suspended'
          enrolled_at?: string
          started_at?: string | null
          completed_at?: string | null
          progress_percentage?: number
          last_accessed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      progress: {
        Row: {
          id: string
          enrollment_id: string
          lesson_id: string | null
          module_id: string | null
          status: 'not_started' | 'in_progress' | 'completed' | 'skipped'
          score: number | null
          time_spent_minutes: number | null
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          enrollment_id: string
          lesson_id?: string | null
          module_id?: string | null
          status?: 'not_started' | 'in_progress' | 'completed' | 'skipped'
          score?: number | null
          time_spent_minutes?: number | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          enrollment_id?: string
          lesson_id?: string | null
          module_id?: string | null
          status?: 'not_started' | 'in_progress' | 'completed' | 'skipped'
          score?: number | null
          time_spent_minutes?: number | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      attempts: {
        Row: {
          id: string
          enrollment_id: string
          assessment_id: string
          attempt_number: number
          score: number | null
          max_score: number
          passed: boolean | null
          time_spent_minutes: number | null
          started_at: string
          completed_at: string | null
          answers: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          enrollment_id: string
          assessment_id: string
          attempt_number: number
          score?: number | null
          max_score: number
          passed?: boolean | null
          time_spent_minutes?: number | null
          started_at?: string
          completed_at?: string | null
          answers: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          enrollment_id?: string
          assessment_id?: string
          attempt_number?: number
          score?: number | null
          max_score?: number
          passed?: boolean | null
          time_spent_minutes?: number | null
          started_at?: string
          completed_at?: string | null
          answers?: Json
          created_at?: string
          updated_at?: string
        }
      }
      badges: {
        Row: {
          id: string
          tenant_id: string
          name: string
          description: string
          criteria: Json
          badge_image_url: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          name: string
          description: string
          criteria: Json
          badge_image_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          name?: string
          description?: string
          criteria?: Json
          badge_image_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      user_badges: {
        Row: {
          id: string
          user_id: string
          badge_id: string
          earned_at: string
          verification_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          badge_id: string
          earned_at?: string
          verification_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          badge_id?: string
          earned_at?: string
          verification_url?: string | null
          created_at?: string
        }
      }
      certificates: {
        Row: {
          id: string
          user_id: string
          course_id: string
          certificate_url: string
          issued_at: string
          expires_at: string | null
          verification_code: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          course_id: string
          certificate_url: string
          issued_at?: string
          expires_at?: string | null
          verification_code: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          course_id?: string
          certificate_url?: string
          issued_at?: string
          expires_at?: string | null
          verification_code?: string
          created_at?: string
        }
      }
      webhook_events: {
        Row: {
          id: string
          source: string
          event_type: string
          payload: Json
          processed: boolean
          processed_at: string | null
          error_message: string | null
          created_at: string
        }
        Insert: {
          id?: string
          source: string
          event_type: string
          payload: Json
          processed?: boolean
          processed_at?: string | null
          error_message?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          source?: string
          event_type?: string
          payload?: Json
          processed?: boolean
          processed_at?: string | null
          error_message?: string | null
          created_at?: string
        }
      }
      sync_runs: {
        Row: {
          id: string
          knowledge_source_id: string
          status: 'running' | 'completed' | 'failed'
          articles_processed: number | null
          articles_created: number | null
          articles_updated: number | null
          error_message: string | null
          started_at: string
          completed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          knowledge_source_id: string
          status?: 'running' | 'completed' | 'failed'
          articles_processed?: number | null
          articles_created?: number | null
          articles_updated?: number | null
          error_message?: string | null
          started_at?: string
          completed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          knowledge_source_id?: string
          status?: 'running' | 'completed' | 'failed'
          articles_processed?: number | null
          articles_created?: number | null
          articles_updated?: number | null
          error_message?: string | null
          started_at?: string
          completed_at?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      match_documents: {
        Args: {
          query_embedding: number[]
          match_threshold: number
          match_count: number
        }
        Returns: {
          id: string
          content: string
          similarity: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}