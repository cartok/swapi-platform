import type { PlaywrightTestProject } from '@playwright/test'
import { defineConfig, devices } from '@playwright/test'
import { logEnv } from '@swapi/shared/environment/env'

import { runEnv } from '#internal/env'
import { createTestFilesRegex } from '#internal/file-regex'
import { FLAGS } from '#internal/flags'
import { LABELS } from '#internal/labels'
import { TAGS } from '#internal/tags'

if (runEnv.TEST_WORKER_INDEX === undefined) {
  logEnv(runEnv, 'Playwright Environment Variables')
}

const serverBaseUrl = `http://${runEnv.APP_SERVER_HOSTNAME}:${runEnv.APP_SERVER_PORT}`
const workerBaseUrl = `http://${runEnv.APP_WORKER_HOSTNAME}:${runEnv.APP_WORKER_PORT}`
const testDir = './src/tests'
const browserTestDir = `${testDir}/browser`
const requestTestDir = `${testDir}/request`

class Projects {
  private static projects = {
    'Chromium (desktop) - smoke': {
      testDir: browserTestDir,
      testMatch: createTestFilesRegex(FLAGS.SMOKE),
      fullyParallel: false,
      use: {
        ...devices['Desktop Chrome'],
      },
    },
    'Request (app-server) - smoke': {
      testDir: requestTestDir,
      testMatch: createTestFilesRegex(FLAGS.SMOKE),
      grepInvert: new RegExp(TAGS.WORKER),
      fullyParallel: false,
    },
    'Request (app-worker) - smoke': {
      testDir: requestTestDir,
      testMatch: createTestFilesRegex(FLAGS.SMOKE),
      grep: new RegExp(TAGS.WORKER),
      fullyParallel: false,
      use: {
        baseURL: workerBaseUrl,
      },
    },
    'Chromium (desktop) - feature': {
      testDir: browserTestDir,
      testIgnore: createTestFilesRegex([
        {
          labels: [LABELS.ARIA_SNAPSHOT, LABELS.AXE, LABELS.SCREENSHOT],
        },
        { flag: FLAGS.SMOKE },
      ]),
      fullyParallel: false,
      use: {
        ...devices['Desktop Chrome'],
      },
    },
    'Webkit (desktop) - feature': {
      testDir: browserTestDir,
      testIgnore: createTestFilesRegex([
        {
          labels: [LABELS.ARIA_SNAPSHOT, LABELS.AXE, LABELS.SCREENSHOT],
        },
        { flag: FLAGS.SMOKE },
      ]),
      fullyParallel: false,
      use: {
        ...devices['Desktop Safari'],
      },
    },
    'Firefox (desktop) - feature': {
      testDir: browserTestDir,
      testIgnore: createTestFilesRegex([
        {
          labels: [LABELS.ARIA_SNAPSHOT, LABELS.AXE, LABELS.SCREENSHOT],
        },
        { flag: FLAGS.SMOKE },
      ]),
      fullyParallel: false,
      use: {
        ...devices['Desktop Firefox'],
      },
    },
    'Request (app-server)': {
      testDir: requestTestDir,
      testIgnore: createTestFilesRegex(FLAGS.SMOKE),
      grepInvert: new RegExp(TAGS.WORKER),
      fullyParallel: false,
    },
    'Request (app-worker)': {
      testDir: requestTestDir,
      testIgnore: createTestFilesRegex(FLAGS.SMOKE),
      grep: new RegExp(TAGS.WORKER),
      fullyParallel: false,
      use: {
        baseURL: workerBaseUrl,
      },
    },
    'Chromium (desktop) - aria-snapshot': {
      testDir: browserTestDir,
      testMatch: createTestFilesRegex(LABELS.ARIA_SNAPSHOT),
      testIgnore: createTestFilesRegex(FLAGS.SMOKE),
      fullyParallel: false,
      use: {
        ...devices['Desktop Chrome'],
      },
    },
    'Chromium (desktop) - axe': {
      testDir: browserTestDir,
      testMatch: createTestFilesRegex(LABELS.AXE),
      testIgnore: createTestFilesRegex(FLAGS.SMOKE),
      fullyParallel: true,
      use: {
        ...devices['Desktop Chrome'],
      },
    },
    'Chromium (desktop) - screenshot': {
      testDir: browserTestDir,
      testMatch: createTestFilesRegex(LABELS.SCREENSHOT),
      testIgnore: createTestFilesRegex(FLAGS.SMOKE),
      fullyParallel: true,
      use: {
        baseURL: `${serverBaseUrl}/r;format=desktop;width=1920;height=1080/`,
        ...devices['Desktop Chrome'],
        channel: 'chromium',
        viewport: {
          height: 1080,
          width: 1920,
        },
      },
    },
    'Chromium (tablet) - screenshot': {
      testDir: browserTestDir,
      testMatch: createTestFilesRegex(LABELS.SCREENSHOT),
      testIgnore: createTestFilesRegex(FLAGS.SMOKE),
      fullyParallel: true,
      use: {
        baseURL: `${serverBaseUrl}/r;format=tablet;width=800;height=1280/`,
        ...devices['Desktop Chrome'],
        channel: 'chromium',
        viewport: {
          height: 1280,
          width: 800,
        },
      },
    },
    'Chromium (mobile) - screenshot': {
      testDir: browserTestDir,
      testMatch: createTestFilesRegex(LABELS.SCREENSHOT),
      testIgnore: createTestFilesRegex(FLAGS.SMOKE),
      fullyParallel: true,
      use: {
        baseURL: `${serverBaseUrl}/r;format=mobile;width=360;height=800/`,
        ...devices['Desktop Chrome'],
        channel: 'chromium',
        viewport: {
          height: 800,
          width: 360,
        },
      },
    },
    'Webkit (desktop) - screenshot': {
      testDir: browserTestDir,
      testMatch: createTestFilesRegex(LABELS.SCREENSHOT),
      testIgnore: createTestFilesRegex(FLAGS.SMOKE),
      fullyParallel: true,
      use: {
        baseURL: `${serverBaseUrl}/r;format=desktop;width=1920;height=1080/`,
        ...devices['Desktop Safari'],
        viewport: {
          height: 1080,
          width: 1920,
        },
      },
    },
    'Firefox (desktop) - screenshot': {
      testDir: browserTestDir,
      testMatch: createTestFilesRegex(LABELS.SCREENSHOT),
      testIgnore: createTestFilesRegex(FLAGS.SMOKE),
      fullyParallel: true,
      use: {
        baseURL: `${serverBaseUrl}/r;format=desktop;width=1920;height=1080/`,
        ...devices['Desktop Firefox'],
        viewport: {
          height: 1080,
          width: 1920,
        },
      },
    },
  } as const satisfies Record<
    NonNullable<PlaywrightTestProject['name']>,
    Omit<PlaywrightTestProject, 'name'>
  >

