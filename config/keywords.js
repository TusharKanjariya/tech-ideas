export const KEYWORD_WEIGHTS = {
    // core
    'next.js': 5, nextjs: 5, react: 4, node: 4, 'node.js': 4, python: 4,
    // frameworks & libs
    express: 3, fastify: 3, nestjs: 3, hono: 2,
    prisma: 3, drizzle: 3, typeorm: 2, mongoose: 2,
    postgres: 3, redis: 3, mongodb: 3,
    'server actions': 3, middleware: 2, 'app router': 3, rsc: 3,
    'tanstack query': 2, 'redux toolkit': 2, zustand: 2,
    // AI/dev
    ai: 3, llm: 3, rag: 3, openai: 3, langchain: 2, ollama: 2, vllm: 2,
    // platform/infra
    vercel: 2, 'cloudflare workers': 3, serverless: 2, docker: 2, kubernetes: 2,
    // DX/perf
    performance: 2, profiling: 2, caching: 2, lighthouse: 2,
    // your historical interests
    maps: 2, routing: 2, sitemap: 2, debugging: 2, 'console.log': 2, bytecode: 2,
};

export const SOURCE_WEIGHTS = { medium: 1.0, devto: 1.0, hn: 1.2 };
