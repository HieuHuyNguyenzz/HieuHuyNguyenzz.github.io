import { Client } from '@notionhq/client';
import 'dotenv/config';

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

const databaseId = process.env.NOTION_DATABASE_ID;

export interface ResearchItem {
  slug: string;
  title: string;
  role: string;
  isFirstAuthor: boolean;
  venue: string;
  year: number;
  contribution: string;
  authors: string;
  abstract: string;
  keywords: string[];
  pdfLink: string;
  codeLink: string;
  status: 'published' | 'under-review' | 'in-progress';
}

function getPropertyValue(page: any, propertyName: string): any {
  const property = page.properties[propertyName];
  if (!property) return null;

  switch (property.type) {
    case 'title':
      return property.title?.[0]?.plain_text || '';
    case 'rich_text':
      return property.rich_text?.[0]?.plain_text || '';
    case 'select':
      return property.select?.name || '';
    case 'multi_select':
      return property.multi_select?.map((item: any) => item.name) || [];
    case 'url':
      return property.url || '';
    case 'number':
      return property.number || 0;
    case 'checkbox':
      return property.checkbox || false;
    default:
      return null;
  }
}

export interface ProjectItem {
  slug: string;
  title: string;
  shortDesc: string;
  problem: string;
  solution: string;
  techStack: string[];
  results: string[];
  screenshots: string[];
  githubLink: string;
  demoLink: string;
  date: string;
  status: 'completed' | 'in-progress' | 'planned';
}

export interface ActivityItem {
  slug: string;
  title: string;
  role: string;
  period: string;
  icon: string;
  description: string;
  details: string;
  gallery?: string[];
}

export interface AwardItem {
  slug: string;
  title: string;
  prize: string;
  level: string;
  year: string;
  icon: string;
  description: string;
  details: string;
  gallery?: string[];
}

export interface BlogItem {
  slug: string;
  title: string;
  date: string;
  category: string;
  cover: string;
  status: 'published' | 'draft';
  excerpt: string;
}

export async function getProjectsData(): Promise<ProjectItem[]> {
  const databaseId = process.env.NOTION_PROJECTS_DATABASE_ID;
  if (!databaseId) {
    console.warn('NOTION_PROJECTS_DATABASE_ID not set, using fallback data');
    return [];
  }

  try {
    const response = await notion.databases.query({
      database_id: databaseId,
      sorts: [{ property: 'Date', direction: 'descending' }],
    });

    return response.results.map((page: any) => {
      const title = getPropertyValue(page, 'Title');
      return {
        slug: getPropertyValue(page, 'Slug') || title.toLowerCase().replace(/\s+/g, '-'),
        title,
        shortDesc: getPropertyValue(page, 'Short Description') || '',
        problem: getPropertyValue(page, 'Problem') || '',
        solution: getPropertyValue(page, 'Solution') || '',
        techStack: getPropertyValue(page, 'Tech Stack') || [],
        results: getPropertyValue(page, 'Results') || [],
        screenshots: getPropertyValue(page, 'Screenshots') || [],
        githubLink: getPropertyValue(page, 'GitHub Link') || '',
        demoLink: getPropertyValue(page, 'Demo Link') || '',
        date: getPropertyValue(page, 'Date') || '',
        status: getPropertyValue(page, 'Status') || 'planned',
      };
    });
  } catch (error) {
    console.error('Error fetching projects from Notion:', error);
    return [];
  }
}

export async function getActivitiesData(): Promise<ActivityItem[]> {
  const databaseId = process.env.NOTION_ACTIVITIES_DATABASE_ID;
  if (!databaseId) {
    console.warn('NOTION_ACTIVITIES_DATABASE_ID not set, using fallback data');
    return [];
  }

  try {
    const response = await notion.databases.query({
      database_id: databaseId,
      sorts: [{ property: 'Period', direction: 'descending' }],
    });

    return response.results.map((page: any) => {
      const title = getPropertyValue(page, 'Title');
      return {
        slug: getPropertyValue(page, 'Slug') || title.toLowerCase().replace(/\s+/g, '-'),
        title,
        role: getPropertyValue(page, 'Role') || '',
        period: getPropertyValue(page, 'Period') || '',
        icon: getPropertyValue(page, 'Icon') || 'fa-star',
        description: getPropertyValue(page, 'Description') || '',
        details: getPropertyValue(page, 'Details') || '',
        gallery: getPropertyValue(page, 'Gallery') || [],
      };
    });
  } catch (error) {
    console.error('Error fetching activities from Notion:', error);
    return [];
  }
}

export async function getAwardsData(): Promise<AwardItem[]> {
  const databaseId = process.env.NOTION_AWARDS_DATABASE_ID;
  if (!databaseId) {
    console.warn('NOTION_AWARDS_DATABASE_ID not set, using fallback data');
    return [];
  }

  try {
    const response = await notion.databases.query({
      database_id: databaseId,
      sorts: [{ property: 'Year', direction: 'descending' }],
    });

    return response.results.map((page: any) => {
      const title = getPropertyValue(page, 'Title');
      return {
        slug: getPropertyValue(page, 'Slug') || title.toLowerCase().replace(/\s+/g, '-'),
        title,
        prize: getPropertyValue(page, 'Prize') || '',
        level: getPropertyValue(page, 'Level') || '',
        year: getPropertyValue(page, 'Year') || '',
        icon: getPropertyValue(page, 'Icon') || 'fa-trophy',
        description: getPropertyValue(page, 'Description') || '',
        details: getPropertyValue(page, 'Details') || '',
        gallery: getPropertyValue(page, 'Gallery') || [],
      };
    });
  } catch (error) {
    console.error('Error fetching awards from Notion:', error);
    return [];
  }
}

export async function getBlogData(): Promise<BlogItem[]> {
  const databaseId = process.env.NOTION_BLOG_DATABASE_ID;
  if (!databaseId) {
    console.warn('NOTION_BLOG_DATABASE_ID not set, using fallback data');
    return [];
  }

  try {
    const response = await notion.databases.query({
      database_id: databaseId,
      filter: {
        property: 'Status',
        select: {
          equals: 'published',
        },
      },
      sorts: [{ property: 'Date', direction: 'descending' }],
    });

    return response.results.map((page: any) => {
      const title = getPropertyValue(page, 'Title');
      return {
        slug: getPropertyValue(page, 'Slug') || title.toLowerCase().replace(/\s+/g, '-'),
        title,
        date: getPropertyValue(page, 'Date') || '',
        category: getPropertyValue(page, 'Category') || 'General',
        cover: getPropertyValue(page, 'Cover') || '',
        status: getPropertyValue(page, 'Status') || 'draft',
        excerpt: getPropertyValue(page, 'Excerpt') || '',
      };
    });
  } catch (error) {
    console.error('Error fetching blog from Notion:', error);
    return [];
  }
}
