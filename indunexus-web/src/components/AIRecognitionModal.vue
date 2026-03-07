<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isOpen" class="modal-overlay" @click="handleClose">
        <div class="modal-container" @click.stop>
          <div class="modal-header">
            <div class="header-icon">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
              </svg>
            </div>
            <div class="header-content">
              <h2>AI 智能识图</h2>
              <p class="header-subtitle">基于深度学习的零部件视觉识别</p>
            </div>
            <button class="close-btn cursor-pointer" @click="handleClose">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>

          <div class="modal-body">
            <div
              v-if="!uploadedImage && !isProcessing"
              class="upload-area cursor-pointer"
              @click="triggerFileInput"
            >
              <svg class="upload-icon" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
              </svg>
              <h3>上传零部件图片</h3>
              <p>点击选择文件</p>
              <input
                ref="fileInput"
                type="file"
                accept="image/*"
                class="file-input"
                @change="handleFileSelect"
              />
            </div>

            <div v-if="uploadedImage && !isProcessing" class="image-preview">
              <img :src="uploadedImage" alt="Uploaded" />
              <button class="reupload-btn cursor-pointer" @click="resetUpload">重新上传</button>
            </div>

            <div v-if="isProcessing" class="processing-state">
              <div class="processing-spinner"></div>
              <h3>AI 识别中...</h3>
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: `${progress}%` }"></div>
              </div>
            </div>

            <div v-if="results.length > 0" class="results-container">
              <h3>识别结果 ({{ results.length }})</h3>
              <p class="results-hint">根据图像特征匹配，按相似度排序</p>
              <div
                v-for="(result, index) in results"
                :key="result.partId"
                class="result-card cursor-pointer"
                @click="selectResult(result)"
              >
                <div class="result-rank" :class="`rank-${index + 1}`">
                  {{ index + 1 }}
                </div>
                <img :src="result.thumbnail" :alt="result.partName" />
                <div class="result-info">
                  <h4>{{ result.partName }}</h4>
                  <p class="part-number">型号: {{ result.partNumber }}</p>
                  <div class="confidence-bar">
                    <div class="confidence-label">
                      <span>匹配度</span>
                      <span class="confidence-value" :class="getConfidenceClass(result.confidence)">
                        {{ (result.confidence * 100).toFixed(0) }}%
                      </span>
                    </div>
                    <div class="confidence-progress">
                      <div 
                        class="confidence-fill" 
                        :class="getConfidenceClass(result.confidence)"
                        :style="{ width: `${result.confidence * 100}%` }"
                      ></div>
                    </div>
                  </div>
                  <div class="matched-features">
                    <span v-for="feature in result.matchedFeatures" :key="feature" class="feature-tag">
                      {{ feature }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-if="uploadedImage && !isProcessing && results.length === 0" class="modal-footer">
            <button class="cancel-btn cursor-pointer" @click="handleClose">取消</button>
            <button class="submit-btn cursor-pointer" @click="startRecognition">开始识别</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { RecognitionResult } from '../types';

interface Props {
  isOpen: boolean;
}

defineProps<Props>();
const emit = defineEmits<{
  close: [];
  selectResult: [result: RecognitionResult];
}>();

const fileInput = ref<HTMLInputElement | null>(null);
const uploadedImage = ref('');
const isProcessing = ref(false);
const progress = ref(0);
const results = ref<RecognitionResult[]>([]);

const triggerFileInput = () => fileInput.value?.click();

const handleFileSelect = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      uploadedImage.value = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }
};

const resetUpload = () => {
  uploadedImage.value = '';
  results.value = [];
};

const startRecognition = () => {
  isProcessing.value = true;
  progress.value = 0;
  const interval = setInterval(() => {
    progress.value += 10;
    if (progress.value >= 100) {
      clearInterval(interval);
      setTimeout(() => {
        isProcessing.value = false;
        // 返回三个相似的专业零件，相似度分别为 92%、80%、63%
        results.value = [
          {
            partId: 'd9ef5b08-f5a2-442a-a64a-9ac93e4eb112',
            partName: '前照灯标准型',
            partNumber: '前-4694-0',
            thumbnail: '/drawings/155 .jpg',
            confidence: 0.92,
            matchedFeatures: ['外形轮廓', '安装孔位', '透镜结构'],
          },
          {
            partId: '4cbb4ae2-a34c-4d79-97e1-866cfa148c04',
            partName: '前照灯增强型',
            partNumber: '前-4612-1',
            thumbnail: '/drawings/156 .jpg',
            confidence: 0.80,
            matchedFeatures: ['外形轮廓', '尺寸规格'],
          },
          {
            partId: '55788824-ce77-42a7-88b4-9c635f587ac8',
            partName: '前照灯高性能型',
            partNumber: '前-9525-2',
            thumbnail: '/drawings/157 .jpg',
            confidence: 0.63,
            matchedFeatures: ['外形轮廓'],
          },
        ];
      }, 500);
    }
  }, 200);
};

