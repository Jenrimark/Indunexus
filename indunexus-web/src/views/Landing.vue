<template>
  <div class="landing-page">
    <Navbar @open-a-i-modal="showAIModal = true" />

    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-container">
        <div class="hero-content">
          <h1 class="hero-title">
            基于 AI 视觉与知识图谱的<br />
            零部件智能识别系统
          </h1>
          <p class="hero-description">
            智鉴车件为工业采购提供智能化解决方案，通过 AI 图像识别和知识图谱技术，
            帮助企业快速找到所需零部件，提升采购效率，降低运营成本。
          </p>
          <div class="hero-actions">
            <button class="btn-primary cursor-pointer" @click="handleStartShopping">
              开始采购
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
            <button class="btn-secondary cursor-pointer" @click="scrollToFeatures">
              了解更多
            </button>
          </div>

          <!-- Trust Badges -->
          <div class="trust-badges">
            <div class="badge-item">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
              <span>ISO 27001 认证</span>
            </div>
            <div class="badge-item">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
              <span>100+ 企业用户</span>
            </div>
            <div class="badge-item">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
              <span>93.4% 识别准确率</span>
            </div>
          </div>
        </div>

        <div class="hero-visual">
          <div class="visual-card">
            <img src="/logo-192x192.png" alt="智鉴车件" class="hero-logo" />
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section id="features" class="features-section">
      <div class="section-container">
        <div class="section-header">
          <h2>核心功能</h2>
          <p>为工业采购提供全方位智能化解决方案</p>
        </div>

        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon ai">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
              </svg>
            </div>
            <h3>AI 智能识图</h3>
            <p>上传零部件图片，AI 自动识别型号、规格和品牌，快速找到匹配产品</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon knowledge">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
              </svg>
            </div>
            <h3>知识图谱</h3>
            <p>基于工业零部件知识图谱，提供精准的产品关联和替代方案推荐</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon search">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
              </svg>
            </div>
            <h3>智能搜索</h3>
            <p>支持型号、图号、条码多种搜索方式，快速定位所需零部件</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon supply">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
              </svg>
            </div>
            <h3>供应链管理</h3>
            <p>整合优质供应商资源，提供透明的价格和库存信息</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon order">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fill-rule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clip-rule="evenodd" />
              </svg>
            </div>
            <h3>订单追踪</h3>
            <p>实时查看订单状态，物流信息一目了然，采购过程透明可控</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon data">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
              </svg>
            </div>
            <h3>数据分析</h3>
            <p>采购数据可视化分析，帮助企业优化采购决策，降低成本</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Stats Section -->
    <section id="stats" class="stats-section">
      <div class="section-container">
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-value">100+</div>
            <div class="stat-label">企业用户</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">1万+</div>
            <div class="stat-label">零部件数据</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">93.4%</div>
            <div class="stat-label">识别准确率</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">50%</div>
            <div class="stat-label">采购效率提升</div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta-section">
      <div class="cta-container">
        <h2>立即开始智能采购</h2>
        <p>加入数千家企业，体验 AI 驱动的零部件采购新方式</p>
        <div class="cta-actions">
          <button class="btn-primary" @click="$router.push('/marketplace')">
            进入零件广场
          </button>
          <button class="btn-secondary" @click="$router.push('/login')">
            免费注册
          </button>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
      <div class="footer-container">
        <div class="footer-content">
          <div class="footer-brand">
            <div class="footer-logo">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
              <span>智鉴车件</span>
            </div>
            <p>基于 AI 视觉与知识图谱的零部件智能识别系统</p>
          </div>

          <div class="footer-links">
            <div class="link-group">
              <h4>产品</h4>
              <a href="#">零件广场</a>
              <a href="#">AI 识图</a>
              <a href="#">供应商平台</a>
            </div>
            <div class="link-group">
              <h4>支持</h4>
              <a href="#">帮助中心</a>
              <a href="#">API 文档</a>
              <a href="#">联系我们</a>
            </div>
            <div class="link-group">
              <h4>公司</h4>
              <a href="#">关于我们</a>
              <a href="#">加入我们</a>
              <a href="#">隐私政策</a>
            </div>
          </div>
        </div>

        <div class="footer-bottom">
          <p>&copy; 2026 智鉴车件 InduNexus. All rights reserved.</p>
        </div>
      </div>
    </footer>

    <!-- AI Recognition Modal -->
    <AIRecognitionModal
      :is-open="showAIModal"
      @close="showAIModal = false"
      @select-result="handleAIResult"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { usePartsStore } from '../stores/parts';
import { useUIStore } from '../stores/ui';
import type { RecognitionResult } from '../types';
import Navbar from '../components/Navbar.vue';
import AIRecognitionModal from '../components/AIRecognitionModal.vue';

const router = useRouter();
const authStore = useAuthStore();
const partsStore = usePartsStore();
const uiStore = useUIStore();

const showAIModal = ref(false);

const handleStartShopping = () => {
  // 如果已登录，跳转到零件广场
  if (authStore.isAuthenticated) {
    router.push('/marketplace');
  } else {
    // 未登录，跳转到登录页，并保存目标页面
    router.push({
      path: '/login',
      query: { redirect: '/marketplace' }
    });
  }
};

const scrollToFeatures = () => {
  const element = document.getElementById('features');
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' });
  }
};

const handleAIResult = (result: RecognitionResult) => {
  uiStore.showToast({
    type: 'success',
    message: `已选择: ${result.partName}`,
  });
  // 跳转到零件广场并查看该零部件
  router.push('/marketplace');
  partsStore.getPartById(result.partId);
};
</script>

<style scoped>
.landing-page {
  min-height: 100vh;
  background: var(--color-bg);
}

