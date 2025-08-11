// Tags you care about + trigger phrases (lowercase)
export const TAG_TRIGGERS = {
    nextjs: ['next.js', 'nextjs', 'app router', 'server actions', 'rsc', 'middleware', 'edge runtime', 'vercel'],
    react: ['react', 'hooks', 'react 19', 'useeffect', 'use server', 'rsc', 'tanstack query', 'redux toolkit', 'zustand'],
    node: ['node', 'node.js', 'express', 'fastify', 'nestjs', 'hono', 'bullmq', 'queue', 'worker', 'pm2'],
    python: ['python', 'fastapi', 'flask', 'uvicorn', 'celery', 'poetry', 'pydantic'],
    db: ['postgres', 'mysql', 'mariadb', 'mongodb', 'redis', 'sqlite', 'turso', 'prisma', 'drizzle', 'typeorm', 'mongoose'],
    auth: ['auth.js', 'next-auth', 'clerk', 'firebase auth', 'oauth', 'jwt', 'session'],
    ai: ['ai', 'llm', 'prompt', 'rag', 'openai', 'ollama', 'langchain', 'vllm', 'qdrant', 'weaviate', 'vector db', 'onnx', 'pytorch'],
    perf: ['performance', 'optimize', 'profiling', 'lighthouse', 'bundle', 'tree shaking', 'code split', 'caching'],
    testing: ['jest', 'vitest', 'playwright', 'cypress', 'testing', 'e2e', 'unit test'],
    infra: ['docker', 'kubernetes', 'k8s', 'terraform', 'cloudflare workers', 'cloudflare', 'lambda', 'serverless'],
    realtime: ['websocket', 'ws', 'socket.io', 'sse', 'pubsub', 'redis streams'],
    maps: ['maps', 'routing', 'distance', 'traffic', 'tsp', 'geo', 'geospatial', 'mapbox', 'google maps'],
    seo: ['seo', 'sitemap', 'robots', 'structured data', 'schema'],
    tooling: ['vite', 'webpack', 'turbo', 'nx', 'eslint', 'prettier', 'swc', 'babel'],
};

export const TAG_WEIGHTS = {
    nextjs: 5, react: 4, node: 4, python: 4, ai: 3,
    db: 3, perf: 3, tooling: 3, testing: 2, auth: 2,
    infra: 2, realtime: 2, maps: 2, seo: 2,
};
