// Map internal tags → Medium-friendly tag names
export const TAG_ALIAS = {
    nextjs: 'Next.js',
    react: 'React',
    node: 'Node.js',
    python: 'Python',
    ai: 'Artificial Intelligence',
    db: 'Databases',
    perf: 'Performance',
    testing: 'Testing',
    tooling: 'Developer Tools',
    auth: 'Authentication',
    infra: 'DevOps',
    realtime: 'Real-time',
    maps: 'Maps',
    seo: 'SEO',
};

// Fallback broad tags by theme (used if we need variety)
export const BROAD_FALLBACK = {
    js: ['Programming', 'JavaScript', 'Web Development'],
    py: ['Programming', 'Python', 'Software Engineering'],
    gen: ['Programming', 'Software Engineering', 'Technology']
};
