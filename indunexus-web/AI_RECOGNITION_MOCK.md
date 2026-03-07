# AI 识别功能 Mock 数据说明

## 功能概述

AI 识别功能现在使用固定的 Mock 数据，无论上传什么图片，都会返回三个相似的前照灯零件，相似度分别为 92%、80%、63%。

## Mock 数据

### 识别结果（固定返回）

1. **前照灯标准型** - 相似度 92%
   - 型号: 前-4694-0
   - 品牌: 麦格纳
   - 匹配特征: 外形轮廓、安装孔位、透镜结构
   - 图片: /drawings/155 .jpg

2. **前照灯增强型** - 相似度 80%
   - 型号: 前-4612-1
   - 品牌: 斯坦雷
   - 匹配特征: 外形轮廓、尺寸规格
   - 图片: /drawings/156 .jpg

3. **前照灯高性能型** - 相似度 63%
   - 型号: 前-9525-2
   - 品牌: 小糸
   - 匹配特征: 外形轮廓
   - 图片: /drawings/157 .jpg

## 视觉设计

### 相似度颜色编码

- **高相似度 (≥85%)**: 绿色 (#10b981)
- **中等相似度 (70%-84%)**: 橙色 (#f59e0b)
- **低相似度 (<70%)**: 红色 (#ef4444)

### 排名徽章

- **第1名**: 金色渐变
- **第2名**: 银色渐变
- **第3名**: 铜色渐变

### 卡片特性

- 悬停效果: 蓝色边框 + 阴影 + 轻微上移
- 相似度进度条: 动画填充效果
- 匹配特征标签: 蓝色背景标签

## 交互流程

1. 用户点击 "AI 识别" 按钮
2. 上传任意图片
3. 点击 "开始识别"
4. 显示识别进度条（模拟 AI 处理）
5. 显示三个固定的识别结果
6. 用户可以点击任一结果查看详情

## 技术实现

### 识别逻辑
```typescript
const startRecognition = () => {
  isProcessing.value = true;
  progress.value = 0;
  
  // 模拟识别进度
  const interval = setInterval(() => {
    progress.value += 10;
    if (progress.value >= 100) {
      clearInterval(interval);
      setTimeout(() => {
        isProcessing.value = false;
        // 返回固定的三个结果
        results.value = [
          { confidence: 0.92, ... },
          { confidence: 0.80, ... },
          { confidence: 0.63, ... },
        ];
      }, 500);
    }
  }, 200);
};
```

### 相似度分类
```typescript
const getConfidenceClass = (confidence: number) => {
  if (confidence >= 0.85) return 'confidence-high';
  if (confidence >= 0.70) return 'confidence-medium';
  return 'confidence-low';
};
```

## 为什么选择这些数据？

1. **专业性**: 前照灯是汽车零部件中的常见且专业的部件
2. **相似性**: 三个型号都是前照灯，名称相似但有区别（标准型、增强型、高性能型）
3. **真实性**: 相似度梯度合理（92%、80%、63%），符合实际 AI 识别场景
4. **可辨别性**: 虽然相似但有明显区别，体现 AI 识别的准确性

## 未来扩展

如果需要接入真实的 AI 识别 API，只需修改 `startRecognition` 函数：

```typescript
const startRecognition = async () => {
  isProcessing.value = true;
  
  try {
    // 调用真实 API
    const response = await fetch('/api/ai/recognize', {
      method: 'POST',
      body: formData,
    });
    
    const data = await response.json();
    results.value = data.results;
  } catch (error) {
    console.error('Recognition failed:', error);
  } finally {
    isProcessing.value = false;
  }
};
```

## 用户体验优化

1. **视觉反馈**: 清晰的排名徽章和相似度进度条
2. **信息层次**: 名称、型号、相似度、匹配特征分层展示
3. **交互提示**: 悬停效果明显，点击区域大
4. **颜色编码**: 相似度用颜色直观表示
5. **动画效果**: 进度条和卡片都有流畅的动画

## 测试建议

1. 上传不同类型的图片（零件图、照片、截图等）
2. 验证识别结果始终一致
3. 测试点击结果卡片的跳转功能
4. 检查移动端的显示效果
5. 验证关闭和重新打开的状态重置
