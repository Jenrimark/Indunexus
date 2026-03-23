<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isOpen" class="modal-overlay" @click="handleClose">
        <div class="modal-container" @click.stop>
          <!-- Header -->
          <div class="modal-header">
            <div class="header-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
            </div>
            <div class="header-content">
              <h2>AI 智能识图</h2>
              <p class="header-subtitle">上传图片，跳转至 AI 分析页面</p>
            </div>
            <button class="close-btn cursor-pointer" @click="handleClose">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>

          <!-- Body -->
          <div class="modal-body">
            <!-- 错误提示 -->
            <div v-if="errorMsg" class="alert-error" role="alert">
              <svg viewBox="0 0 20 20" fill="currentColor" class="alert-icon">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
              {{ errorMsg }}
            </div>

            <!-- 亮度警告 -->
            <div v-if="brightnessWarning && previewUrl" class="alert-warning" role="alert">
              <svg viewBox="0 0 20 20" fill="currentColor" class="alert-icon">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
              <span>图片过暗，识别精度可能受影响</span>
              <div class="warning-btns">
                <button class="btn-warn-sec cursor-pointer" @click="reset">重新上传</button>
                <button class="btn-warn-pri cursor-pointer" @click="proceed">继续识别</button>
              </div>
            </div>

            <!-- 上传区 -->
            <div
              v-if="!previewUrl"
              class="upload-area cursor-pointer"
              :class="{ dragging: isDragging }"
              @click="triggerInput"
              @dragover.prevent="isDragging = true"
              @dragleave.prevent="isDragging = false"
              @drop.prevent="onDrop"
            >
              <input ref="fileInputRef" type="file" accept="image/jpeg,image/png,image/webp" class="file-input" @change="onFileChange" />
              <svg class="upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
              <p class="upload-title">点击或拖拽图片至此处</p>
              <p class="upload-hint">支持 JPG、PNG、WEBP，最大 10MB</p>
            </div>

            <!-- 预览 -->
            <div v-if="previewUrl && !brightnessWarning" class="preview-wrap">
              <img :src="previewUrl" alt="预览" class="preview-img" />
              <button class="reupload-btn cursor-pointer" @click="reset">
                <svg viewBox="0 0 20 20" fill="currentColor" class="btn-icon">
                  <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd" />
                </svg>
                重新上传
              </button>
            </div>

            <!-- 预处理中 -->
            <div v-if="isProcessing" class="processing-state">
              <div class="spinner"></div>
              <p>图片预处理中...</p>
            </div>
          </div>

          <!-- Footer -->
          <div v-if="previewUrl && !brightnessWarning && !isProcessing" class="modal-footer">
            <button class="btn-cancel cursor-pointer" @click="handleClose">取消</button>
            <button class="btn-submit cursor-pointer" @click="proceed">
              <svg viewBox="0 0 20 20" fill="currentColor" class="btn-icon">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd" />
              </svg>
              开始 AI 分析
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useImagePreprocessor, type PreprocessResult } from '../composables/useImagePreprocessor';
import { useAiAnalysisStore } from '../stores/aiAnalysis';

interface Props {
  isOpen: boolean;
}

defineProps<Props>();
const emit = defineEmits<{ close: [] }>();

const router = useRouter();
const { preprocess } = useImagePreprocessor();
const aiStore = useAiAnalysisStore();

const fileInputRef = ref<HTMLInputElement | null>(null);
const previewUrl = ref('');
const errorMsg = ref('');
const brightnessWarning = ref(false);
const isProcessing = ref(false);
const isDragging = ref(false);
const preprocessed = ref<PreprocessResult | null>(null);

function triggerInput() { fileInputRef.value?.click(); }

async function onDrop(e: DragEvent) {
  isDragging.value = false;
  const file = e.dataTransfer?.files?.[0];
  if (file) await processFile(file);
}

async function onFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (file) await processFile(file);
  if (fileInputRef.value) fileInputRef.value.value = '';
}

async function processFile(file: File) {
  reset();
  isProcessing.value = true;
  errorMsg.value = '';

  const result = await preprocess(file);
  isProcessing.value = false;

  if (!result.valid) {
    errorMsg.value = result.error ?? '文件处理失败';
    return;
  }

  preprocessed.value = result;
  previewUrl.value = result.processedDataUrl;

  if (result.warning) {
    brightnessWarning.value = true;
  }
}

function proceed() {
  if (!preprocessed.value) return;
  const r = preprocessed.value;
  // 把图片数据存入 store，AIAnalysisPage 挂载后自动消费
  aiStore.pendingAnalysis = {
    imageDataUrl: r.processedDataUrl,
    fileName: r.fileName,
    preprocessInfo: {
      originalSize: r.originalSize,
      processedSize: r.processedSize,
      brightnessScore: r.brightnessScore,
      fileSize: r.fileSize,
    },
  };
  handleClose();
  router.push('/ai-analysis');
}

