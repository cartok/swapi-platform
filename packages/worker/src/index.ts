import { Hono } from 'hono'

const hono = new Hono<{ Bindings: CloudflareBindings }>()

hono.get('/', (c) => {
  return c.text('Hello Hono <3')
})

export default hono
