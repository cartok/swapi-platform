import type { InputSignal } from '@angular/core'

export type InputValue<
  TComponent extends abstract new (...args: unknown[]) => unknown,
  TProperty extends keyof InstanceType<TComponent>,
> = InstanceType<TComponent>[TProperty] extends InputSignal<infer TValue> ? TValue : never

export type InputValues<
  TComponent extends abstract new (...args: unknown[]) => unknown,
  TProperty extends keyof InstanceType<TComponent>,
> = {
  [K in TProperty]: InputValue<TComponent, K>
}