function reset() {
  previewUrl.value = '';
  errorMsg.value = '';
  brightnessWarning.value = false;
  preprocessed.value = null;
}

function handleClose() {
  emit('close');
  setTimeout(reset, 300);
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-container {
  background: white;
  border-radius: 16px;
  max-width: 520px;
  width: 100%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 20px 25px rgba(0, 0, 0, 0.15);
}

/* Header */
.modal-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 24px;
  border-bottom: 1px solid #e2e8f0;
  background: linear-gradient(135deg, #0369a1 0%, #0284c7 100%);
  color: white;
}

.header-icon {
  width: 40px;
  height: 40px;
  background: rgba(255,255,255,0.2);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.header-icon svg { width: 22px; height: 22px; }

.header-content { flex: 1; }
.header-content h2 { font-size: 1.125rem; font-weight: 700; margin: 0 0 2px; }
.header-subtitle { font-size: 0.8125rem; opacity: 0.85; margin: 0; }

.close-btn {
  width: 32px; height: 32px;
  display: flex; align-items: center; justify-content: center;
  border-radius: 8px;
  background: rgba(255,255,255,0.15);
  transition: background 200ms ease;
}
.close-btn:hover { background: rgba(255,255,255,0.25); }
.close-btn svg { width: 18px; height: 18px; }

/* Body */
.modal-body {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Alerts */
.alert-error, .alert-warning {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
}
.alert-error { background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; }
.alert-warning { background: #fffbeb; border: 1px solid #fde68a; color: #92400e; flex-wrap: wrap; }
.alert-icon { width: 18px; height: 18px; flex-shrink: 0; margin-top: 1px; }

.warning-btns {
  display: flex; gap: 8px; width: 100%; margin-top: 8px;
}
.btn-warn-sec {
  padding: 5px 14px; border-radius: 6px; border: 1px solid #d97706;
  background: transparent; color: #92400e; font-size: 0.8125rem; font-weight: 600;
  transition: background 200ms ease;
}
.btn-warn-sec:hover { background: #fef3c7; }
.btn-warn-pri {
  padding: 5px 14px; border-radius: 6px; background: #d97706;
  color: white; font-size: 0.8125rem; font-weight: 600;
  transition: opacity 200ms ease;
}
.btn-warn-pri:hover { opacity: 0.9; }

/* Upload area */
.upload-area {
  border: 2px dashed #cbd5e1;
  border-radius: 12px;
  padding: 48px 32px;
  text-align: center;
  background: #f8fafc;
  transition: border-color 200ms ease, background 200ms ease;
}
.upload-area:hover, .upload-area.dragging {
  border-color: #0369a1;
  background: #eff6ff;
}
.file-input { display: none; }
.upload-icon { width: 48px; height: 48px; color: #94a3b8; margin: 0 auto 12px; }
.upload-title { font-size: 1rem; font-weight: 600; color: #0f172a; margin: 0 0 4px; }
.upload-hint { font-size: 0.875rem; color: #64748b; margin: 0; }

/* Preview */
.preview-wrap {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
}
.preview-img { width: 100%; max-height: 280px; object-fit: contain; display: block; background: #f1f5f9; }
.reupload-btn {
  position: absolute; top: 10px; right: 10px;
  display: flex; align-items: center; gap: 4px;
  padding: 6px 12px; background: white; border-radius: 8px;
  font-size: 0.8125rem; font-weight: 600; color: #0f172a;
  box-shadow: 0 2px 8px rgba(0,0,0,0.12);
  transition: box-shadow 200ms ease;
}
.reupload-btn:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.18); }

/* Processing */
.processing-state {
  display: flex; flex-direction: column; align-items: center;
  gap: 12px; padding: 32px 0; color: #64748b; font-size: 0.9375rem;
}
.spinner {
  width: 40px; height: 40px;
  border: 3px solid #e2e8f0;
  border-top-color: #0369a1;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Footer */
.modal-footer {
  display: flex; justify-content: flex-end; gap: 8px;
  padding: 16px 24px; border-top: 1px solid #e2e8f0;
}
.btn-cancel {
  padding: 10px 20px; border-radius: 8px;
  border: 1px solid #e2e8f0; background: white;
  color: #475569; font-size: 0.9375rem; font-weight: 500;
  transition: background 200ms ease;
}
.btn-cancel:hover { background: #f8fafc; }
.btn-submit {
  display: flex; align-items: center; gap: 6px;
  padding: 10px 20px; border-radius: 8px;
  background: #0369a1; color: white;
  font-size: 0.9375rem; font-weight: 600;
  transition: opacity 200ms ease;
}
.btn-submit:hover { opacity: 0.9; }
.btn-icon { width: 16px; height: 16px; }

/* Transition */
.modal-enter-active, .modal-leave-active { transition: opacity 0.25s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>
