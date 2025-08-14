export interface ZendeskConfig {
  subdomain: string
  apiToken: string
  email: string
}

export interface ZendeskArticle {
  id: number
  title: string
  body: string
  html_url: string
  section_id: number
  category_id: number
  locale: string
  source_locale: string
  author_id: number
  comments_disabled: boolean
  outdated: boolean
  labels: string[]
  draft: boolean
  promoted: boolean
  position: number
  vote_sum: number
  vote_count: number
  created_at: string
  updated_at: string
  url?: string
  content?: string
}

export interface ZendeskSection {
  id: number
  name: string
  description: string
  locale: string
  source_locale: string
  url: string
  html_url: string
  outdated: boolean
  position: number
  translation: any
  created_at: string
  updated_at: string
}

export interface ZendeskCategory {
  id: number
  name: string
  description: string
  locale: string
  source_locale: string
  url: string
  html_url: string
  outdated: boolean
  position: number
  translation: any
  created_at: string
  updated_at: string
}

export class ZendeskClient {
  private baseUrl: string
  private headers: Headers

  constructor(config: ZendeskConfig) {
    this.baseUrl = `https://${config.subdomain}.zendesk.com/api/v2`
    this.headers = new Headers({
      'Authorization': `Basic ${Buffer.from(`${config.email}/token:${config.apiToken}`).toString('base64')}`,
      'Content-Type': 'application/json',
    })
  }

  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/help_center/articles.json?per_page=1`, {
        headers: this.headers,
      })

      if (!response.ok) {
        if (response.status === 401) {
          return { success: false, error: 'Invalid credentials' }
        }
        if (response.status === 404) {
          return { success: false, error: 'Subdomain not found' }
        }
        return { success: false, error: `HTTP ${response.status}: ${response.statusText}` }
      }

      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  async getArticles(options: {
    sectionIds?: number[]
    categoryIds?: number[]
    labels?: string[]
    limit?: number
    offset?: number
  } = {}): Promise<ZendeskArticle[]> {
    let url = `${this.baseUrl}/help_center/articles.json`
    const params = new URLSearchParams()

    if (options.limit) params.append('per_page', options.limit.toString())
    if (options.offset) params.append('page', Math.floor(options.offset / (options.limit || 30) + 1).toString())
    
    if (options.sectionIds?.length) {
      params.append('section', options.sectionIds.join(','))
    }
    
    if (options.categoryIds?.length) {
      params.append('category', options.categoryIds.join(','))
    }

    if (params.toString()) {
      url += `?${params.toString()}`
    }

    const response = await fetch(url, { headers: this.headers })
    
    if (!response.ok) {
      throw new Error(`Failed to fetch articles: ${response.statusText}`)
    }

    const data = await response.json()
    let articles: ZendeskArticle[] = data.articles || []

    // Filter by labels if specified
    if (options.labels?.length) {
      articles = articles.filter(article => 
        options.labels!.some(label => article.labels.includes(label))
      )
    }

    // Add processed content
    articles = articles.map(article => ({
      ...article,
      content: this.processArticleContent(article.body),
      url: article.html_url
    }))

    return articles
  }

  async getArticleById(id: number): Promise<ZendeskArticle | null> {
    const response = await fetch(`${this.baseUrl}/help_center/articles/${id}.json`, {
      headers: this.headers,
    })

    if (!response.ok) {
      if (response.status === 404) return null
      throw new Error(`Failed to fetch article: ${response.statusText}`)
    }

    const data = await response.json()
    const article = data.article

    return {
      ...article,
      content: this.processArticleContent(article.body),
      url: article.html_url
    }
  }

  async getSections(): Promise<ZendeskSection[]> {
    const response = await fetch(`${this.baseUrl}/help_center/sections.json`, {
      headers: this.headers,
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch sections: ${response.statusText}`)
    }

    const data = await response.json()
    return data.sections || []
  }

  async getCategories(): Promise<ZendeskCategory[]> {
    const response = await fetch(`${this.baseUrl}/help_center/categories.json`, {
      headers: this.headers,
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch categories: ${response.statusText}`)
    }

    const data = await response.json()
    return data.categories || []
  }

  async searchArticles(query: string, options: {
    sectionIds?: number[]
    categoryIds?: number[]
    limit?: number
  } = {}): Promise<ZendeskArticle[]> {
    const params = new URLSearchParams()
    params.append('query', query)
    
    if (options.limit) params.append('per_page', options.limit.toString())
    if (options.sectionIds?.length) params.append('section', options.sectionIds.join(','))
    if (options.categoryIds?.length) params.append('category', options.categoryIds.join(','))

    const response = await fetch(`${this.baseUrl}/help_center/articles/search.json?${params}`, {
      headers: this.headers,
    })

    if (!response.ok) {
      throw new Error(`Failed to search articles: ${response.statusText}`)
    }

    const data = await response.json()
    const articles: ZendeskArticle[] = data.results || []

    return articles.map(article => ({
      ...article,
      content: this.processArticleContent(article.body),
      url: article.html_url
    }))
  }

  private processArticleContent(htmlContent: string): string {
    // Remove Zendesk-specific markup and clean up HTML
    return htmlContent
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<!--[\s\S]*?-->/g, '')
      .trim()
  }
}

export function createZendeskClient(config: ZendeskConfig): ZendeskClient {
  return new ZendeskClient(config)
}