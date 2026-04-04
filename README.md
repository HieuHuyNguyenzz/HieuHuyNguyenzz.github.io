# Huy Hieu Nguyen – Portfolio

Personal portfolio website built with [Astro](https://astro.build) and [Tailwind CSS](https://tailwindcss.com).

## Tech Stack

- **Framework**: Astro
- **Styling**: Tailwind CSS
- **Icons**: Font Awesome
- **Fonts**: Inter (Google Fonts)
- **Deployment**: GitHub Pages

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Header.astro
│   ├── Footer.astro
│   └── LanguageSwitcher.astro
├── data/                # JSON data files
│   ├── research.json    # Research projects content
│   └── projects.json    # Personal projects content
├── i18n/                # Internationalization
│   ├── en.json          # English translations
│   └── vi.json          # Vietnamese translations
├── layouts/
│   └── BaseLayout.astro
└── pages/
    ├── index.astro          # Home (EN)
    ├── about.astro          # About (EN)
    ├── contact.astro        # Contact (EN)
    ├── research/            # Research listing + detail pages (EN)
    ├── projects/            # Projects listing + detail pages (EN)
    └── vi/                  # All Vietnamese pages
```

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

## Deployment

Push to `main` branch – GitHub Actions will auto-deploy to GitHub Pages.

## License

MIT
