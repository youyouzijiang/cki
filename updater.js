// updater.js
'use strict';

const UpdateModule = (() => {
  // 🌟 每次更新时，只需要修改这个版本号和下面的更新内容即可！
  const CURRENT_VERSION = 'v1.7.0'; 
  const VERSION_KEY = 'chillos-last-version';

  const CHANGELOG = [
  "✦ 欢迎来到 Chill Mono OS。在开始之前，花一分钟读完这份指南——会让体验好很多(可上下滚动观看)。",
  "✦ 【桌面与导航】桌面上下滑动属于正常交互；点击 Dock 栏的 🏠 可隐藏底部栏，点击空白处可以唤回；右上角随时切换昼夜模式。",
  "✦ 【Dock 栏说明】🔎 是 Echoes 论坛；💬 是聊天频道；最右边的 👤 是角色档案页。",
  "✦ 【收起侧边栏】在用户面具页顶部点击🔒，或在动态点击左上角菜单，可以展开收起侧边栏。",
  "✦ 【世界书快速注入】世界书（World Info）模块支持直接导入 `.txt` 与 `.docx` 两种格式的文件，方便一键录入世界观与背景设定。",
  "✦ 【快速回到对话】和角色聊过天之后，直接点击桌面的「Updates 通知卡片」，可以一步跳回聊天界面。",
  "✦ 【模型切换全局同步】在聊天界面的「API Node」卡片里切换大模型，会自动同步到全局，不需要再去设置页单独改。",
  "✦ 【让角色活起来】在「设置 → Agent 引擎」里可以开启自动发动态、写日记等功能，让角色在你不在线时也能自发更新生活。",
  "✦ 【生图完全免费】内置生图不收费。在「设置 → 音画设置 → 生图设置」选择免费生图，再在聊天设置里开启配图，即可收到角色发来的图片。",
  "✦ 【跨语言聊天】聊天气泡已接入双模型翻译兜底。如果觉得翻译腔调不对，可以关闭双语输出，直接在角色人设或世界书里规定 ta 的翻译语气和格式。",
  "✦ 【剧情存档：快照】剧情模式右下角 + → 快照，可随时刻录当前进度并命名，支持多条时间线并行存取。",
"✦ 【剧情记忆：封存】封存会让 AI 把新增剧情提炼压缩进潜意识层注入线上，剧情够长时也会自动触发(打开自动即可)。",
"✦ 【剧情归档：杀青】杀青适合一个故事弧结束时使用——AI 会把本阶段剧情以叙事体增量写入世界书，永久留存。",
"✦ 【重 Roll】对 AI 最新一条回复不满意时，点击卡片底部的 ↻ 可以重新生成一版完全不同的走向。每次重 roll 都会保留旧版本，卡片底部会出现 ‹ 1/2 › 翻页器，左右切换对比所有版本，选最满意的留下即可。"
];


  // 动态注入弹窗的 CSS 样式
  function injectCSS() {
    if (document.getElementById('updater-css')) return;
    const style = document.createElement('style');
    style.id = 'updater-css';
    style.textContent = `
      .upd-overlay {
        position: absolute; inset: 0; z-index: 9999;
        background: rgba(0, 0, 0, 0.6); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
        display: flex; align-items: center; justify-content: center;
        opacity: 0; pointer-events: none; transition: opacity 0.4s ease;
      }
      .upd-overlay.active { opacity: 1; pointer-events: auto; }
      .upd-card {
        background: var(--bg-card, #fff); border: 1px solid var(--border-line, #e0e0e0);
        border-radius: 24px; padding: 32px 24px; width: 85%; max-width: 320px;
        box-shadow: 0 40px 80px rgba(0,0,0,0.15); position: relative; overflow: hidden;
        transform: translateY(20px) scale(0.95); transition: transform 0.5s cubic-bezier(0.19, 1, 0.22, 1);
      }
      .upd-overlay.active .upd-card { transform: translateY(0) scale(1); }
      .upd-watermark {
        position: absolute; top: -30px; right: -20px; font-family: 'Playfair Display', serif;
        font-size: 160px; font-style: italic; font-weight: 300; color: var(--text-main, #121212);
        opacity: 0.03; line-height: 1; pointer-events: none; z-index: 0;
      }
      .upd-header { margin-bottom: 24px; position: relative; z-index: 1; }
      .upd-title { font-family: 'Playfair Display', serif; font-size: 2rem; font-weight: 600; font-style: italic; color: var(--text-main, #121212); line-height: 1; }
      .upd-version { font-family: 'Space Mono', monospace; font-size: 0.65rem; color: var(--text-sub, #888); letter-spacing: 2px; text-transform: uppercase; margin-top: 8px; font-weight: 700; }
      .upd-list { position: relative; z-index: 1; max-height: 40vh; overflow-y: auto; margin-bottom: 32px; padding-right: 4px; }
      .upd-list::-webkit-scrollbar { display: none; }
      .upd-item { font-family: 'Noto Sans SC', sans-serif; font-size: 0.85rem; color: var(--text-main, #333); line-height: 1.6; margin-bottom: 12px; }
      .upd-btn {
        width: 100%; padding: 14px 0; background: var(--text-main, #121212); color: var(--bg-device, #fff);
        border: none; border-radius: 100px; font-family: 'Space Mono', monospace; font-size: 0.8rem;
        font-weight: 600; letter-spacing: 2px; text-transform: uppercase; cursor: pointer;
        position: relative; z-index: 1; transition: transform 0.2s; box-shadow: 0 10px 20px rgba(0,0,0,0.1);
      }
      .upd-btn:active { transform: scale(0.96); }
    `;
    document.head.appendChild(style);
  }

  // 动态创建并插入 DOM
  function createModal() {
    if (document.getElementById('updater-overlay')) return;
    const overlay = document.createElement('div');
    overlay.id = 'updater-overlay';
    overlay.className = 'upd-overlay';
    
    let listHtml = CHANGELOG.map(item => `<div class="upd-item">${item}</div>`).join('');

    overlay.innerHTML = `
      <div class="upd-card">
        <div class="upd-watermark">U</div>
        <div class="upd-header">
          <div class="upd-title">System Update</div>
          <div class="upd-version">VERSION // ${CURRENT_VERSION}</div>
        </div>
        <div class="upd-list">${listHtml}</div>
        <button class="upd-btn" onclick="UpdateModule.closeAndSave()">Got it</button>
      </div>
    `;
    // 挂载到 body 或者 device 容器内
    const device = document.querySelector('.device') || document.body;
    device.appendChild(overlay);
  }

  function checkUpdate() {
    // 使用 localStorage 进行简单的本地版本校验
    const savedVersion = localStorage.getItem(VERSION_KEY);
    
    // 如果没有记录（新用户）或者版本号变了（老用户更新了），则弹出
    if (savedVersion !== CURRENT_VERSION) {
      injectCSS();
      createModal();
      // 稍微延迟一下，配合系统的进入动画，显得更丝滑
      setTimeout(() => {
        const overlay = document.getElementById('updater-overlay');
        if (overlay) overlay.classList.add('active');
      }, 800);
    }
  }

  function closeAndSave() {
    const overlay = document.getElementById('updater-overlay');
    if (overlay) {
      overlay.classList.remove('active');
      // 记录最新版本号，下次就不弹了
      localStorage.setItem(VERSION_KEY, CURRENT_VERSION);
      // 等待动画结束后移除 DOM
      setTimeout(() => overlay.remove(), 400);
    }
  }

  return { checkUpdate, closeAndSave };
})();