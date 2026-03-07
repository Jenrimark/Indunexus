// 无限滚动 Composable
import { ref, onMounted, onUnmounted } from 'vue';

export function useInfiniteScroll(
  callback: () => void,
  options: {
    threshold?: number;
    rootMargin?: string;
  } = {}
) {
  const target = ref<HTMLElement | null>(null);
  const isLoading = ref(false);
  
  let observer: IntersectionObserver | null = null;

  const observe = () => {
    if (!target.value) return;

    observer = new IntersectionObserver(
      (entries) => {
        if (entries[0] && entries[0].isIntersecting && !isLoading.value) {
          isLoading.value = true;
          callback();
          setTimeout(() => {
            isLoading.value = false;
          }, 500);
        }
      },
      {
        threshold: options.threshold || 0.1,
        rootMargin: options.rootMargin || '0px',
      }
    );

    observer.observe(target.value);
  };

  const disconnect = () => {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
  };

  onMounted(() => {
    observe();
  });

  onUnmounted(() => {
    disconnect();
  });

  return {
    target,
    isLoading,
  };
}
