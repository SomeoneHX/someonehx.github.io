<template>
  <div class="about">
    <div class="container section">
      <h1 class="about__title">
        <VIcon icon="mdi:account-outline" width="22" class="about__title-icon" />
        关于
      </h1>

      <div class="about__intro">
        <div class="about__avatar">
          <img
            src="https://avatars.githubusercontent.com/u/118031213?v=4"
            alt="Someone.HX"
            class="about__avatar-img"
          />
        </div>
        <div class="about__intro-text">
          <h2 class="about__name">Someone.HX</h2>
          <p class="about__tagline">学生 / 开发者 / 开源爱好者</p>
        </div>
      </div>

      <div class="about__bio">
        <p>正在学习C++。</p>
      </div>

      <section class="about__section">
        <h3 class="about__section-title">技能</h3>
        <div class="about__tags">
          <span v-for="skill in skills" :key="skill" class="about__tag">{{ skill }}</span>
        </div>
      </section>

      <section class="about__section">
        <h3 class="about__section-title">经历</h3>
        <div class="about__timeline">
          <div v-for="(item, i) in experiences" :key="i" class="about__timeline-item">
            <div class="about__timeline-dot" />
            <div class="about__timeline-body">
              <time class="about__timeline-date">{{ item.date }}</time>
              <h4 class="about__timeline-title">{{ item.title }}</h4>
              <p v-if="item.description" class="about__timeline-desc">{{ item.description }}</p>
            </div>
          </div>
        </div>
      </section>

      <section class="about__section">
        <h3 class="about__section-title">联系</h3>
        <div class="about__links">
          <a
            v-for="link in links"
            :key="link.label"
            :href="link.url"
            target="_blank"
            rel="noopener noreferrer"
            class="about__link"
          >
            <VIcon :icon="link.icon" width="16" class="about__link-icon" />
            {{ link.label }}
          </a>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { profileLinks as links } from '@/data/profile'

const skills = [
  'C++', 'Python', 'Git', 'Linux', 'Windows', 'vibe'
]

const experiences = [
  {
    date: '2025',
    title: 'CSP-J',
    description: '获得CSP-J二等奖。',
  },
]
</script>

<style scoped>
.about__title {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  font-size: var(--text-2xl);
  font-weight: 700;
  margin-bottom: var(--space-2xl);
}

.about__title-icon {
  flex-shrink: 0;
  color: var(--color-accent);
}

.about__intro {
  display: flex;
  align-items: center;
  gap: var(--space-lg);
  margin-bottom: var(--space-2xl);
}

.about__avatar {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
}

.about__avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.about__name {
  font-size: var(--text-2xl);
  font-weight: 700;
  margin-bottom: var(--space-xs);
}

.about__tagline {
  font-size: var(--text-sm);
  color: var(--color-gray-500);
}

.about__bio {
  font-size: var(--text-base);
  line-height: 1.8;
  color: var(--color-gray-700);
  margin-bottom: var(--space-2xl);
}

.about__bio p {
  margin-bottom: var(--space-md);
}

.about__section {
  margin-bottom: var(--space-2xl);
}

.about__section-title {
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-gray-400);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: var(--space-lg);
}

.about__tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
}

.about__tag {
  padding: 4px 14px;
  font-size: var(--text-sm);
  border: 1px solid var(--color-gray-200);
  border-radius: 999px;
  color: var(--color-gray-700);
}

.about__timeline {
  position: relative;
  padding-left: var(--space-xl);
}

.about__timeline::before {
  content: '';
  position: absolute;
  left: 7px;
  top: 4px;
  bottom: 4px;
  width: 2px;
  background: var(--color-gray-200);
}

.about__timeline-item {
  position: relative;
  padding-bottom: var(--space-xl);
}

.about__timeline-item:last-child {
  padding-bottom: 0;
}

.about__timeline-dot {
  position: absolute;
  left: calc(-1 * var(--space-xl) + 3px);
  top: 6px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--color-accent);
  border: 2px solid var(--color-surface);
}

.about__timeline-date {
  display: block;
  font-size: var(--text-xs);
  color: var(--color-gray-400);
  margin-bottom: var(--space-xs);
  font-variant-numeric: tabular-nums;
}

.about__timeline-title {
  font-size: var(--text-base);
  font-weight: 600;
  margin-bottom: var(--space-xs);
}

.about__timeline-desc {
  font-size: var(--text-sm);
  color: var(--color-gray-500);
  line-height: 1.6;
}

.about__links {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-md);
}

.about__link {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  font-size: var(--text-sm);
  color: var(--color-gray-500);
  border-bottom: 1px solid transparent;
  transition: color var(--transition-fast), border-color var(--transition-fast);
}

.about__link:hover {
  color: var(--color-accent);
  border-color: var(--color-accent);
}

.about__link-icon {
  flex-shrink: 0;
}
</style>
