import { Client } from '@notionhq/client';
import fs from 'fs';
import path from 'path';
import 'dotenv/config';

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

const databaseId = process.env.NOTION_DATABASE_ID;

interface ResearchItem {
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
  image: string;
  context: string;
  myComments: string;
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
    case 'files':
      if (property.files && property.files.length > 0) {
        const file = property.files[0];
        if (file.type === 'file') {
          return file.file.url;
        } else if (file.type === 'external') {
          return file.external.url;
        }
      }
      return '';
    default:
      return null;
  }
}

async function downloadImage(imageUrl: string, slug: string): Promise<string> {
  if (!imageUrl) return '';

  try {
    const imagesDir = path.join(process.cwd(), 'public', 'images', 'research');
    if (!fs.existsSync(imagesDir)) {
      fs.mkdirSync(imagesDir, { recursive: true });
    }

    const urlObj = new URL(imageUrl);
    const pathname = urlObj.pathname;
    const ext = path.extname(pathname) || '.jpg';
    const filename = `${slug}-cover${ext}`;
    const localPath = path.join(imagesDir, filename);

    const response = await fetch(imageUrl);
    if (!response.ok) {
      console.warn(`Failed to download image: ${imageUrl}`);
      return '';
    }

    const buffer = await response.arrayBuffer();
    fs.writeFileSync(localPath, Buffer.from(buffer));

    const relativePath = `/images/research/${filename}`;
    console.log(`  ✓ Downloaded: ${filename}`);
    return relativePath;
  } catch (error) {
    console.warn(`Error downloading image: ${imageUrl}`, error);
    return '';
  }
}

async function fetchResearchData(): Promise<ResearchItem[]> {
  if (!databaseId) {
    console.warn('NOTION_DATABASE_ID not set, skipping fetch');
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

    const researches: ResearchItem[] = [];
    
    for (const page of response.results) {
      const title = getPropertyValue(page, 'Title');
      if (!title) continue;

      const role = getPropertyValue(page, 'Role') || getPropertyValue(page, 'Role (original)');
      const isFirstAuthor = getPropertyValue(page, 'First Author') || role === 'First Author';
      const slug = getPropertyValue(page, 'Slug') || title.toLowerCase().replace(/\s+/g, '-');
      const imageUrl = getPropertyValue(page, 'Image') || '';
      const localImage = await downloadImage(imageUrl, slug);

      researches.push({
        slug,
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
        image: localImage,
        context: getPropertyValue(page, 'Context') || '',
        myComments: getPropertyValue(page, 'My Comments') || '',
      });
    }

    return researches;
  } catch (error) {
    console.error('Error fetching from Notion:', error);
    return [];
  }
}

async function main() {
  console.log('Fetching research data from Notion...');
  const researches = await fetchResearchData();

  if (researches.length > 0) {
    const outputPath = path.join(process.cwd(), 'src', 'data', 'research.json');
    fs.writeFileSync(outputPath, JSON.stringify(researches, null, 2));
    console.log(`✓ Saved ${researches.length} research items to ${outputPath}`);
  } else {
    console.log('No data fetched, keeping existing research.json');
  }
}

main();
