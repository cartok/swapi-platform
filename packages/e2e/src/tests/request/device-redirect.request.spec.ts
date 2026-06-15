import { expect, test } from '#internal/extensions/index'
import { monitoringPresets } from '#internal/extensions/monitoring/monitoring'
import { TAGS } from '#internal/tags'

test.use({
  ...monitoringPresets.request,
})

test.describe('device redirect', { tag: [TAGS.REQUEST, TAGS.WORKER] }, () => {
  for (const testCase of [
    {
      name: 'desktop',
      headers: {
        'Sec-CH-UA-Form-Factors': '"Desktop"',
        'Sec-CH-Viewport-Height': '1080',
        'Sec-CH-Viewport-Width': '1280',
      },
      expectedPathSegment: 'r;format=desktop;width=1280;height=1080',
    },
    {
      name: 'tablet',
      headers: {
        'Sec-CH-UA-Form-Factors': '"Tablet"',
        'Sec-CH-Viewport-Height': '1024',
        'Sec-CH-Viewport-Width': '768',
      },
      expectedPathSegment: 'r;format=tablet;width=768;height=1080',
    },
    {
      name: 'mobile',
      headers: {
        'Sec-CH-UA-Form-Factors': '"Mobile"',
        'Sec-CH-Viewport-Height': '800',
        'Sec-CH-Viewport-Width': '360',
      },
      expectedPathSegment: 'r;format=mobile;width=360;height=820',
    },
  ] as const) {
    test(`creates redirect urls for ${testCase.name}`, async ({ request }) => {
      const response = await request.get('/movies?sort=release-date', {
        headers: {
          Accept: 'text/html',
          ...testCase.headers,
        },
        maxRedirects: 0,
      })

      expect(response.status()).toBe(302)
      expect(response.headers()['location']).toBe(
        `/${testCase.expectedPathSegment}/movies?sort=release-date`,
      )
    })
  }

  test('falls back to mobile format without client hints', async ({ request }) => {
    const response = await request.get('/', {
      headers: {
        Accept: 'text/html',
      },
      maxRedirects: 0,
    })

    expect(response.status()).toBe(302)
    expect(response.headers()['location']).toBe('/r;format=mobile/')
  })

  test('uses low entropy mobile hint when form factor is missing', async ({
    request,
  }) => {
    const response = await request.get('/characters', {
      headers: {
        Accept: 'text/html',
        'Sec-CH-UA-Mobile': '?0',
      },
      maxRedirects: 0,
    })

    expect(response.status()).toBe(302)
    expect(response.headers()['location']).toBe('/r;format=desktop/characters')
  })

  test('replaces malformed device context path segment', async ({ request }) => {
    const response = await request.get('/r;format=desktop;width=999/movies', {
      headers: {
        Accept: 'text/html',
        'Sec-CH-UA-Form-Factors': '"Tablet"',
        'Sec-CH-Viewport-Height': '1024',
        'Sec-CH-Viewport-Width': '768',
      },
      maxRedirects: 0,
    })

    expect(response.status()).toBe(302)
    expect(response.headers()['location']).toBe(
      '/r;format=tablet;width=768;height=1080/movies',
    )
  })

  test('does not redirect valid device context paths', async ({ request }) => {
    const response = await request.get('/r;format=desktop;width=1280;height=1080/', {
      headers: {
        Accept: 'text/html',
      },
      maxRedirects: 0,
    })

    expect(response.status()).not.toBe(302)
  })

  test('does not redirect error page paths', async ({ request }) => {
    const response = await request.get('/error', {
      headers: {
        Accept: 'text/html',
        'Sec-CH-UA-Form-Factors': '"Desktop"',
      },
      maxRedirects: 0,
    })

    expect(response.status()).not.toBe(302)
  })

  test('does not redirect non-html requests', async ({ request }) => {
    const response = await request.get('/robots.txt', {
      headers: {
        Accept: 'text/plain',
        'Sec-CH-UA-Form-Factors': '"Desktop"',
      },
      maxRedirects: 0,
    })

    expect(response.status()).not.toBe(302)
  })
})
