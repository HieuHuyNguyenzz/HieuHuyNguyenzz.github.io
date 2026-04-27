import { Client } from '@notionhq/client';
import fs from 'fs';
import path from 'path';
import 'dotenv/config';

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

// Database IDs
const researchDatabaseId = process.env.NOTION_DATABASE_ID;
const projectsDatabaseId = process.env.NOTION_PROJECTS_DATABASE_ID;
const activitiesDatabaseId = process.env.NOTION_ACTIVITIES_DATABASE_ID;
const awardsDatabaseId = process.env.NOTION_AWARDS_DATABASE_ID;
const blogDatabaseId = process.env.NOTION_BLOG_DATABASE_ID;

// Interfaces
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

interface ProjectItem {
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
  image: string;
}

interface ActivityItem {
  slug: string;
  title: string;
  role: string;
  period: string;
  icon: string;
  description: string;
  details: string;
  gallery: string[];
}

interface AwardItem {
  slug: string;
  title: string;
  prize: string;
  level: string;
  year: string;
  icon: string;
  description: string;
  details: string;
  gallery: string[];
}

interface BlogItem {
  slug: string;
  title: string;
  date: string;
  category: string;
  cover: string;
  status: 'published' | 'draft';
  excerpt: string;
}

// Helper functions
function getPropertyValue(page: any, propertyName: string): any {
  const property = page.properties[propertyName];
  if (!property) return null;

  switch (property.type) {
    case 'title':
      return property.title?.map((t: any) => t.plain_text).join('') || '';
    case 'rich_text':
      return property.rich_text?.map((t: any) => t.plain_text).join('') || '';
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
        return property.files.map((file: any) => {
          if (file.type === 'file') return file.file.url;
          if (file.type === 'external') return file.external.url;
          return '';
        }).filter(Boolean);
      }
      return [];
    case 'date':
      return property.date?.start || '';
    default:
      return null;
  }
}

function slugify(text: string): string {
  const VIETNAMESE_MAP: Record<string, string> = {
    'à': 'a', 'á': 'a', 'ả': 'a', 'ã': 'a', 'ạ': 'a',
    'ă': 'a', 'ằ': 'a', 'ắ': 'a', 'ẳ': 'a', 'ẵ': 'a', 'ặ': 'a',
    'â': 'a', 'ầ': 'a', 'ấ': 'a', 'ẩ': 'a', 'ẫ': 'a', 'ậ': 'a',
    'è': 'e', 'é': 'e', 'ẻ': 'e', 'ẽ': 'e', 'ẹ': 'e',
    'ê': 'e', 'ề': 'e', 'ế': 'e', 'ể': 'e', 'ễ': 'e', 'ệ': 'e',
    'ì': 'i', 'í': 'i', 'ỉ': 'i', 'ĩ': 'i', 'ị': 'i',
    'ò': 'o', 'ó': 'o', 'ỏ': 'o', 'õ': 'o', 'ọ': 'o',
    'ô': 'o', 'ồ': 'o', 'ố': 'o', 'ổ': 'o', 'ỗ': 'o', 'ộ': 'o',
    'ơ': 'o', 'ờ': 'o', 'ớ': 'o', 'ở': 'o', 'ỡ': 'o', 'ợ': 'o',
    'ù': 'u', 'ú': 'u', 'ủ': 'u', 'ũ': 'u', 'ụ': 'u',
    'ư': 'u', 'ừ': 'u', 'ứ': 'u', 'ử': 'u', 'ữ': 'u', 'ự': 'u',
    'ỳ': 'y', 'ý': 'y', 'ỷ': 'y', 'ỹ': 'y', 'ỵ': 'y',
    'đ': 'd',
    'À': 'A', 'Á': 'A', 'Ả': 'A', 'Ã': 'A', 'Ạ': 'A',
    'Ă': 'A', 'Ằ': 'A', 'Ắ': 'A', 'Ẳ': 'A', 'Ẵ': 'A', 'Ặ': 'A',
    'Â': 'A', 'Ầ': 'A', 'Ấ': 'A', 'Ẩ': 'A', 'Ẫ': 'A', 'Ậ': 'A',
    'È': 'E', 'É': 'E', 'Ẻ': 'E', 'Ẽ': 'E', 'Ẹ': 'E',
    'Ê': 'E', 'Ề': 'E', 'Ế': 'E', 'Ể': 'E', 'Ễ': 'E', 'Ệ': 'E',
    'Ì': 'I', 'Í': 'I', 'Ỉ': 'I', 'Ĩ': 'I', 'Ị': 'I',
    'Ò': 'O', 'Ó': 'O', 'Ỏ': 'O', 'Õ': 'O', 'Ọ': 'O',
    'Ô': 'O', 'Ồ': 'O', 'Ố': 'O', 'Ổ': 'O', 'Ỗ': 'O', 'Ộ': 'O',
    'Ơ': 'O', 'Ờ': 'O', 'Ớ': 'O', 'Ở': 'O', 'Ỡ': 'O', 'Ợ': 'O',
    'Ù': 'U', 'Ú': 'U', 'Ủ': 'U', 'Ũ': 'U', 'Ụ': 'U',
    'Ư': 'U', 'Ừ': 'U', 'Ứ': 'U', 'Ử': 'U', 'Ữ': 'U', 'Ự': 'U',
    'Ỳ': 'Y', 'Ý': 'Y', 'Ỷ': 'Y', 'Ỹ': 'Y', 'Ỵ': 'Y',
    'Đ': 'D',
  };

  return text
    .split('')
    .map(char => VIETNAMESE_MAP[char] || char)
    .join('')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'untitled';
}

