# Geroxym Travel - Next.js 15.5.4 Website

A modern, production-ready travel website built with Next.js 15.5.4, TypeScript, Tailwind CSS, and shadcn/ui components.

## 🚀 Features

- **Next.js 15.5.4** with App Router and Turbopack
- **React 19** with latest features
- **TypeScript** for type safety
- **Tailwind CSS v4** for styling
- **shadcn/ui** components
- **Internationalization** (Romanian/English)
- **Responsive Design** for all devices
- **SEO Optimized** with metadata and structured data
- **Performance Optimized** with image optimization
- **Accessibility** compliant

## 🛠️ Tech Stack

- **Framework**: Next.js 15.5.4
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui + Radix UI
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Internationalization**: next-intl
- **Fonts**: Montserrat (headings), Inter (body)
- **Linting**: ESLint + Prettier
- **Git Hooks**: Husky + lint-staged

## 📦 Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd geroxym-travel
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🌐 Internationalization

The website supports two languages:
- **Romanian** (default): `/ro`
- **English**: `/en`

Language switching is available in the header navigation.

## 📁 Project Structure

```
src/
├── app/
│   ├── [locale]/          # Internationalized routes
│   │   ├── layout.tsx     # Locale layout
│   │   └── page.tsx       # Homepage
│   ├── globals.css        # Global styles
│   └── layout.tsx         # Root layout
├── components/
│   ├── layout/            # Layout components
│   ├── sections/          # Page sections
│   └── ui/                # shadcn/ui components
├── lib/
│   └── utils.ts           # Utility functions
├── i18n.ts                # Internationalization config
└── middleware.ts          # Next.js middleware

locales/
├── ro.json                # Romanian translations
└── en.json                # English translations
```

## 🎨 Design System

- **Colors**: Custom CSS variables for consistent theming
- **Typography**: Montserrat for headings, Inter for body text
- **Spacing**: Tailwind's spacing scale
- **Components**: shadcn/ui component library

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy automatically

### Manual Deployment

```bash
npm run build
npm run start
```

## 📝 Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production with Turbopack
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

## 🔧 Configuration

- **Next.js**: `next.config.ts`
- **TypeScript**: `tsconfig.json`
- **Tailwind**: CSS variables in `globals.css`
- **ESLint**: `eslint.config.mjs`
- **Prettier**: `.prettierrc`
- **shadcn/ui**: `components.json`

## 📱 Responsive Design

The website is fully responsive with breakpoints:
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## ♿ Accessibility

- Semantic HTML structure
- ARIA labels and roles
- Keyboard navigation support
- High contrast ratios
- Screen reader compatibility

## 🔍 SEO Features

- Meta tags and Open Graph
- Structured data
- Sitemap generation
- Image optimization
- Fast loading times

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, email info@geroxymtravel.ro or create an issue in the repository.