import type { Env, Hono } from 'hono'

export type Handler = <env extends Env>(hono: Hono<env>) => void
