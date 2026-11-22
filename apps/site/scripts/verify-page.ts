/**
 * Gate the build on the holding page: the built page must show the domain and the coming-soon line, and link to
 * Knowledge Islands.
 *
 * It reads the built dist/ from disk rather than importing the build, so it cannot share a defect with what it checks.
 * Run from apps/site, after Eleventy.
 */

import { existsSync, readFileSync } from 'node:fs'
import { pageFaults } from './lib/page.ts'

const PAGE = 'dist/index.html'

const faults = existsSync(PAGE)
  ? pageFaults(readFileSync(PAGE, 'utf8')).map((fault) => `${PAGE}: ${fault}`)
  : [`${PAGE} is missing; run the Eleventy build first`]

if (faults.length > 0) {
  for (const fault of faults) console.error(`verify:page: ${fault}`)
  process.exit(1)
}
console.log('verify:page: the holding page is complete')
