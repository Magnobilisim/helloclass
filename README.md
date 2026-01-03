# HelloClass

Interactive learning platform with AI-powered exam creation, social features, and reward system for students, teachers, and administrators.

## Features

### For Students

- Take exams with AI-generated questions
- Track results and progress
- Social feed with posts and interactions
- Earn points and redeem rewards in the shop
- Participate in prize exams
- Real-time notifications
- Profile management

### For Teachers

- Create custom exams with AI assistance
- Manage exam questions and topics
- Track student performance
- Dashboard with analytics

### For Administrators

- User and role management
- System settings and configuration
- Monitor platform activity
- Shop and reward management

## Tech Stack

- **Frontend:** React 19 + TypeScript
- **Build Tool:** Vite 6
- **Styling:** Tailwind CSS
- **Routing:** React Router v7
- **Icons:** Lucide React
- **Charts:** Recharts
- **AI Integration:** OpenAI API
- **Confetti:** Canvas Confetti
- **Image Cropping:** React Easy Crop

## Project Structure

```
helloclass/
├── src/
│   ├── components/       # Shared UI components
│   ├── context/          # React context providers
│   ├── pages/            # Route components
│   │   ├── student/      # Student-specific pages
│   │   ├── teacher/      # Teacher-specific pages
│   │   └── admin/        # Admin-specific pages
│   ├── services/         # API and external services
│   ├── utils/            # Helper functions
│   ├── App.tsx           # Main app component
│   ├── index.tsx         # Entry point
│   ├── types.ts          # TypeScript type definitions
│   ├── constants.ts      # App constants and data
│   └── translations.ts   # Language translations
├── public/               # Static assets
├── .github/              # GitHub workflows
├── index.html            # HTML template
├── index.css             # Global styles
├── vite.config.ts        # Vite configuration
├── tsconfig.json         # TypeScript configuration
└── package.json          # Dependencies and scripts
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd helloclass
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create `.env.local` file and configure environment variables:
   ```env
   VITE_OPENAI_API_KEY=your_openai_api_key_here
   VITE_OPENAI_TEXT_MODEL=gpt-4o-mini
   VITE_OPENAI_IMAGE_MODEL=dall-e-3
   ```

### Development

Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Build

Create a production build:

```bash
npm run build
```

The optimized files will be in the `dist/` directory.

### Preview

Preview the production build locally:

```bash
npm run preview
```

## Environment Variables

| Variable                  | Description                    | Default       |
| ------------------------- | ------------------------------ | ------------- |
| `VITE_OPENAI_API_KEY`     | OpenAI API key for AI features | Required      |
| `VITE_OPENAI_TEXT_MODEL`  | Model for text generation      | `gpt-4o-mini` |
| `VITE_OPENAI_IMAGE_MODEL` | Model for image generation     | `dall-e-3`    |

## Available Scripts

| Command           | Description              |
| ----------------- | ------------------------ |
| `npm run dev`     | Start development server |
| `npm run build`   | Build for production     |
| `npm run preview` | Preview production build |

## Path Aliases

The project uses `@/` alias to reference the `src/` directory:

```typescript
// Instead of:
import { UserRole } from "../types";

// Use:
import { UserRole } from "@/types";
```

## Deployment

### GitHub Actions

The project includes GitHub workflows for deployment:

- `.github/workflows/infra-deploy.yml` - Infrastructure deployment
- `.github/workflows/terraform.yml` - Terraform configuration

### Manual Deployment

1. Build the project:

   ```bash
   npm run build
   ```

2. Deploy the `dist/` folder to your hosting provider (Vercel, Netlify, AWS S3, etc.)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For issues and questions, please open an issue on GitHub.
