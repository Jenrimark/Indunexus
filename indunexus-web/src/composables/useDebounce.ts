// 防抖 Composable
import { customRef } from 'vue';

export function useDebounce<T>(value: T, delay: number = 300) {
  return customRef<T>((track, trigger) => {
    let timeout: ReturnType<typeof setTimeout>;
    
    return {
      get() {
        track();
        return value;
      },
      set(newValue: T) {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          value = newValue;
          trigger();
        }, delay);
      },
    };
  });
}

export function useDebounceFn<T extends (...args: any[]) => any>(
  fn: T,
  delay: number = 300
) {
  let timeout: ReturnType<typeof setTimeout>;

  return function (this: any, ...args: Parameters<T>) {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  } as T;
}