async function downloadImage(imageUrl: string, slug: string, subDir: string, suffix: string = 'cover'): Promise<string> {
  if (!imageUrl) return '';

  try {
    const imagesDir = path.join(process.cwd(), 'public', 'images', subDir);
    if (!fs.existsSync(imagesDir)) {
      fs.mkdirSync(imagesDir, { recursive: true });
    }

    const urlObj = new URL(imageUrl);
    const pathname = urlObj.pathname;
    const ext = path.extname(pathname) || '.jpg';
    const filename = `${slug}-${suffix}${ext}`;
    const localPath = path.join(imagesDir, filename);

    const response = await fetch(imageUrl);
    if (!response.ok) {
      console.warn(`  ⚠ Failed to download image: ${imageUrl}`);
      return '';
    }

    const buffer = await response.arrayBuffer();
    fs.writeFileSync(localPath, Buffer.from(buffer));

    const relativePath = `/images/${subDir}/${filename}`;
    console.log(`  ✓ Downloaded: ${filename}`);
    return relativePath;
  } catch (error) {
    console.warn(`  ⚠ Error downloading image: ${imageUrl}`, error);
    return '';
  }
}

// Query all pages with pagination support
async function queryAllPages(databaseId: string, options: any = {}): Promise<any[]> {
  const allResults: any[] = [];
  let hasMore = true;
  let startCursor: string | undefined = undefined;

  while (hasMore) {
    const response = await notion.databases.query({
      database_id: databaseId,
      start_cursor: startCursor,
      page_size: 100,
      ...(options.filter && { filter: options.filter }),
      ...(options.sorts && { sorts: options.sorts }),
    });

    allResults.push(...response.results);
    hasMore = response.has_more;
    startCursor = response.next_cursor || undefined;
  }

  return allResults;
}

// Fetch all blocks recursively (handles nested blocks)
async function getAllBlocks(blockId: string): Promise<any[]> {
  const allBlocks: any[] = [];
  let hasMore = true;
  let startCursor: string | undefined = undefined;

  while (hasMore) {
    const response = await notion.blocks.children.list({
      block_id: blockId,
      start_cursor: startCursor,
      page_size: 100,
    });

    for (const block of response.results) {
      allBlocks.push(block);
      // Recursively fetch child blocks for blocks that can have children
      const b = block as any;
      if (b.has_children) {
        const childBlocks = await getAllBlocks(block.id);
        allBlocks.push(...childBlocks.map((cb: any) => ({ ...cb, _parentId: block.id })));
      }
    }

    hasMore = response.has_more;
    startCursor = response.next_cursor || undefined;
  }

  return allBlocks;
}

