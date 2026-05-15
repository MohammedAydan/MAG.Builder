import { reindexAllContent } from '@/lib/search/service';

async function main() {
  await reindexAllContent();
  console.log('[search] Reindex completed.');
}

main().catch((error) => {
  console.error('[search] Reindex failed.', error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
