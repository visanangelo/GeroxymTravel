'use client'

import { useEffect, useRef, useCallback } from 'react'

/**
 * Debounce a callback by delay. Runs after `delayMs` from last change of `deps`.
 * Cancels pending run on unmount or when deps change again before delay.
 * Uses a ref for callback so the latest callback is always invoked.
 */
export function useDebounce(callback: () => void, delayMs: number, deps: React.DependencyList) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const callbackRef = useRef(callback)
  callbackRef.current = callback

  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      timeoutRef.current = null
      callbackRef.current()
    }, delayMs)
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
    }
  }, deps)
}

/**
 * Return a debounced version of a callback. Use when you want to
 * call the same function from events (e.g. onChange) and have it
 * run only after the user stops for `delayMs`.
 */
export function useDebouncedCallback<T extends (...args: unknown[]) => void>(
  callback: T,
  delayMs: number
): T {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const callbackRef = useRef(callback)
  callbackRef.current = callback

  const debounced = useCallback(
    ((...args: Parameters<T>) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => {
        timeoutRef.current = null
        ;(callbackRef.current as T)(...args)
      }, delayMs)
    }) as T,
    [delayMs]
  )

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  return debounced
}