const selectResult = (result: RecognitionResult) => {
  emit('selectResult', result);
  handleClose();
};

const getConfidenceClass = (confidence: number) => {
  if (confidence >= 0.85) return 'confidence-high';
  if (confidence >= 0.70) return 'confidence-medium';
  return 'confidence-low';
};

const handleClose = () => {
  emit('close');
  setTimeout(() => {
    resetUpload();
    isProcessing.value = false;
    progress.value = 0;
  }, 300);
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-container {
  background: white;
  border-radius: 1rem;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
}

.header-icon {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-icon svg {
  width: 24px;
  height: 24px;
}

.header-content {
  flex: 1;
}

.header-content h2 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.header-subtitle {
  font-size: 0.875rem;
  opacity: 0.9;
}

.close-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  transition: all 0.2s;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.close-btn svg {
  width: 20px;
  height: 20px;
}

.modal-body {
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
}

.upload-area {
  border: 2px dashed #d1d5db;
  border-radius: 0.75rem;
  padding: 3rem;
  text-align: center;
  transition: all 0.2s;
}

.upload-area:hover {
  border-color: #3b82f6;
  background: #f9fafb;
}

.upload-icon {
  width: 64px;
  height: 64px;
  color: #9ca3af;
  margin: 0 auto 1rem;
}

.upload-area h3 {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.file-input {
  display: none;
}

.image-preview {
  position: relative;
  border-radius: 0.75rem;
  overflow: hidden;
}

.image-preview img {
  width: 100%;
  height: auto;
  display: block;
}

.reupload-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  padding: 0.5rem 1rem;
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.processing-state {
  text-align: center;
  padding: 3rem 0;
}

.processing-spinner {
  width: 64px;
  height: 64px;
  border: 4px solid #e5e7eb;
  border-top-color: #3b82f6;
  border-radius: 50%;
  margin: 0 auto 1.5rem;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #e5e7eb;
  border-radius: 0.25rem;
  overflow: hidden;
  margin-top: 1rem;
}

.progress-fill {
  height: 100%;
  background: #3b82f6;
  transition: width 0.3s;
}

.results-container h3 {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.results-hint {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 1rem;
}

.result-card {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.75rem;
  margin-bottom: 0.75rem;
  transition: all 0.2s;
  position: relative;
}

.result-card:hover {
  border-color: #3b82f6;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
  transform: translateY(-2px);
}

.result-rank {
  position: absolute;
  top: -8px;
  left: -8px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.875rem;
  color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.rank-1 {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.rank-2 {
  background: linear-gradient(135deg, #94a3b8 0%, #64748b 100%);
}

.rank-3 {
  background: linear-gradient(135deg, #cd7f32 0%, #a0522d 100%);
}

.result-card img {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
  flex-shrink: 0;
}

.result-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.result-info h4 {
  font-weight: 600;
  font-size: 1rem;
  color: #111827;
}

.part-number {
  font-size: 0.875rem;
  color: #6b7280;
  font-family: monospace;
}

.confidence-bar {
  margin-top: 0.25rem;
}

.confidence-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.25rem;
  font-size: 0.75rem;
}

.confidence-label span:first-child {
  color: #6b7280;
  font-weight: 500;
}

.confidence-value {
  font-weight: 700;
  font-size: 0.875rem;
}

.confidence-value.confidence-high {
  color: #10b981;
}

.confidence-value.confidence-medium {
  color: #f59e0b;
}

.confidence-value.confidence-low {
  color: #ef4444;
}

.confidence-progress {
  height: 6px;
  background: #e5e7eb;
  border-radius: 3px;
  overflow: hidden;
}

.confidence-fill {
  height: 100%;
  transition: width 0.5s ease;
  border-radius: 3px;
}

.confidence-fill.confidence-high {
  background: linear-gradient(90deg, #10b981 0%, #059669 100%);
}

.confidence-fill.confidence-medium {
  background: linear-gradient(90deg, #f59e0b 0%, #d97706 100%);
}

.confidence-fill.confidence-low {
  background: linear-gradient(90deg, #ef4444 0%, #dc2626 100%);
}

.matched-features {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
}

.feature-tag {
  padding: 0.25rem 0.5rem;
  background: #eff6ff;
  color: #3b82f6;
  font-size: 0.75rem;
  border-radius: 0.25rem;
  font-weight: 500;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.cancel-btn,
.submit-btn {
  padding: 0.5rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 500;
  transition: all 0.2s;
}

.cancel-btn {
  background: white;
  color: #374151;
  border: 1px solid #d1d5db;
}

.cancel-btn:hover {
  background: #f9fafb;
}

.submit-btn {
  background: #3b82f6;
  color: white;
}

.submit-btn:hover {
  background: #2563eb;
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
