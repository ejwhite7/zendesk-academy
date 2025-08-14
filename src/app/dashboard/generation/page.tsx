import { CourseGenerationForm } from '@/components/dashboard/course-generation-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createServerClient } from '@/lib/supabase/server'
import { Database } from '@/types/database'
import { Zap, Clock, BookOpen, Target } from 'lucide-react'

type KnowledgeSource = Database['public']['Tables']['knowledge_sources']['Row']

export default async function GenerationPage() {
  const supabase = createServerClient()

  // Get available knowledge sources
  const { data: knowledgeSources } = await supabase
    .from('knowledge_sources')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  // Get user's tenant
  const { data: { user } } = await supabase.auth.getUser()
  const { data: userProfile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user?.id || '')
    .single()

  const features = [
    {
      icon: Zap,
      title: 'AI-Powered Generation',
      description: 'Claude analyzes your KB articles to create structured learning paths',
    },
    {
      icon: Clock,
      title: 'Minutes to Launch',
      description: 'Go from KB articles to published course in under 10 minutes',
    },
    {
      icon: BookOpen,
      title: 'Complete Structure',
      description: 'Generates modules, lessons, assessments, and learning objectives',
    },
    {
      icon: Target,
      title: 'Progressive Learning',
      description: 'Builds beginner to expert paths with proper prerequisites',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Generate Course with AI
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Transform your knowledge base articles into interactive learning experiences
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {features.map((feature) => (
          <Card key={feature.title} className="border-l-4 border-l-primary">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-sm">{feature.title}</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {feature.description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Generation Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Course Generation Settings</CardTitle>
              <CardDescription>
                Configure how your course will be generated from your knowledge base
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CourseGenerationForm 
                knowledgeSources={knowledgeSources || []} 
                userProfile={userProfile}
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Generation Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tips for Better Courses</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 text-sm">
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <p>Select articles with clear, comprehensive content for best results</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <p>Use specific labels or sections to focus on related topics</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <p>Start with beginner level and progress to advanced concepts</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <p>Review and edit generated content before publishing</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Knowledge Sources Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Knowledge Sources</CardTitle>
            </CardHeader>
            <CardContent>
              {knowledgeSources && knowledgeSources.length > 0 ? (
                <div className="space-y-3">
                  {knowledgeSources.map((source: KnowledgeSource) => (
                    <div key={source.id} className="flex items-center justify-between text-sm">
                      <div>
                        <p className="font-medium">{source.name}</p>
                        <p className="text-gray-500 capitalize">{source.type}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${
                          source.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
                        }`}></div>
                        <span className="text-xs capitalize">{source.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-4">
                  <p className="text-sm">No knowledge sources connected</p>
                  <a 
                    href="/dashboard/sources" 
                    className="text-primary text-sm hover:underline"
                  >
                    Connect your first source
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Generations */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Generations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center text-gray-500 py-4">
                <p className="text-sm">No recent generations</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}