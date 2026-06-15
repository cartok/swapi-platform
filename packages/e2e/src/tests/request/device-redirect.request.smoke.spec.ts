import { expect, test } from '#internal/extensions/index'
import { monitoringPresets } from '#internal/extensions/monitoring/monitoring'
import { TAGS } from '#internal/tags'

test.use({
  ...monitoringPresets.request,
})

test(
  'device redirect',
  { tag: [TAGS.REQUEST, TAGS.WORKER, TAGS.SMOKE] },
  async ({ request }) => {
    const response = await request.get('/', {
      headers: {
        Accept: 'text/html',
        'Sec-CH-UA-Form-Factors': '"Desktop"',
        'Sec-CH-Viewport-Height': '1080',
        'Sec-CH-Viewport-Width': '1280',
      },
      maxRedirects: 0,
    })

    expect(response.status()).toBe(302)
    expect(response.headers()['location']).toBe(
      '/r;format=desktop;width=1280;height=1080/',
    )
    expect(response.headers()['accept-ch']).toBe(
      'Sec-CH-UA-Form-Factors, Sec-CH-Viewport-Width, Sec-CH-Viewport-Height',
    )
    expect(response.headers()['cache-control']).toBe('private, no-store')
    expect(response.headers()['cdn-cache-control']).toBe('no-store')
  },
)
