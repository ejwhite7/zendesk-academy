import axios, { AxiosInstance } from 'axios'

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
  author_id: number
  created_at: string
  updated_at: string
  section_id: number
  category_id: number
  locale: string
  label_names: string[]
  outdated: boolean
  draft: boolean
  promoted: boolean
  position: number
}

export interface ZendeskSection {
  id: number
  name: string
  description: string
  category_id: number
  locale: string
  html_url: string
  created_at: string
  updated_at: string
}

export interface ZendeskCategory {
  id: number
  name: string
  description: string
  locale: string
  html_url: string
  created_at: string
  updated_at: string
}

export interface ZendeskUser {
  id: number
  name: string
  email: string
  created_at: string
  updated_at: string
}

export interface SyncResult {
  articlesProcessed: number
  articlesCreated: number
  articlesUpdated: number
  errors: Array<{ articleId: number; error: string }>
}

export class ZendeskClient {
  private client: AxiosInstance
  private config: ZendeskConfig

  constructor(config: ZendeskConfig) {
    this.config = config
    this.client = axios.create({
      baseURL: `https://${config.subdomain}.zendesk.com/api/v2`,
      auth: {
        username: `${config.email}/token`,
        password: config.apiToken,
      },
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      timeout: 30000,
    })

    // Add rate limiting
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 429) {
          const retryAfter = parseInt(error.response.headers['retry-after'] || '60')
          console.warn(`Rate limited. Waiting ${retryAfter} seconds...`)
          await this.delay(retryAfter * 1000)
          return this.client.request(error.config)
        }
        return Promise.reject(error)
      }
    )
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.client.get('/help_center/articles.json?per_page=1')
      return true
    } catch (error) {
      console.error('Zendesk connection test failed:', error)
      return false
    }
  }

  async getArticles(options: {
    sectionId?: number
    categoryId?: number
    labelNames?: string[]
    locale?: string
    startTime?: string
    perPage?: number
    page?: number
  } = {}): Promise<{ articles: ZendeskArticle[]; hasMore: boolean }> {
    const params = new URLSearchParams()
    
    if (options.sectionId) params.append('section_id', options.sectionId.toString())
    if (options.categoryId) params.append('category_id', options.categoryId.toString())
    if (options.labelNames?.length) params.append('label_names', options.labelNames.join(','))
    if (options.locale) params.append('locale', options.locale)
    if (options.startTime) params.append('start_time', options.startTime)
    
    params.append('per_page', (options.perPage || 100).toString())
    params.append('page', (options.page || 1).toString())
    params.append('sort_by', 'updated_at')
    params.append('sort_order', 'desc')

    try {
      const response = await this.client.get(`/help_center/articles.json?${params.toString()}`)
      
      return {
        articles: response.data.articles.filter((article: ZendeskArticle) => !article.draft),
        hasMore: response.data.next_page !== null,
      }
    } catch (error) {
      console.error('Error fetching articles:', error)
      throw new Error('Failed to fetch articles from Zendesk')
    }
  }

  async getAllArticles(options: {
    sectionIds?: number[]
    categoryIds?: number[]
    labelNames?: string[]
    locale?: string
    startTime?: string
  } = {}): Promise<ZendeskArticle[]> {
    const allArticles: ZendeskArticle[] = []
    let page = 1
    let hasMore = true

    while (hasMore) {
      console.log(`Fetching articles page ${page}...`)
      
      try {
        const { articles, hasMore: more } = await this.getArticles({
          ...options,
          page,
          perPage: 100,
        })
        
        allArticles.push(...articles)
        hasMore = more
        page++
        
        // Add delay to respect rate limits
        if (hasMore) {
          await this.delay(200) // 200ms delay between requests
        }
      } catch (error) {
        console.error(`Error fetching page ${page}:`, error)
        break
      }
    }

    return allArticles
  }

  async getArticleById(id: number): Promise<ZendeskArticle | null> {
    try {
      const response = await this.client.get(`/help_center/articles/${id}.json`)
      return response.data.article
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null
      }
      console.error('Error fetching article:', error)
      throw new Error(`Failed to fetch article ${id}`)
    }
  }

  async getUpdatedArticlesSince(timestamp: string, options: {
    sectionIds?: number[]
    categoryIds?: number[]
    labelNames?: string[]
  } = {}): Promise<ZendeskArticle[]> {
    return this.getAllArticles({
      ...options,
      startTime: timestamp,
    })
  }

  async getSections(categoryId?: number): Promise<ZendeskSection[]> {
    try {
      const url = categoryId 
        ? `/help_center/categories/${categoryId}/sections.json`
        : '/help_center/sections.json'
      
      const response = await this.client.get(url)
      return response.data.sections
    } catch (error) {
      console.error('Error fetching sections:', error)
      throw new Error('Failed to fetch sections from Zendesk')
    }
  }

  async getCategories(): Promise<ZendeskCategory[]> {
    try {
      const response = await this.client.get('/help_center/categories.json')
      return response.data.categories
    } catch (error) {
      console.error('Error fetching categories:', error)
      throw new Error('Failed to fetch categories from Zendesk')
    }
  }

  async getUserById(id: number): Promise<ZendeskUser | null> {
    try {
      const response = await this.client.get(`/users/${id}.json`)
      return response.data.user
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null
      }
      console.error('Error fetching user:', error)
      return null
    }
  }

  // Convert Zendesk article to our internal format
  transformArticle(article: ZendeskArticle, author?: ZendeskUser): {
    externalId: string
    title: string
    content: string
    htmlContent: string
    url: string
    author: string | null
    labels: string[]
    section: string | null
    category: string | null
    lastModifiedAt: string
  } {
    // Strip HTML tags for plain text content
    const content = article.body.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
    
    return {
      externalId: article.id.toString(),
      title: article.title,
      content,
      htmlContent: article.body,
      url: article.html_url,
      author: author?.name || null,
      labels: article.label_names || [],
      section: article.section_id?.toString() || null,
      category: article.category_id?.toString() || null,
      lastModifiedAt: article.updated_at,
    }
  }
}

export function createZendeskClient(config: ZendeskConfig): ZendeskClient {
  return new ZendeskClient(config)
}

// Webhook payload interfaces for change detection
export interface ZendeskWebhookPayload {
  timestamp: string
  event: string
  subscription_id: number
  account_id: number
  detail: {
    [key: string]: any
  }
}

export interface ArticleWebhookDetail {
  id: number
  title: string
  body: string
  author_id: number
  section_id: number
  category_id: number
  updated_at: string
  draft: boolean
  outdated: boolean
}

export function parseArticleWebhook(payload: ZendeskWebhookPayload): {
  eventType: 'created' | 'updated' | 'deleted'
  articleId: number
  article?: ArticleWebhookDetail
} | null {
  const { event, detail } = payload

  if (event.startsWith('help_center.article.')) {
    const eventType = event.split('.').pop() as 'created' | 'updated' | 'deleted'
    
    return {
      eventType,
      articleId: detail.id,
      article: eventType !== 'deleted' ? detail as ArticleWebhookDetail : undefined,
    }
  }

  return null
}