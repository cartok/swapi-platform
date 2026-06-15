import { test } from '#internal/extensions/index'
import { monitoringPresets } from '#internal/extensions/monitoring/monitoring'

test.use({
  ...monitoringPresets.request,
})
