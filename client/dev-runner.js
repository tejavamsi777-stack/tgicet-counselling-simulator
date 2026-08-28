import { createServer } from 'vite';

async function start() {
  const server = await createServer({
    server: {
      port: 5173,
    }
  });
  await server.listen();
  server.printUrls();
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});

setInterval(() => {}, 1000 * 60 * 60 * 24);
