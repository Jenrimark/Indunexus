<template>
  <div class="skeleton-card">
    <div class="skeleton-image"></div>
    <div class="skeleton-content">
      <div class="skeleton-title"></div>
      <div class="skeleton-subtitle"></div>
      <div class="skeleton-specs">
        <div class="skeleton-spec"></div>
        <div class="skeleton-spec"></div>
      </div>
      <div class="skeleton-footer">
        <div class="skeleton-price"></div>
        <div class="skeleton-button"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.skeleton-card {
  background: white;
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-base);
}

.skeleton-image {
  width: 100%;
  padding-top: 100%;
  background: linear-gradient(
    90deg,
    var(--color-gray-200) 25%,
    var(--color-gray-100) 50%,
    var(--color-gray-200) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-content {
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.skeleton-title {
  height: 20px;
  width: 80%;
  background: linear-gradient(
    90deg,
    var(--color-gray-200) 25%,
    var(--color-gray-100) 50%,
    var(--color-gray-200) 75%
  );
  background-size: 200% 100%;
  border-radius: var(--radius-sm);
  animation: shimmer 1.5s infinite;
}

.skeleton-subtitle {
  height: 16px;
  width: 50%;
  background: linear-gradient(
    90deg,
    var(--color-gray-200) 25%,
    var(--color-gray-100) 50%,
    var(--color-gray-200) 75%
  );
  background-size: 200% 100%;
  border-radius: var(--radius-sm);
  animation: shimmer 1.5s infinite;
}

.skeleton-specs {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.skeleton-spec {
  height: 14px;
  width: 60%;
  background: linear-gradient(
    90deg,
    var(--color-gray-200) 25%,
    var(--color-gray-100) 50%,
    var(--color-gray-200) 75%
  );
  background-size: 200% 100%;
  border-radius: var(--radius-sm);
  animation: shimmer 1.5s infinite;
}

.skeleton-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: var(--space-3);
  border-top: 1px solid var(--color-gray-100);
}

.skeleton-price {
  height: 24px;
  width: 80px;
  background: linear-gradient(
    90deg,
    var(--color-gray-200) 25%,
    var(--color-gray-100) 50%,
    var(--color-gray-200) 75%
  );
  background-size: 200% 100%;
  border-radius: var(--radius-sm);
  animation: shimmer 1.5s infinite;
}

.skeleton-button {
  height: 36px;
  width: 36px;
  background: linear-gradient(
    90deg,
    var(--color-gray-200) 25%,
    var(--color-gray-100) 50%,
    var(--color-gray-200) 75%
  );
  background-size: 200% 100%;
  border-radius: var(--radius-md);
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .skeleton-image,
  .skeleton-title,
  .skeleton-subtitle,
  .skeleton-spec,
  .skeleton-price,
  .skeleton-button {
    animation: none;
  }
}
</style>
