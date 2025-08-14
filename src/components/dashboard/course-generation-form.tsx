'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, Plus, X, Zap } from 'lucide-react'
import { generateCourse } from '@/lib/actions/course-generation'

interface CourseGenerationFormProps {
  knowledgeSources: any[]
  userProfile: any
}

export function CourseGenerationForm({ knowledgeSources, userProfile }: CourseGenerationFormProps) {
  const router = useRouter()
  const [isGenerating, setIsGenerating] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    level: 'beginner' as 'beginner' | 'intermediate' | 'advanced' | 'expert',
    knowledgeSourceId: '',
    articleIds: [] as string[],
    sectionIds: [] as string[],
    categoryIds: [] as string[],
    labelNames: [] as string[],
    maxModules: 5,
    maxLessonsPerModule: 6,
    includeAssessments: true,
  })
  
  const [newLabel, setNewLabel] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.knowledgeSourceId) {
      setError('Please select a knowledge source')
      return
    }

    if (formData.articleIds.length === 0 && 
        formData.sectionIds.length === 0 && 
        formData.categoryIds.length === 0 && 
        formData.labelNames.length === 0) {
      setError('Please specify at least one article selection criteria')
      return
    }

    setIsGenerating(true)

    try {
      const result = await generateCourse({
        tenantId: userProfile?.tenant_id || 'default',
        knowledgeSourceId: formData.knowledgeSourceId,
        title: formData.title || undefined,
        level: formData.level,
        articleIds: formData.articleIds.length > 0 ? formData.articleIds : undefined,
        sectionIds: formData.sectionIds.length > 0 ? formData.sectionIds : undefined,
        categoryIds: formData.categoryIds.length > 0 ? formData.categoryIds : undefined,
        labelNames: formData.labelNames.length > 0 ? formData.labelNames : undefined,
        options: {
          level: formData.level,
          maxModules: formData.maxModules,
          maxLessonsPerModule: formData.maxLessonsPerModule,
          includeAssessments: formData.includeAssessments,
        },
      })

      if (result.success) {
        router.push(`/dashboard/courses/${result.courseId}`)
      } else {
        setError(result.error || 'Failed to generate course')
      }
    } catch (err) {
      setError('An unexpected error occurred')
      console.error('Course generation error:', err)
    } finally {
      setIsGenerating(false)
    }
  }

  const addLabel = () => {
    if (newLabel.trim() && !formData.labelNames.includes(newLabel.trim())) {
      setFormData(prev => ({
        ...prev,
        labelNames: [...prev.labelNames, newLabel.trim()]
      }))
      setNewLabel('')
    }
  }

  const removeLabel = (label: string) => {
    setFormData(prev => ({
      ...prev,
      labelNames: prev.labelNames.filter(l => l !== label)
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Course Information</h3>
          
          <div>
            <Label htmlFor="title">Course Title (Optional)</Label>
            <Input
              id="title"
              placeholder="AI will generate if empty"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="AI will generate based on content"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="level">Target Level</Label>
            <Select value={formData.level} onValueChange={(value: any) => setFormData(prev => ({ ...prev, level: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
                <SelectItem value="expert">Expert</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Source Selection */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Content Source</h3>
          
          <div>
            <Label htmlFor="source">Knowledge Source</Label>
            <Select 
              value={formData.knowledgeSourceId} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, knowledgeSourceId: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a knowledge source" />
              </SelectTrigger>
              <SelectContent>
                {knowledgeSources.map((source) => (
                  <SelectItem key={source.id} value={source.id}>
                    {source.name} ({source.type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {knowledgeSources.length === 0 && (
              <p className="text-sm text-gray-500 mt-1">
                No knowledge sources available. 
                <a href="/dashboard/sources" className="text-primary hover:underline ml-1">
                  Connect one first
                </a>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Article Selection Criteria */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Article Selection</CardTitle>
          <CardDescription>
            Specify which articles to include in your course
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Article IDs */}
          <div>
            <Label htmlFor="articleIds">Specific Article IDs (comma-separated)</Label>
            <Input
              id="articleIds"
              placeholder="123456, 789012, 345678"
              value={formData.articleIds.join(', ')}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                articleIds: e.target.value.split(',').map(id => id.trim()).filter(Boolean)
              }))}
            />
            <p className="text-sm text-gray-500 mt-1">
              Leave empty to use sections, categories, or labels instead
            </p>
          </div>

          {/* Section IDs */}
          <div>
            <Label htmlFor="sectionIds">Section IDs (comma-separated)</Label>
            <Input
              id="sectionIds"
              placeholder="123, 456, 789"
              value={formData.sectionIds.join(', ')}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                sectionIds: e.target.value.split(',').map(id => id.trim()).filter(Boolean)
              }))}
            />
          </div>

          {/* Category IDs */}
          <div>
            <Label htmlFor="categoryIds">Category IDs (comma-separated)</Label>
            <Input
              id="categoryIds"
              placeholder="123, 456, 789"
              value={formData.categoryIds.join(', ')}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                categoryIds: e.target.value.split(',').map(id => id.trim()).filter(Boolean)
              }))}
            />
          </div>

          {/* Labels */}
          <div>
            <Label>Article Labels</Label>
            <div className="flex space-x-2 mt-1">
              <Input
                placeholder="Add label name"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLabel())}
              />
              <Button type="button" variant="outline" size="icon" onClick={addLabel}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {formData.labelNames.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.labelNames.map((label) => (
                  <Badge key={label} variant="secondary" className="flex items-center gap-1">
                    {label}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => removeLabel(label)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Generation Options */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Generation Options</CardTitle>
          <CardDescription>
            Fine-tune how your course is structured
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="maxModules">Maximum Modules</Label>
              <Input
                id="maxModules"
                type="number"
                min="1"
                max="10"
                value={formData.maxModules}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  maxModules: parseInt(e.target.value) || 5
                }))}
              />
            </div>
            <div>
              <Label htmlFor="maxLessons">Max Lessons per Module</Label>
              <Input
                id="maxLessons"
                type="number"
                min="1"
                max="15"
                value={formData.maxLessonsPerModule}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  maxLessonsPerModule: parseInt(e.target.value) || 6
                }))}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="assessments"
              checked={formData.includeAssessments}
              onCheckedChange={(checked) => setFormData(prev => ({ 
                ...prev, 
                includeAssessments: !!checked
              }))}
            />
            <Label htmlFor="assessments">Include assessments and quizzes</Label>
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={isGenerating}>
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Zap className="h-4 w-4 mr-2" />
              Generate Course
            </>
          )}
        </Button>
      </div>
    </form>
  )
}