// Fetch functions
async function fetchResearchData(): Promise<ResearchItem[]> {
  if (!researchDatabaseId) {
    console.log('⊘ NOTION_DATABASE_ID not set, skipping research');
    return [];
  }

  console.log('\n📚 Fetching research data...');
  try {
    const results = await queryAllPages(researchDatabaseId, {
      sorts: [{ property: 'Year', direction: 'descending' }],
    });

    const researches: ResearchItem[] = [];
    
    for (const page of results) {
      const title = getPropertyValue(page, 'Title');
      if (!title) continue;

      const role = getPropertyValue(page, 'Role') || getPropertyValue(page, 'Role (original)');
      const isFirstAuthor = getPropertyValue(page, 'First Author') || role === 'First Author';
      const slug = getPropertyValue(page, 'Slug') || slugify(title);
      const imageUrl = getPropertyValue(page, 'Image') || '';
      const localImage = await downloadImage(imageUrl, slug, 'research');

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

    console.log(`  ✓ Found ${researches.length} research items`);
    return researches;
  } catch (error) {
    console.error('  ✗ Error fetching research:', error);
    return [];
  }
}

async function fetchProjectsData(): Promise<ProjectItem[]> {
  if (!projectsDatabaseId) {
    console.log('⊘ NOTION_PROJECTS_DATABASE_ID not set, skipping projects');
    return [];
  }

  console.log('\n🚀 Fetching projects data...');
  try {
    const results = await queryAllPages(projectsDatabaseId, {
      sorts: [{ property: 'Date', direction: 'descending' }],
    });

    const projects: ProjectItem[] = [];
    
    for (const page of results) {
      const title = getPropertyValue(page, 'Title');
      if (!title) continue;

      const slug = getPropertyValue(page, 'Slug') || slugify(title);
      const imageUrl = getPropertyValue(page, 'Image') || '';
      const localImage = await downloadImage(imageUrl, slug, 'projects');

      projects.push({
        slug,
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
        image: localImage,
      });
    }

    console.log(`  ✓ Found ${projects.length} projects`);
    return projects;
  } catch (error) {
    console.error('  ✗ Error fetching projects:', error);
    return [];
  }
}

async function fetchActivitiesData(): Promise<ActivityItem[]> {
  if (!activitiesDatabaseId) {
    console.log('⊘ NOTION_ACTIVITIES_DATABASE_ID not set, skipping activities');
    return [];
  }

  console.log('\n🎯 Fetching activities data...');
  try {
    const results = await queryAllPages(activitiesDatabaseId, {
      sorts: [{ property: 'Period', direction: 'descending' }],
    });

    const activities: ActivityItem[] = [];
    for (const page of results) {
      const title = getPropertyValue(page, 'Title');
      if (!title) continue;

      const slug = getPropertyValue(page, 'Slug') || slugify(title);
      const galleryUrls = getPropertyValue(page, 'Gallery') || [];
      const localGallery: string[] = [];

      for (let i = 0; i < galleryUrls.length; i++) {
        const localImg = await downloadImage(galleryUrls[i], slug, 'activities', `img-${i}`);
        if (localImg) localGallery.push(localImg);
      }

      activities.push({
        slug,
        title,
        role: getPropertyValue(page, 'Role') || '',
        period: getPropertyValue(page, 'Period') || '',
        icon: getPropertyValue(page, 'Icon') || 'fa-star',
        description: getPropertyValue(page, 'Description') || '',
        details: getPropertyValue(page, 'Details') || '',
        gallery: localGallery,
      });
    }

    console.log(`  ✓ Found ${activities.length} activities`);
    return activities;
  } catch (error) {
    console.error('  ✗ Error fetching activities:', error);
    return [];
  }
}

async function fetchAwardsData(): Promise<AwardItem[]> {
  if (!awardsDatabaseId) {
    console.log('⊘ NOTION_AWARDS_DATABASE_ID not set, skipping awards');
    return [];
  }

  console.log('\n🏆 Fetching awards data...');
  try {
    const results = await queryAllPages(awardsDatabaseId, {
      sorts: [{ property: 'Year', direction: 'descending' }],
    });

    const awards: AwardItem[] = [];
    for (const page of results) {
      const title = getPropertyValue(page, 'Title');
      if (!title) continue;

      const slug = getPropertyValue(page, 'Slug') || slugify(title);
      const galleryUrls = getPropertyValue(page, 'Gallery') || [];
      const localGallery: string[] = [];

      for (let i = 0; i < galleryUrls.length; i++) {
        const localImg = await downloadImage(galleryUrls[i], slug, 'awards', `img-${i}`);
        if (localImg) localGallery.push(localImg);
      }

      awards.push({
        slug,
        title,
        prize: getPropertyValue(page, 'Prize') || '',
        level: getPropertyValue(page, 'Level') || '',
        year: getPropertyValue(page, 'Year') || '',
        icon: getPropertyValue(page, 'Icon') || 'fa-trophy',
        description: getPropertyValue(page, 'Description') || '',
        details: getPropertyValue(page, 'Details') || '',
        gallery: localGallery,
      });
    }

    console.log(`  ✓ Found ${awards.length} awards`);
    return awards;
  } catch (error) {
    console.error('  ✗ Error fetching awards:', error);
    return [];
  }
}

async function fetchBlogData(): Promise<BlogItem[]> {
  if (!blogDatabaseId) {
    console.log('⊘ NOTION_BLOG_DATABASE_ID not set, skipping blog');
    return [];
  }

  const dataDir = path.join(process.cwd(), 'src', 'data');

  console.log('\n📝 Fetching blog data...');
  try {
    const results = await queryAllPages(blogDatabaseId, {
      filter: {
        property: 'Status',
        select: { equals: 'published' },
      },
      sorts: [{ property: 'Date', direction: 'descending' }],
    });

    const blogs: BlogItem[] = [];
    
    for (const page of results) {
      const title = getPropertyValue(page, 'Title');
      const slug = getPropertyValue(page, 'Slug') || slugify(title);
      
      const blogItem: BlogItem = {
        slug,
        title,
        date: getPropertyValue(page, 'Date') || '',
        category: getPropertyValue(page, 'Category') || 'General',
        cover: getPropertyValue(page, 'Cover') || '',
        status: getPropertyValue(page, 'Status') || 'draft',
        excerpt: getPropertyValue(page, 'Excerpt') || '',
      };

      try {
        const blocks = await getAllBlocks(page.id);
        const content = blocks.map((block: any) => convertBlockToHtml(block)).filter(Boolean);
        
        if (content.length > 0) {
          const contentDir = path.join(dataDir, 'blog-content');
          if (!fs.existsSync(contentDir)) {
            fs.mkdirSync(contentDir, { recursive: true });
          }
          fs.writeFileSync(path.join(contentDir, `${slug}.json`), JSON.stringify(content, null, 2));
        }
      } catch (e: any) {
        console.warn(`  ⚠ Error fetching content for: ${title}`, e.message || e);
      }

      blogs.push(blogItem);
    }

    console.log(`  ✓ Found ${blogs.length} blog posts`);
    return blogs;
  } catch (error) {
    console.error('  ✗ Error fetching blog:', error);
    return [];
  }
}

function convertBlockToHtml(block: any): any {
  const type = block.type;
  const data = block[type];
  if (!data) return null;

  switch (type) {
    case 'paragraph':
      return { type: 'paragraph', content: data.rich_text?.map((t: any) => t.plain_text).join('') || '' };
    case 'heading_1':
      return { type: 'heading_1', content: data.rich_text?.map((t: any) => t.plain_text).join('') || '' };
    case 'heading_2':
      return { type: 'heading_2', content: data.rich_text?.map((t: any) => t.plain_text).join('') || '' };
    case 'heading_3':
      return { type: 'heading_3', content: data.rich_text?.map((t: any) => t.plain_text).join('') || '' };
    case 'bulleted_list_item':
      return { type: 'bulleted_list_item', content: data.rich_text?.map((t: any) => t.plain_text).join('') || '' };
    case 'numbered_list_item':
      return { type: 'numbered_list_item', content: data.rich_text?.map((t: any) => t.plain_text).join('') || '' };
    case 'to_do':
      return { type: 'to_do', content: data.rich_text?.map((t: any) => t.plain_text).join('') || '', checked: data.checked };
    case 'quote':
      return { type: 'quote', content: data.rich_text?.map((t: any) => t.plain_text).join('') || '' };
    case 'code':
      return { type: 'code', content: data.rich_text?.map((t: any) => t.plain_text).join('') || '', language: data.language };
    case 'image':
      const imgUrl = data.type === 'file' ? data.file.url : data.external?.url;
      return { type: 'image', url: imgUrl, caption: data.caption?.map((t: any) => t.plain_text).join('') || '' };
    case 'divider':
      return { type: 'divider' };
    default:
      return null;
  }
}

// Main function
async function main() {
  console.log('═══════════════════════════════════════════');
  console.log('  Fetching data from Notion databases...');
  console.log('═══════════════════════════════════════════');

  const dataDir = path.join(process.cwd(), 'src', 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Fetch all data
  const [researches, projects, activities, awards, blogs] = await Promise.all([
    fetchResearchData(),
    fetchProjectsData(),
    fetchActivitiesData(),
    fetchAwardsData(),
    fetchBlogData(),
  ]);

  // Always save all data (even if empty)
  const researchPath = path.join(dataDir, 'research.json');
  fs.writeFileSync(researchPath, JSON.stringify(researches, null, 2));
  console.log(`\n✓ Saved ${researches.length} research items to ${researchPath}`);

  const projectsPath = path.join(dataDir, 'projects.json');
  fs.writeFileSync(projectsPath, JSON.stringify(projects, null, 2));
  console.log(`✓ Saved ${projects.length} projects to ${projectsPath}`);

  const activitiesPath = path.join(dataDir, 'activities.json');
  fs.writeFileSync(activitiesPath, JSON.stringify(activities, null, 2));
  console.log(`✓ Saved ${activities.length} activities to ${activitiesPath}`);

  const awardsPath = path.join(dataDir, 'awards.json');
  fs.writeFileSync(awardsPath, JSON.stringify(awards, null, 2));
  console.log(`✓ Saved ${awards.length} awards to ${awardsPath}`);

  const blogPath = path.join(dataDir, 'blog.json');
  fs.writeFileSync(blogPath, JSON.stringify(blogs, null, 2));
  console.log(`✓ Saved ${blogs.length} blog posts to ${blogPath}`);

  console.log('\n═══════════════════════════════════════════');
  console.log('  Fetch complete!');
  console.log('═══════════════════════════════════════════');
}

main();
