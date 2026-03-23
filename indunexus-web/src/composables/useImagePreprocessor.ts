// Feature: ai-analysis-page
// useImagePreprocessor composable — 图像预处理（格式校验、大小校验、尺寸压缩、亮度检测）

const ACCEPTED_FORMATS = ['image/jpeg', 'image/png', 'image/webp'] as const;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_DIMENSION = 2048;
const BRIGHTNESS_THRESHOLD = 30;

export interface PreprocessResult {
  valid: boolean;
  error?: string;
  warning?: string;
  originalSize: { width: number; height: number };
  processedSize: { width: number; height: number };
  processedDataUrl: string;
  brightnessScore: number; // 0-100
  fileSize: number;
  fileName: string;
}

// ─── 纯函数（供属性测试使用）────────────────────────────────────────────────

/**
 * 计算等比缩放后的尺寸。
 * 若 max(w, h) <= maxSize，直接返回原始尺寸。
 */
export function calculateResizeDimensions(
  w: number,
  h: number,
  maxSize: number
): { newWidth: number; newHeight: number } {
  const longest = Math.max(w, h);
  if (longest <= maxSize) {
    return { newWidth: w, newHeight: h };
  }
  const scale = maxSize / longest;
  return {
    newWidth: Math.round(w * scale),
    newHeight: Math.round(h * scale),
  };
}

/**
 * 校验文件格式是否被接受。
 */
export function validateFileFormat(file: File): { valid: boolean; error?: string } {
  if (!ACCEPTED_FORMATS.includes(file.type as (typeof ACCEPTED_FORMATS)[number])) {
    return {
      valid: false,
      error: '不支持的文件格式，请上传 JPG/PNG/WEBP 图片',
    };
  }
  return { valid: true };
}

// ─── Composable ──────────────────────────────────────────────────────────────

export function useImagePreprocessor() {
  /**
   * 将 File 加载为 HTMLImageElement。
   */
  function loadImage(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve(img);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('图片加载失败'));
      };
      img.src = url;
    });
  }

  /**
   * 使用 Canvas 绘制图片，返回 dataUrl 和像素数据。
   */
  function drawToCanvas(
    img: HTMLImageElement,
    width: number,
    height: number
  ): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, 0, 0, width, height);
    return { canvas, ctx };
  }

  /**
   * 计算平均亮度（灰度公式：0.299R + 0.587G + 0.114B），归一化至 0-100。
   * 采样步长为 4（每隔 4 个像素采样一次）以提升性能。
   */
  function calculateBrightness(ctx: CanvasRenderingContext2D, width: number, height: number): number {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    let totalBrightness = 0;
    let sampleCount = 0;
    const step = 4; // 每隔 step 个像素采样一次

    for (let i = 0; i < data.length; i += 4 * step) {
      const r = data[i] ?? 0;
      const g = data[i + 1] ?? 0;
      const b = data[i + 2] ?? 0;
      totalBrightness += 0.299 * r + 0.587 * g + 0.114 * b;
      sampleCount++;
    }

    if (sampleCount === 0) return 0;
    // 平均亮度范围 [0, 255]，归一化至 [0, 100]
    return (totalBrightness / sampleCount / 255) * 100;
  }

  /**
   * 主预处理函数。
   */
  async function preprocess(file: File): Promise<PreprocessResult> {
    // 1. 格式校验
    const formatCheck = validateFileFormat(file);
    if (!formatCheck.valid) {
      return {
        valid: false,
        error: formatCheck.error,
        originalSize: { width: 0, height: 0 },
        processedSize: { width: 0, height: 0 },
        processedDataUrl: '',
        brightnessScore: 0,
        fileSize: file.size,
        fileName: file.name,
      };
    }

    // 2. 大小校验
    if (file.size > MAX_FILE_SIZE) {
      return {
        valid: false,
        error: '文件大小超过 10MB 限制',
        originalSize: { width: 0, height: 0 },
        processedSize: { width: 0, height: 0 },
        processedDataUrl: '',
        brightnessScore: 0,
        fileSize: file.size,
        fileName: file.name,
      };
    }

    // 3. 加载图片
    let img: HTMLImageElement;
    try {
      img = await loadImage(file);
    } catch {
      // Canvas 处理失败时静默降级：返回原始文件的 dataUrl
      const fallbackUrl = await fileToDataUrl(file);
      return {
        valid: true,
        originalSize: { width: 0, height: 0 },
        processedSize: { width: 0, height: 0 },
        processedDataUrl: fallbackUrl,
        brightnessScore: 50,
        fileSize: file.size,
        fileName: file.name,
      };
    }

    const originalSize = { width: img.naturalWidth, height: img.naturalHeight };

    // 4. 尺寸压缩
    const { newWidth, newHeight } = calculateResizeDimensions(
      originalSize.width,
      originalSize.height,
      MAX_DIMENSION
    );
    const processedSize = { width: newWidth, height: newHeight };

    // 5. 绘制到 Canvas
    let processedDataUrl: string;
    let brightnessScore: number;
    try {
      const { canvas, ctx } = drawToCanvas(img, newWidth, newHeight);
      brightnessScore = calculateBrightness(ctx, newWidth, newHeight);
      processedDataUrl = canvas.toDataURL('image/jpeg', 0.92);
    } catch {
      // Canvas 处理失败时静默降级
      processedDataUrl = await fileToDataUrl(file);
      brightnessScore = 50;
    }

    // 6. 亮度警告
    const warning =
      brightnessScore < BRIGHTNESS_THRESHOLD
        ? '图片过暗，识别精度可能受影响，建议补光后重新拍摄'
        : undefined;

    return {
      valid: true,
      warning,
      originalSize,
      processedSize,
      processedDataUrl,
      brightnessScore,
      fileSize: file.size,
      fileName: file.name,
    };
  }

  return { preprocess };
}

// ─── 工具函数 ─────────────────────────────────────────────────────────────────

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
