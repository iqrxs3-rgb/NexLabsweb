# NexLabs - Private AI Workspace

Built by Alexander Volkov | Even Projects

## Features

- 🤖 AI Chat with Groq's fastest LLM
- 💻 Code Editor with Monaco + Docker execution
- 🎨 AI Image Generation with Pollinations
- 🎤 Voice transcription and text-to-speech
- 🔒 Full isolation and privacy
- 📊 Project management system

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS + shadcn/ui
- PostgreSQL + Prisma
- NextAuth.js v5
- Groq SDK
- Docker
- Railway

## Local Development

1. **Install dependencies:**
```bash
npm install
```

2. **Setup PostgreSQL database:**
```bash
# Using Docker
docker run --name nexlabs-db -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres:15
```

3. **Configure environment:**
```bash
cp .env.example .env
# Edit .env with your credentials
```

4. **Run migrations:**
```bash
npx prisma migrate dev
npx prisma generate
```

5. **Start development server:**
```bash
npm run dev
```

## Running Tests

```bash
# Run all tests
npm run test

# Run tests with UI
npm run test:ui
```

## Deployment to Railway

1. **Create Railway project**
2. **Add PostgreSQL database**
3. **Set environment variables:**
   - `DATABASE_URL` (from Railway Postgres)
   - `NEXTAUTH_SECRET` (generate: `openssl rand -base64 32`)
   - `NEXTAUTH_URL` (your Railway URL)
   - `GROQ_API_KEY` (from Groq Console)

4. **Deploy:**
```bash
railway up
```

## Docker Requirements

For code execution, ensure Docker is installed and running:
```bash
docker pull python:3.11-alpine
docker pull node:18-alpine
```

## API Keys

- **Groq API**: Get from https://console.groq.com
- **Pollinations**: No API key needed (free)

## Security Notes

- All routes protected with NextAuth middleware
- Passwords hashed with bcrypt
- Docker containers isolated (no network, memory limited)
- User data segregation enforced

## License

© 2025 Even Projects. All rights reserved.