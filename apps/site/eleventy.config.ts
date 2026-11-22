import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { dirname, relative, resolve, sep } from 'node:path'
import type { UserConfig } from '@11ty/eleventy'
import JSON5 from 'json5'

// ─── Eleventy config ──────────────────────────────────────────────────────────

export default function (eleventyConfig: UserConfig) {
  // The build runs from the apps/site workspace (cwd = apps/site), which owns dist/.
  const outputRoot = resolve(process.cwd(), 'dist')

  // ── Relative URL helper ──────────────────────────────────────────────────
  // Converts absolute internal URLs to relative paths from the current output
  // file. This makes the dist/ folder fully portable (no assumed root).
  const toRelativeOutputUrl = (url: string, outputPath: string): string => {
    if (!url.startsWith('/')) return url
    if (url.startsWith('//')) return url

    // A fragment is addressed within the target document, so it is set aside
    // before the path is resolved and reattached afterwards.
    const hash = url.indexOf('#')
    const fragment = hash < 0 ? '' : url.slice(hash)
    const path = hash < 0 ? url : url.slice(0, hash)

    // Make internal page URLs explicit to avoid directory-index assumptions.
    let normalized = path
    if (normalized === '/') normalized = '/index.html'
    else if (normalized.endsWith('/')) normalized = `${normalized}index.html`

    const fromDir = dirname(outputPath)
    const targetPath = resolve(outputRoot, `.${normalized}`)
    const rel = relative(fromDir, targetPath).split(sep).join('/')
    return `${rel || './'}${fragment}`
  }

  // ── Passthrough copies ───────────────────────────────────────────────────
  eleventyConfig.addPassthroughCopy('src/assets/images')
  eleventyConfig.addPassthroughCopy({ 'src/site.webmanifest': 'site.webmanifest' })

  const isPage = (path: string | undefined): path is string => !!path?.endsWith('.html')

  // ── Transform: inject external-link icons ────────────────────────────────
  // Marks any prose <a href="https://..."> link with an external-link glyph.
  // The SVG is inlined rather than drawn by an icon runtime: the marker is
  // decorative, and a client-side library for one glyph would be a script and a
  // dependency the page does not otherwise need. Sized in em so it tracks the
  // surrounding type; styled by .ext-icon.
  const externalLinkIcon =
    '<svg class="ext-icon" width="0.85em" height="0.85em" viewBox="0 0 24 24" fill="none" stroke="currentColor"' +
    ' stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M13 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7"/>' +
    '<path d="M15 3h6v6"/><path d="M11 13 21 3"/></svg>'

  eleventyConfig.addTransform('external-link-icons', (content: string, outputPath: string | undefined) => {
    if (!isPage(outputPath)) return content
    return content.replace(
      /<a\s+([^>]*href="https?:\/\/[^"]*"[^>]*)>([\s\S]*?)<\/a>/gi,
      (match, attrs: string, inner: string) => {
        if (/class="ext-icon"/.test(inner)) return match
        return `<a ${attrs}>${inner}${externalLinkIcon}</a>`
      }
    )
  })

  // ── Transform: rewrite absolute links to relative ────────────────────────
  // Ensures href/src attributes pointing at absolute internal paths are
  // rewritten to relative paths, making dist/ portable without a web server.
  eleventyConfig.addTransform('explicit-index-links', (content: string, outputPath: string | undefined) => {
    if (!isPage(outputPath)) return content
    return content.replace(
      /(\s(?:href|src)=)(["'])([^"']+)(\2)/gi,
      (_match, prefix: string, quote: string, url: string) => {
        if (/^(?:https?:|mailto:|tel:|javascript:|data:|#)/i.test(url)) return `${prefix}${quote}${url}${quote}`
        return `${prefix}${quote}${toRelativeOutputUrl(url, outputPath)}${quote}`
      }
    )
  })

  // ── Tailwind CSS ─────────────────────────────────────────────────────────
  // In build mode, compile Tailwind as part of the Eleventy lifecycle so the
  // build script only needs to invoke Eleventy once. In serve/watch mode the
  // Tailwind --watch process runs in parallel (see the ki:site:dev script).
  eleventyConfig.on('eleventy.before', ({ runMode }: { runMode: string }) => {
    if (runMode !== 'serve' && runMode !== 'watch') {
      // bunx, not npx: Cloudflare Workers Builds installs with Bun, so npm cannot
      // resolve the Tailwind executable there.
      execSync('bunx tailwindcss -i src/assets/css/main.css -o dist/assets/css/main.css --minify', { stdio: 'inherit' })
    }
  })
  // Watch the compiled CSS so the dev server reloads the browser whenever
  // the Tailwind --watch process writes a new dist/assets/css/main.css.
  eleventyConfig.addWatchTarget('dist/assets/css/main.css')

  // ── Data extension: TypeScript ───────────────────────────────────────────
  // Allows .ts files in src/_data/ to be used as global data files. Mirrors
  // Eleventy's built-in JS handling: calls the export if it's a function (sync
  // or async), otherwise uses the value directly.
  eleventyConfig.addDataExtension('ts', {
    read: false,
    parser: async (filePath: string) => {
      const mod = (await import(filePath)) as { default: unknown }
      const data = mod.default
      return typeof data === 'function' ? await (data as () => unknown)() : data
    }
  })

  // ── Data extension: JSON5 ────────────────────────────────────────────────
  // Allows .json5 files in src/_data/ to be used as global data files, as the
  // house website layout expects. The holding page has none yet.
  eleventyConfig.addDataExtension('json5', {
    read: false,
    parser: (filePath: string) => JSON5.parse(readFileSync(filePath, 'utf-8')) as unknown
  })

  // ── Return the config ────────────────────────────────────────────────────

  return {
    dir: {
      input: 'src',
      output: 'dist',
      includes: '_includes',
      data: '_data'
    },
    htmlTemplateEngine: 'njk',
    markdownTemplateEngine: 'njk',
    templateFormats: ['njk', 'md', 'html']
  }
}
