import { mount, flushPromises } from '@vue/test-utils'
import GoogleSearch from '@/views/GoogleSearch.vue'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

describe('GoogleSearch.vue (2025)', () => {
  let wrapper

  beforeEach(() => {
    wrapper = mount(GoogleSearch)
  })

  afterEach(() => {
    vi.restoreAllMocks()
    wrapper.unmount()
  })

  it('po zavolání getSearchResults() naplní `results` a zobrazí je v DOM', async () => {
    const fakeItems = [
      { title: 'Foo', link: 'http://foo', snippet: 'Foo snippet' },
      { title: 'Bar', link: 'http://bar', snippet: 'Bar snippet' }
    ]

    // 1) mock fetch
    vi.stubGlobal('fetch', vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ items: fakeItems })
      })
    ))

    // 2) spusť vyhledávání
    await wrapper.setData({ query: 'vitest' })
    await wrapper.vm.getSearchResults()
    await flushPromises()

    // 3) kontrola, že fetch byl volán právě 1×
    expect(fetch).toHaveBeenCalledTimes(1)

    // 4) vytáhneme reálný argument volání a zkontrolujeme URL
    const calledArg = fetch.mock.calls[0][0]
    const urlString = calledArg instanceof URL ? calledArg.toString() : calledArg
    expect(urlString).toContain('https://www.googleapis.com/customsearch/v1')

    // 5) výsledky ve komponentě
    expect(wrapper.vm.results).toEqual(fakeItems)

    // 6) a správné vykreslení do DOM
    await wrapper.vm.$nextTick()
    const items = wrapper.findAll('ul.results_list li')
    expect(items).toHaveLength(2)
    expect(items[0].text()).toContain('Foo')
    expect(items[1].find('a').attributes('href')).toBe('http://bar')
  })

  it('saveResults() stáhne JSON soubor s výsledky', async () => {
    const data = [{ title: 'X', link: 'http://x', snippet: 'X snippet' }]
    await wrapper.setData({ results: data })

    // 1) zajistíme, že URL.createObjectURL existuje
    if (!URL.createObjectURL) {
      URL.createObjectURL = vi.fn(() => 'blob:http://test')
      URL.revokeObjectURL = vi.fn()
    } else {
      vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:http://test')
      vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
    }

    // 2) mock <a> element a jeho click()
    const realCreate = document.createElement.bind(document)
    const clickSpy = vi.fn()
    vi.spyOn(document, 'createElement').mockImplementation(tag => {
      if (tag === 'a') return { href: '', download: '', click: clickSpy }
      return realCreate(tag)
    })
    vi.spyOn(document.body, 'appendChild').mockImplementation(() => {})
    vi.spyOn(document.body, 'removeChild').mockImplementation(() => {})

    // 3) spusť uložení
    await wrapper.vm.saveResults()

    // 4) ověření
    expect(URL.createObjectURL).toHaveBeenCalled()
    expect(clickSpy).toHaveBeenCalled()
  })
})
