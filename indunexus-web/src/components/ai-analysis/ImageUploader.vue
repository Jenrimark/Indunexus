<template>
  <div class="image-uploader">
    <!-- 错误提示 -->
    <div v-if="errorMessage" class="alert alert-error" role="alert">
      <svg viewBox="0 0 20 20" fill="currentColor" class="alert-icon">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
      </svg>
      <span>{{ errorMessage }}</span>
    </div>

    <!-- 亮度警告横幅 -->
    <div v-if="showBrightnessWarning && preprocessResult" class="alert alert-warning" role="alert">
      <svg viewBox="0 0 20 20" fill="currentColor" class="alert-icon">
        <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
      </svg>
      <span class="warning-text">{{ preprocessResult.warning }}</span>
      <div class="warning-actions">
        <button class="btn-warning-secondary cursor-pointer" @click="handleReset">重新上传</button>
        <button class="btn-warning-primary cursor-pointer" @click="handleContinue">继续识别</button>
      </div>
    </div>

    <!-- 上传区域（无预览图时显示） -->
    <div
      v-if="!previewUrl && !props.externalPreview"
      class="upload-zone"
      :class="{ 'upload-zone--dragging': isDragging }"
      @click="triggerFileInput"
      @dragover.prevent="onDragOver"
      @dragleave.prevent="onDragLeave"
      @drop.prevent="onDrop"
    >
      <input
        ref="fileInputRef"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        class="file-input"
        @change="onFileChange"
      />
      <div class="upload-zone__content">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="upload-icon">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
        </svg>
        <p class="upload-zone__title">点击或拖拽图片至此处</p>
        <p class="upload-zone__hint">支持 JPG、PNG、WEBP，最大 10MB</p>
      </div>
    </div>

    <!-- 预览图 + 信息面板 -->
    <!-- 外部传入图片（从 modal 跳转过来）：只显示图片，无 preprocessResult -->
    <div v-if="props.externalPreview && !previewUrl" class="preview-panel preview-panel--external">
      <div class="preview-image-wrap">
        <img :src="props.externalPreview" alt="预览图" class="preview-image" />
      </div>
      <div class="info-panel">
        <div class="info-row">
          <span class="info-label">状态</span>
          <span class="info-value info-value--success">
            <svg viewBox="0 0 20 20" fill="currentColor" class="status-icon">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            图片已加载
          </span>
        </div>
        <div class="info-row">
          <span class="info-label">来源</span>
          <span class="info-value">快速识别上传</span>
        </div>
      </div>
    </div>

    <!-- 预览图 + 信息面板 -->
    <div v-if="(previewUrl || props.externalPreview) && preprocessResult && !showBrightnessWarning" class="preview-panel">
      <div class="preview-image-wrap">
        <img :src="previewUrl || props.externalPreview" alt="预览图" class="preview-image" />
      </div>
      <div class="info-panel">
        <div class="info-row">
          <span class="info-label">文件名</span>
          <span class="info-value">{{ preprocessResult.fileName }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">原始尺寸</span>
          <span class="info-value">{{ preprocessResult.originalSize.width }} × {{ preprocessResult.originalSize.height }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">文件大小</span>
          <span class="info-value">{{ formatFileSize(preprocessResult.fileSize) }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">预处理状态</span>
          <span class="info-value info-value--success">
            <svg viewBox="0 0 20 20" fill="currentColor" class="status-icon">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            已完成
          </span>
        </div>
        <div class="info-row">
          <span class="info-label">压缩后尺寸</span>
          <span class="info-value">{{ preprocessResult.processedSize.width }} × {{ preprocessResult.processedSize.height }}</span>
        </div>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div v-if="(previewUrl || props.externalPreview) && preprocessResult && !showBrightnessWarning" class="action-bar">
      <button class="btn-secondary cursor-pointer" @click="handleReset">
        <svg viewBox="0 0 20 20" fill="currentColor" class="btn-icon">
          <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd" />
        </svg>
        重新上传
      </button>
      <button
        v-if="!isAnalyzing"
        class="btn-primary cursor-pointer"
        @click="emit('startAnalysis')"
      >
        <svg viewBox="0 0 20 20" fill="currentColor" class="btn-icon">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd" />
        </svg>
        开始识别
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useImagePreprocessor, type PreprocessResult } from '../../composables/useImagePreprocessor';

interface Props {
  isAnalyzing?: boolean;
  externalPreview?: string;
}

const props = withDefaults(defineProps<Props>(), {
  isAnalyzing: false,
  externalPreview: '',
});

const emit = defineEmits<{
  preprocessed: [result: PreprocessResult];
  startAnalysis: [];
}>();

const { preprocess } = useImagePreprocessor();

const fileInputRef = ref<HTMLInputElement | null>(null);
const isDragging = ref(false);
const previewUrl = ref('');
const errorMessage = ref('');
const preprocessResult = ref<PreprocessResult | null>(null);
const showBrightnessWarning = ref(false);

function triggerFileInput() {
  fileInputRef.value?.click();
}

function onDragOver() {
  isDragging.value = true;
}

function onDragLeave() {
  isDragging.value = false;
}

async function onDrop(event: DragEvent) {
  isDragging.value = false;
  const file = event.dataTransfer?.files?.[0];
  if (file) await processFile(file);
}

async function onFileChange(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (file) await processFile(file);
  // 清空 input 以允许重复选择同一文件
  if (fileInputRef.value) fileInputRef.value.value = '';
}

async function processFile(file: File) {
  errorMessage.value = '';
  showBrightnessWarning.value = false;
  preprocessResult.value = null;
  previewUrl.value = '';

  const result = await preprocess(file);

  if (!result.valid) {
    errorMessage.value = result.error ?? '文件处理失败';
    return;
  }

  preprocessResult.value = result;
  previewUrl.value = result.processedDataUrl;

  if (result.warning) {
    showBrightnessWarning.value = true;
    return;
  }

  emit('preprocessed', result);
}

function handleContinue() {
  showBrightnessWarning.value = false;
  if (preprocessResult.value) {
    emit('preprocessed', preprocessResult.value);
  }
}

function handleReset() {
  previewUrl.value = '';
  errorMessage.value = '';
  preprocessResult.value = null;
  showBrightnessWarning.value = false;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
</script>

<style scoped>
.image-uploader {
  display: flex;
  flex-direction: column;
  gap: var(--space-md, 16px);
}

/* ── 警告/错误横幅 ── */
.alert {
  display: flex;
  align-items: flex-start;
  gap: var(--space-sm, 8px);
  padding: var(--space-md, 16px);
  border-radius: var(--radius-md, 8px);
  font-size: 0.875rem;
  font-weight: 500;
}

.alert-error {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
}

.alert-warning {
  background: #fffbeb;
  border: 1px solid #fde68a;
  color: #92400e;
  flex-wrap: wrap;
}

.alert-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  margin-top: 1px;
}

.warning-text {
  flex: 1;
  min-width: 0;
}

.warning-actions {
  display: flex;
  gap: var(--space-sm, 8px);
  margin-top: var(--space-xs, 4px);
  width: 100%;
}

.btn-warning-secondary {
  padding: 6px 14px;
  border-radius: var(--radius-sm, 6px);
  border: 1px solid #d97706;
  background: transparent;
  color: #92400e;
  font-size: 0.8125rem;
  font-weight: 600;
  transition: background 200ms ease;
}

.btn-warning-secondary:hover {
  background: #fef3c7;
}

.btn-warning-primary {
  padding: 6px 14px;
  border-radius: var(--radius-sm, 6px);
  background: #d97706;
  color: white;
  font-size: 0.8125rem;
  font-weight: 600;
  transition: opacity 200ms ease;
}

.btn-warning-primary:hover {
  opacity: 0.9;
}

/* ── 上传区域 ── */
.upload-zone {
  border: 2px dashed #cbd5e1;
  border-radius: var(--radius-lg, 12px);
  padding: var(--space-3xl, 64px) var(--space-xl, 32px);
  text-align: center;
  cursor: pointer;
  transition: border-color 200ms ease, background 200ms ease;
  background: #f8fafc;
}

.upload-zone:hover,
.upload-zone--dragging {
  border-color: var(--color-cta, #0369a1);
  background: #eff6ff;
}

.file-input {
  display: none;
}

.upload-zone__content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-sm, 8px);
  pointer-events: none;
}

.upload-icon {
  width: 48px;
  height: 48px;
  color: #94a3b8;
  margin-bottom: var(--space-xs, 4px);
}

.upload-zone__title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-primary, #0f172a);
}