  static use<
    const projectName extends keyof typeof Projects.projects,
    const optionOverrides extends ProjectOptions<keyof typeof Projects.projects> =
      NoProjectOptions,
  >(projectName: projectName, optionOverrides?: optionOverrides) {
    return {
      name: projectName,
      ...Projects.projects[projectName],
      ...optionOverrides,
    } as unknown as Project<
      { name: projectName } & (typeof Projects.projects)[projectName],
      optionOverrides
    >
  }
}

type ProjectOptions<projectName extends string> = Partial<
  Omit<PlaywrightTestProject, 'dependencies'> & {
    dependencies: projectName[]
  }
>

type NoProjectOptions = Record<never, never>

type Project<base, overrides> = Omit<base, keyof overrides> & overrides

const screenshotFolder = '__screenshots__'
const ariaSnapshotFolder = '__aria-snapshots__'

export default defineConfig({
  forbidOnly: runEnv.CI,
  retries: runEnv.CI ? 2 : 0,
  maxFailures: runEnv.CI ? 4 : 0,
  fullyParallel: false,
  workers: runEnv.CI ? 1 : runEnv.IS_LOCAL_E2E ? '65%' : '55%',
  reporter: runEnv.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  timeout: runEnv.CI ? 30 * 1000 : 10 * 1000,
  globalTimeout: runEnv.CI ? 9 * 60 * 1000 : 3 * 60 * 1000,
  expect: {
    timeout: runEnv.CI ? 30 * 1000 : 15 * 1000,
    toHaveScreenshot: {
      animations: 'disabled',
      pathTemplate: `{testDir}/{testFileDir}/${screenshotFolder}/{projectName}/{arg}{ext}`,
    },
    toMatchAriaSnapshot: {
      pathTemplate: `{testDir}/{testFileDir}/${ariaSnapshotFolder}/{arg}{ext}`,
    },
  },
  use: {
    baseURL: serverBaseUrl,
    screenshot: runEnv.CI ? 'on-first-failure' : 'off',
    trace: runEnv.CI ? 'on-first-retry' : 'off',
    navigationTimeout: runEnv.CI ? 15 * 1000 : 5 * 1000,
    actionTimeout: runEnv.CI ? 15 * 1000 : 5 * 1000,
  },
  projects: runEnv.IS_LOCAL_E2E
    ? [
        Projects.use('Chromium (desktop) - smoke'),
        Projects.use('Request (app-server) - smoke'),
        Projects.use('Request (app-worker) - smoke'),
        Projects.use('Chromium (desktop) - feature', {
          dependencies: [
            'Chromium (desktop) - smoke',
            'Request (app-server) - smoke',
            'Request (app-worker) - smoke',
          ],
        }),
        Projects.use('Request (app-server)', {
          dependencies: [
            'Chromium (desktop) - smoke',
            'Request (app-server) - smoke',
            'Request (app-worker) - smoke',
          ],
        }),
        Projects.use('Request (app-worker)', {
          dependencies: [
            'Chromium (desktop) - smoke',
            'Request (app-server) - smoke',
            'Request (app-worker) - smoke',
          ],
        }),
        Projects.use('Chromium (desktop) - aria-snapshot', {
          dependencies: [
            'Chromium (desktop) - smoke',
            'Request (app-server) - smoke',
            'Request (app-worker) - smoke',
          ],
        }),
        Projects.use('Chromium (desktop) - axe', {
          dependencies: [
            'Chromium (desktop) - smoke',
            'Request (app-server) - smoke',
            'Request (app-worker) - smoke',
            'Chromium (desktop) - aria-snapshot',
          ],
        }),
        Projects.use('Chromium (desktop) - screenshot', {
          dependencies: [
            'Chromium (desktop) - smoke',
            'Request (app-server) - smoke',
            'Request (app-worker) - smoke',
          ],
        }),
        Projects.use('Chromium (tablet) - screenshot', {
          dependencies: [
            'Chromium (desktop) - smoke',
            'Request (app-server) - smoke',
            'Request (app-worker) - smoke',
            'Chromium (desktop) - screenshot',
          ],
        }),
        Projects.use('Chromium (mobile) - screenshot', {
          dependencies: [
            'Chromium (desktop) - smoke',
            'Request (app-server) - smoke',
            'Request (app-worker) - smoke',
            'Chromium (desktop) - screenshot',
          ],
        }),
      ]
    : [
        Projects.use('Chromium (desktop) - smoke'),
        Projects.use('Request (app-server) - smoke'),
        Projects.use('Request (app-worker) - smoke'),
        Projects.use('Chromium (desktop) - feature', {
          dependencies: [
            'Chromium (desktop) - smoke',
            'Request (app-server) - smoke',
            'Request (app-worker) - smoke',
          ],
        }),
        Projects.use('Webkit (desktop) - feature', {
          dependencies: [
            'Chromium (desktop) - smoke',
            'Request (app-server) - smoke',
            'Request (app-worker) - smoke',
            'Chromium (desktop) - feature',
          ],
        }),
        Projects.use('Firefox (desktop) - feature', {
          dependencies: [
            'Chromium (desktop) - smoke',
            'Request (app-server) - smoke',
            'Request (app-worker) - smoke',
            'Chromium (desktop) - feature',
          ],
        }),
        Projects.use('Request (app-server)', {
          dependencies: [
            'Chromium (desktop) - smoke',
            'Request (app-server) - smoke',
            'Request (app-worker) - smoke',
          ],
        }),
        Projects.use('Request (app-worker)', {
          dependencies: [
            'Chromium (desktop) - smoke',
            'Request (app-server) - smoke',
            'Request (app-worker) - smoke',
          ],
        }),
        Projects.use('Chromium (desktop) - aria-snapshot', {
          dependencies: [
            'Chromium (desktop) - smoke',
            'Request (app-server) - smoke',
            'Request (app-worker) - smoke',
          ],
        }),
        Projects.use('Chromium (desktop) - axe', {
          dependencies: [
            'Chromium (desktop) - smoke',
            'Request (app-server) - smoke',
            'Request (app-worker) - smoke',
            'Chromium (desktop) - aria-snapshot',
          ],
        }),
        Projects.use('Chromium (desktop) - screenshot', {
          dependencies: [
            'Chromium (desktop) - smoke',
            'Request (app-server) - smoke',
            'Request (app-worker) - smoke',
          ],
        }),
        Projects.use('Chromium (tablet) - screenshot', {
          dependencies: [
            'Chromium (desktop) - smoke',
            'Request (app-server) - smoke',
            'Request (app-worker) - smoke',
            'Chromium (desktop) - screenshot',
          ],
        }),
        Projects.use('Chromium (mobile) - screenshot', {
          dependencies: [
            'Chromium (desktop) - smoke',
            'Request (app-server) - smoke',
            'Request (app-worker) - smoke',
            'Chromium (desktop) - screenshot',
          ],
        }),
        Projects.use('Webkit (desktop) - screenshot', {
          dependencies: [
            'Chromium (desktop) - smoke',
            'Request (app-server) - smoke',
            'Request (app-worker) - smoke',
            'Chromium (desktop) - screenshot',
          ],
        }),
        Projects.use('Firefox (desktop) - screenshot', {
          dependencies: [
            'Chromium (desktop) - smoke',
            'Request (app-server) - smoke',
            'Request (app-worker) - smoke',
            'Chromium (desktop) - screenshot',
          ],
        }),
      ],
})
