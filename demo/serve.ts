// `bun run demo`: serves the repository so demo/index.html can load dist/ (PORT, default 4318).
import { join, normalize } from 'node:path';

const ROOT = join(import.meta.dir, '..');
const server = Bun.serve({
	port: Number(Bun.env['PORT'] ?? 4318),
	fetch(request) {
		const path = normalize(decodeURIComponent(new URL(request.url).pathname));
		if (path === '/') return Response.redirect('/demo/', 302);
		const file = Bun.file(join(ROOT, path.endsWith('/') ? `${path}index.html` : path));
		return file.exists().then((ok) => (ok && !path.includes('..') ? new Response(file) : new Response('Not found', { status: 404 })));
	},
});
console.log(`http://localhost:${server.port}/demo/`);