.upload-zone__hint {
  font-size: 0.875rem;
  color: #64748b;
}

/* ── 预览面板 ── */
.preview-panel {
  display: flex;
  gap: var(--space-md, 16px);
  border: 1px solid #e2e8f0;
  border-radius: var(--radius-lg, 12px);
  overflow: hidden;
  background: white;
  box-shadow: var(--shadow-sm, 0 1px 2px rgba(0,0,0,0.05));
}

.preview-image-wrap {
  flex-shrink: 0;
  width: 160px;
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-image {
  width: 160px;
  height: 160px;
  object-fit: cover;
  display: block;
}

.info-panel {
  flex: 1;
  padding: var(--space-md, 16px);
  display: flex;
  flex-direction: column;
  gap: var(--space-sm, 8px);
  justify-content: center;
}

.info-row {
  display: flex;
  align-items: center;
  gap: var(--space-sm, 8px);
  font-size: 0.875rem;
}

.info-label {
  color: #64748b;
  width: 80px;
  flex-shrink: 0;
}

.info-value {
  color: var(--color-text, #020617);
  font-weight: 500;
  word-break: break-all;
}

.info-value--success {
  color: #059669;
  display: flex;
  align-items: center;
  gap: 4px;
}

.status-icon {
  width: 16px;
  height: 16px;
}

/* ── 操作按钮 ── */
.action-bar {
  display: flex;
  gap: var(--space-sm, 8px);
  justify-content: flex-end;
}

.btn-primary,
.btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs, 4px);
  padding: 10px 20px;
  border-radius: var(--radius-md, 8px);
  font-size: 0.9375rem;
  font-weight: 600;
  transition: all 200ms ease;
}

.btn-primary {
  background: var(--color-cta, #0369a1);
  color: white;
}

.btn-primary:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.btn-secondary {
  background: transparent;
  color: var(--color-primary, #0f172a);
  border: 2px solid var(--color-primary, #0f172a);
}

.btn-secondary:hover {
  background: #f1f5f9;
}

.btn-icon {
  width: 16px;
  height: 16px;
}
</style>
