<div align="center">
  <img width="1200" height="475" alt="AI Content Creator Banner" src="https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&h=475&q=80" />
</div>

---

<div align="center">

# 🚀 AI Content Creator

**Generate high-quality written content on any topic using the power of Google's Gemini AI 2.5**

[![React](https://img.shields.io/badge/React-19.2.0-61DAFB?style=flat&logo=react&logoColor=white)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.2-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2.0-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Google Gemini](https://img.shields.io/badge/Gemini-2.5%20Flash-4285F4?style=flat&logo=google&logoColor=white)](https://ai.google.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.0-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

[📖 Features](#-features) • [🚀 Quick Start](#-quick-start) • [⚙️ Configuration](#️-configuration) • [📚 API Reference](#-api-reference) • [🤝 Contributing](#-contributing)

</div>

---

## 🌟 Features

### ✨ Core Capabilities
- **🤖 Advanced AI Generation** - Powered by Google's latest Gemini 2.5 Flash model for superior content quality
- **🎭 Flexible Tone Control** - Choose from multiple tone options (Professional, Casual, Academic, Creative, etc.)
- **🎯 Keyword Integration** - Seamlessly incorporate specific keywords into generated content
- **📏 Smart Length Control** - Generate content from 50 to 1000 words with precise control
- **📋 One-Click Copy** - Copy generated content to clipboard instantly
- **⚡ Real-time Generation** - Fast, responsive content generation with loading indicators

### 🎨 User Experience
- **🌙 Modern Dark Theme** - Easy on the eyes with a sleek, professional interface
- **📱 Fully Responsive** - Optimized for desktop, tablet, and mobile devices
- **⚡ Lightning Fast** - Built with Vite for instant hot module replacement
- **♿ Accessibility First** - ARIA labels and keyboard navigation support
- **🔄 Smart State Management** - Automatic form clearing and error handling

### 🛠️ Technical Features
- **⚛️ React 19** - Latest React with concurrent features and improved performance
- **🔷 TypeScript** - Full type safety for robust, maintainable code
- **🎨 Tailwind CSS** - Utility-first CSS framework for rapid UI development
- **🚀 Vite Build Tool** - Next-generation frontend tooling for faster builds
- **📦 Code Splitting** - Lazy loading for optimal performance

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v18.0.0 or higher)
- **npm** or **yarn** package manager
- **Google AI API Key** ([Get one here](https://makersuite.google.com/app/apikey))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/RyanWez/Ai-Content.git
   cd Ai-Content
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.local
   # Edit .env.local and add your Google AI API key
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173` and start creating content!

### 📦 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |

## ⚙️ Configuration

### Environment Variables

Create a `.env.local` file in the project root:

```env
# Required: Your Google AI API Key
API_KEY=your_google_ai_api_key_here

# Optional: Custom port for development
PORT=5173
```

### 🔧 Customization Options

#### Tone Options
The application supports multiple content tones:
- **Professional** - Formal, business-appropriate content
- **Casual** - Friendly, conversational tone
- **Academic** - Scholarly, research-oriented content
- **Creative** - Imaginative, engaging narrative
- **Technical** - Precise, specification-focused content
- **Marketing** - Persuasive, benefit-oriented copy

#### Content Length
- **Minimum**: 50 words
- **Maximum**: 1000 words
- **Default**: 200 words

## 📚 API Reference

### Core Functions

#### `generateContent(topic, tone, keywords, contentLength)`
Generates AI-powered content based on specified parameters.

**Parameters:**
- `topic` (string): The main topic or subject matter
- `tone` (Tone): The desired tone of voice
- `keywords` (string): Optional comma-separated keywords to include
- `contentLength` (number): Approximate word count (50-1000)

**Returns:** `Promise<string>` - The generated content

**Example:**
```typescript
import { generateContent } from './services/geminiService';

const content = await generateContent(
  "The benefits of renewable energy",
  Tone.PROFESSIONAL,
  "solar, wind, sustainable",
  300
);
```

### Type Definitions

```typescript
export enum Tone {
  PROFESSIONAL = "Professional",
  CASUAL = "Casual",
  ACADEMIC = "Academic",
  CREATIVE = "Creative",
  TECHNICAL = "Technical",
  MARKETING = "Marketing"
}

export interface ContentOptions {
  topic: string;
  tone: Tone;
  keywords?: string;
  contentLength: number;
}
```

## 🏗️ Project Structure

```
ai-content-creator/
├── public/
│   └── assets/
├── src/
│   ├── components/
│   │   └── Icon.tsx          # Icon component with SVG support
│   ├── services/
│   │   └── geminiService.ts  # Google Gemini AI integration
│   ├── types/
│   │   └── index.ts          # TypeScript type definitions
│   ├── constants/
│   │   └── index.ts          # Application constants
│   ├── App.tsx               # Main application component
│   ├── index.tsx             # Application entry point
│   └── index.css             # Global styles
├── .env.local                # Environment variables
├── vite.config.ts            # Vite configuration
├── tsconfig.json             # TypeScript configuration
└── README.md                 # This file
```

## 🔒 Security & Privacy

- **🔐 API Key Protection** - Environment variables keep your API key secure
- **🚫 No Data Storage** - Content is generated on-demand, no user data stored
- **🔒 Local Processing** - All processing happens in your browser
- **🌐 HTTPS Ready** - Secure by default for production deployments

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel --prod
```

### Netlify
```bash
npm run build
# Upload the dist/ folder to Netlify
```

### Docker
```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 🤝 Contributing

We welcome contributions! Here's how to get involved:

### 🐛 Reporting Bugs
1. Check existing [Issues](../../issues)
2. Create a new issue with the bug report template
3. Include detailed steps to reproduce

### 💡 Feature Requests
1. Check existing [Discussions](../../discussions)
2. Start a new discussion with your feature idea
3. Provide detailed use cases and examples

### 🔧 Development Setup
```bash
# Fork and clone the repository
git clone https://github.com/RyanWez/Ai-Content.git
cd Ai-Content

# Install dependencies
npm install

# Create your feature branch
git checkout -b feature/amazing-feature

# Make your changes and test thoroughly
npm run dev

# Commit your changes
git commit -m 'Add amazing feature'

# Push to the branch
git push origin feature/amazing-feature

# Open a Pull Request
```

### 📋 Development Guidelines
- **ESLint** - Follow existing code style
- **TypeScript** - Maintain type safety
- **Responsive Design** - Test on multiple screen sizes
- **Accessibility** - Ensure WCAG compliance
- **Performance** - Optimize for fast loading

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google AI** - For providing the incredible Gemini AI models
- **React Team** - For the amazing framework
- **Vite Team** - For the blazing-fast build tool
- **Tailwind CSS** - For the utility-first CSS framework
- **Open Source Community** - For continuous inspiration and support



---

<div align="center">

**Built with ❤️ using cutting-edge AI and modern web technologies**

⭐ **Star this repo** if you found it helpful!

[🌟 View Demo](https://aicontent-mm.vercel.app) • [📖 Documentation](#-features) • [🐛 Report Bug](../../issues) • [💡 Request Feature](../../discussions)

</div>
