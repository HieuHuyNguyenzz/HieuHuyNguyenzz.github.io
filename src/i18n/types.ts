export interface Nav {
  home: string;
  about: string;
  blog: string;
  research: string;
  projects: string;
  activities: string;
  contact: string;
}

export interface Common {
  openToOpportunities: string;
  viewMyResearch: string;
  viewMyProjects: string;
  viewDetails: string;
  backToResearch: string;
  backToProjects: string;
  backToActivities: string;
  viewPdf: string;
  viewCode: string;
  sourceCode: string;
  liveDemo: string;
  published: string;
  underReview: string;
  inProgress: string;
  completed: string;
  planned: string;
  firstAuthor: string;
  researchSections: {
    published: string;
    underReview: string;
    inProgress: string;
  };
  aboutMe: string;
  backgroundSkills: string;
  academicPubs: string;
  personalWork: string;
}

export interface Home {
  greeting: string;
  badge: string;
  bio: string;
  bioSecondary: string;
}

export interface Introduction {
  title: string;
  text: string;
}

export interface BeyondWork {
  title: string;
  text: string;
}

export interface EducationEntry {
  period: string;
  degree: string;
  institution: string;
  desc: string;
}

export interface Education {
  title: string;
  entries: EducationEntry[];
}

export interface ExperienceEntry {
  period: string;
  role: string;
  company: string;
  desc: string[];
}

export interface Experience {
  title: string;
  entries: ExperienceEntry[];
}

export interface Skills {
  title: string;
  programming: string;
  frameworks: string;
  tools: string;
  certificates: string;
  certificatesDesc: string;
  toolsList: string[];
  certificatesList: string[];
}

export interface About {
  pageTitle: string;
  pageSubtitle: string;
  introduction: Introduction;
  beyondWork: BeyondWork;
  education: Education;
  experience: Experience;
  skills: Skills;
}

export interface ActivitiesSections {
  awards: string;
  activities: string;
}

export interface Activities {
  pageTitle: string;
  pageSubtitle: string;
  pageDesc: string;
  sections: ActivitiesSections;
}

export interface ProjectsSections {
  problem: string;
  solution: string;
  techStack: string;
  results: string;
  screenshots: string;
}

export interface Projects {
  pageTitle: string;
  pageSubtitle: string;
  pageDesc: string;
  sections: ProjectsSections;
}

export interface ResearchSections {
  abstract: string;
  keywords: string;
  authors: string;
  venue: string;
}

export interface Research {
  pageTitle: string;
  pageSubtitle: string;
  pageDesc: string;
  sections: ResearchSections;
}

export interface Contact {
  pageTitle: string;
  pageSubtitle: string;
  title: string;
  desc: string;
  email: string;
  location: string;
  findMeOn: string;
}

export interface Footer {
  rights: string;
  builtWith: string;
}

export interface Blog {
  pageTitle: string;
  pageSubtitle: string;
}

export interface I18n {
  site: {
    title: string;
    description: string;
  };
  nav: Nav;
  common: Common;
  home: Home;
  about: About;
  blog: Blog;
  activities: Activities;
  projects: Projects;
  research: Research;
  contact: Contact;
  footer: Footer;
}