/**
 * What the built holding page must carry: the domain, the title, the coming-soon line and the link to Knowledge
 * Islands. Each fault names what is missing, so a failing build says what to fix.
 */

export const DOMAIN = 'knowledgelandscapes.info'
export const PARENT = 'https://knowledgeislands.info'

/** Drop tags and collapse whitespace, so a check reads the page's text as a visitor would. */
const text = (html: string): string =>
  html
    .replace(/<[^>]+>/gu, '')
    .replace(/\s+/gu, ' ')
    .trim()

export const pageFaults = (html: string): string[] => {
  const faults: string[] = []
  const visible = text(html)
  if (!visible.includes(DOMAIN)) faults.push(`the page must show the domain ${DOMAIN}`)
  if (!/<h1[^>]*>Knowledge Landscapes<\/h1>/u.test(html))
    faults.push('the page must have the heading Knowledge Landscapes')
  if (!visible.includes('Knowledge Landscapes, part of Knowledge Islands, is coming soon.'))
    faults.push('the page must say that Knowledge Landscapes, part of Knowledge Islands, is coming soon')
  if (!html.includes(`href="${PARENT}"`)) faults.push(`the page must link to ${PARENT}`)
  return faults
}
