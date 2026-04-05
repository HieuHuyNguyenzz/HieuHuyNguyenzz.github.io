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

export async function getResearchData(): Promise<ResearchItem[]> {
  if (!databaseId) {
    console.warn('NOTION_DATABASE_ID not set, using fallback data');
    return [];
  }

  try {
    const response = await notion.databases.query({
      database_id: databaseId,
      sorts: [
        {
          property: 'Year',
          direction: 'descending',
        },
      ],
    });

    const researches: ResearchItem[] = response.results.map((page: any) => {
      const title = getPropertyValue(page, 'Title');
      const role = getPropertyValue(page, 'Role');
      const isFirstAuthor = getPropertyValue(page, 'First Author') || role === 'First Author';

      return {
        slug: getPropertyValue(page, 'Slug') || title.toLowerCase().replace(/\s+/g, '-'),
        title,
        role,
        isFirstAuthor,
        venue: getPropertyValue(page, 'Venue'),
        year: getPropertyValue(page, 'Year'),
        contribution: getPropertyValue(page, 'Contribution'),
        authors: getPropertyValue(page, 'Authors'),
        abstract: getPropertyValue(page, 'Abstract'),
        keywords: getPropertyValue(page, 'Keywords'),
        pdfLink: getPropertyValue(page, 'PDF Link'),
        codeLink: getPropertyValue(page, 'Code Link'),
        status: getPropertyValue(page, 'Status') || 'published',
      };
    });

    return researches;
  } catch (error) {
    console.error('Error fetching from Notion:', error);
    return [];
  }
}