/* Hero Section */
.hero-section {
  padding-top: calc(var(--header-height) + var(--space-16));
  padding-bottom: var(--space-16);
  background: linear-gradient(180deg, #F0F9FF 0%, var(--color-bg) 100%);
}

.hero-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 var(--space-6);
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-12);
  align-items: center;
}

.hero-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 700;
  color: var(--color-primary);
  line-height: 1.2;
}

.hero-description {
  font-size: var(--text-xl);
  color: var(--color-secondary);
  line-height: 1.6;
}

.hero-actions {
  display: flex;
  gap: var(--space-4);
}

.btn-primary,
.btn-secondary {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-4) var(--space-8);
  border-radius: var(--radius-lg);
  font-size: var(--text-lg);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-base);
}

.btn-primary {
  background: var(--color-cta);
  color: white;
  border: none;
}

.btn-primary:hover {
  background: #025a8a;
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(3, 105, 161, 0.3);
}

.btn-primary svg {
  width: 20px;
  height: 20px;
}

.btn-secondary {
  background: white;
  color: var(--color-cta);
  border: 2px solid var(--color-cta);
}

.btn-secondary:hover {
  background: #F0F9FF;
}

.trust-badges {
  display: flex;
  gap: var(--space-6);
  padding-top: var(--space-6);
  border-top: 1px solid #E2E8F0;
}

.badge-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-sm);
  color: var(--color-secondary);
}

.badge-item svg {
  width: 20px;
  height: 20px;
  color: var(--color-cta);
}

.hero-visual {
  display: flex;
  justify-content: center;
  align-items: center;
}

.visual-card {
  width: 400px;
  height: 400px;
  background: white;
  border-radius: var(--radius-xl);
  box-shadow: 0 20px 60px rgba(15, 23, 42, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-8);
}

.hero-logo {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

/* Features Section */
.features-section {
  padding: var(--space-16) 0;
}

.section-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 var(--space-6);
}

.section-header {
  text-align: center;
  margin-bottom: var(--space-12);
}

.section-header h2 {
  font-size: var(--text-4xl);
  font-weight: 700;
  color: var(--color-primary);
  margin-bottom: var(--space-3);
}

.section-header p {
  font-size: var(--text-xl);
  color: var(--color-secondary);
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-8);
}

.feature-card {
  padding: var(--space-8);
  background: white;
  border-radius: var(--radius-xl);
  border: 1px solid #E2E8F0;
  transition: all var(--transition-base);
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(15, 23, 42, 0.1);
}

.feature-icon {
  width: 64px;
  height: 64px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--space-4);
}

.feature-icon svg {
  width: 32px;
  height: 32px;
  color: white;
}

.feature-icon.ai {
  background: var(--color-cta);
}

.feature-icon.knowledge {
  background: var(--color-secondary);
}

.feature-icon.search {
  background: var(--color-primary);
}

.feature-icon.supply {
  background: var(--color-cta);
}

.feature-icon.order {
  background: var(--color-secondary);
}

.feature-icon.data {
  background: var(--color-primary);
}

.feature-card h3 {
  font-size: var(--text-xl);
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: var(--space-3);
}

.feature-card p {
  font-size: var(--text-base);
  color: var(--color-secondary);
  line-height: 1.6;
}

/* Stats Section */
.stats-section {
  padding: var(--space-16) 0;
  background: var(--color-primary);
  color: white;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-8);
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: var(--space-2);
}

.stat-label {
  font-size: var(--text-lg);
  opacity: 0.9;
}

/* CTA Section */
.cta-section {
  padding: var(--space-16) 0;
}

.cta-container {
  max-width: 800px;
  margin: 0 auto;
  padding: var(--space-12);
  background: white;
  border-radius: var(--radius-xl);
  text-align: center;
  box-shadow: 0 12px 40px rgba(15, 23, 42, 0.1);
}

.cta-container h2 {
  font-size: var(--text-3xl);
  font-weight: 700;
  color: var(--color-primary);
  margin-bottom: var(--space-3);
}

.cta-container p {
  font-size: var(--text-xl);
  color: var(--color-secondary);
  margin-bottom: var(--space-8);
}

.cta-actions {
  display: flex;
  gap: var(--space-4);
  justify-content: center;
}

/* Footer */
.footer {
  background: var(--color-primary);
  color: white;
  padding: var(--space-12) 0 var(--space-6);
}

.footer-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 var(--space-6);
}

.footer-content {
  display: grid;
  grid-template-columns: 2fr 3fr;
  gap: var(--space-12);
  margin-bottom: var(--space-8);
  padding-bottom: var(--space-8);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.footer-logo {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-3);
}

.footer-logo svg {
  width: 32px;
  height: 32px;
}

.footer-logo span {
  font-size: var(--text-xl);
  font-weight: 700;
}

.footer-brand p {
  opacity: 0.8;
  line-height: 1.6;
}

.footer-links {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-8);
}

.link-group h4 {
  font-size: var(--text-lg);
  font-weight: 600;
  margin-bottom: var(--space-4);
}

.link-group a {
  display: block;
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  margin-bottom: var(--space-2);
  transition: color var(--transition-base);
}

.link-group a:hover {
  color: white;
}

.footer-bottom {
  text-align: center;
  opacity: 0.6;
}

/* Responsive */
@media (max-width: 1024px) {
  .hero-container {
    grid-template-columns: 1fr;
    text-align: center;
  }

  .hero-visual {
    display: none;
  }

  .hero-actions {
    justify-content: center;
  }

  .trust-badges {
    justify-content: center;
  }

  .features-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 2.5rem;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .footer-content {
    grid-template-columns: 1fr;
  }

  .footer-links {
    grid-template-columns: 1fr;
  }

  .cta-actions {
    flex-direction: column;
  }
}
</style>
