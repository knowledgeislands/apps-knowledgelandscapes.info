import { describe, expect, test } from 'bun:test'
import { pageFaults } from './page.ts'

/** A minimal complete page, which each case below breaks in one place. */
const complete = (): string =>
  [
    '<p class="domain">knowledgelandscapes.info</p>',
    '<h1 id="page-title">Knowledge Landscapes</h1>',
    '<p>Knowledge Landscapes, part of <a href="https://knowledgeislands.info">Knowledge Islands<svg></svg></a>,',
    ' is coming soon.</p>'
  ].join('\n')

describe('pageFaults', () => {
  test('accepts a complete page', () => {
    expect(pageFaults(complete())).toEqual([])
  })

  test('names a missing domain', () => {
    expect(pageFaults(complete().replace('knowledgelandscapes.info', ''))).toEqual([
      'the page must show the domain knowledgelandscapes.info'
    ])
  })

  test('names a missing heading', () => {
    expect(pageFaults(complete().replace('<h1 id="page-title">Knowledge Landscapes</h1>', ''))).toEqual([
      'the page must have the heading Knowledge Landscapes'
    ])
  })

  test('names a missing coming-soon line', () => {
    expect(pageFaults(complete().replace('is coming soon', 'is here')).length).toBe(1)
  })

  test('names a missing link to Knowledge Islands', () => {
    expect(pageFaults(complete().replace('https://knowledgeislands.info', 'https://example.org'))).toEqual([
      'the page must link to https://knowledgeislands.info'
    ])
  })
})
