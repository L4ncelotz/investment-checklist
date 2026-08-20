/**
 * ============================================================================
 * PRE-INVESTMENT CHECKLIST — JAVASCRIPT CONTROLLER
 * Ultra-Responsive UI, Real-time Score Ring, Multi-Asset Profiles, Export & UX
 * ============================================================================
 */

(function () {
  'use strict';

  // Storage Keys
  const STORAGE_KEY_PREFIX = 'investor_checklist_';
  const PROFILES_LIST_KEY = 'investor_checklist_profiles';

  const ACTIVE_PROFILE_KEY = 'investor_checklist_active_profile';

  // App State
  let currentProfileId = 'default';
  let activeAssetType = 'all'; // 'all' | 'stock' | 'etf'
  let isUpdatingUI = false;

  // DOM Cache
  const elements = {
    // Theme
    html: document.documentElement,

    
    // Asset Meta
    assetTicker: document.getElementById('assetTicker'),
    targetAllocation: document.getElementById('targetAllocation'),
    typeTabs: document.querySelectorAll('.type-tab-btn'),
    presetChips: document.querySelectorAll('.chip-btn'),
    footerTickerBadge: document.getElementById('footerTickerBadge'),
    
    // Scores & Progress
    scorePercent: document.getElementById('scorePercent'),
    scoreProgressRing: document.getElementById('scoreProgressRing'),
    scoreLinearBar: document.getElementById('scoreLinearBar'),
    scoreCountPassed: document.getElementById('scoreCountPassed'),
    scoreStatusBadge: document.getElementById('scoreStatusBadge'),
    scoreStatusText: document.getElementById('scoreStatusText'),
    footerPercent: document.getElementById('footerPercent'),
    footerCount: document.getElementById('footerCount'),
    decisionStatusMessage: document.getElementById('decisionStatusMessage'),
    
    // Profiles
    btnProfiles: document.getElementById('btnProfiles'),
    profilesMenu: document.getElementById('profilesMenu'),
    savedProfilesList: document.getElementById('savedProfilesList'),
    activeProfileLabel: document.getElementById('activeProfileLabel'),
    btnNewChecklist: document.getElementById('btnNewChecklist'),
    
    // Action Tools
    btnExportMarkdown: document.getElementById('btnExportMarkdown'),
    btnPrint: document.getElementById('btnPrint'),
    btnReset: document.getElementById('btnReset'),
    btnCopySummary: document.getElementById('btnCopySummary'),
    btnQuickTop: document.getElementById('btnQuickTop'),
    btnCheckAllList: document.querySelectorAll('.btn-check-all'),
    stripPills: document.querySelectorAll('.strip-pill'),
    
    // Toast
    toast: document.getElementById('toast'),
    toastMessage: document.getElementById('toastMessage'),

    // Task Elements
    taskCheckboxes: document.querySelectorAll('.task-checkbox'),
    thesisInputs: document.querySelectorAll('.thesis-input')
  };

  // =========================================================================
  // 1. APP INITIALIZATION
  // =========================================================================

  function init() {

    initProfiles();
    loadProfile(currentProfileId);
    bindEvents();
    initScrollSpy();
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }


  // =========================================================================
  // 3. PROFILE / MULTI-TICKER CONTROLLER
  // =========================================================================

  function getProfiles() {
    try {
      const data = localStorage.getItem(PROFILES_LIST_KEY);
      return data ? JSON.parse(data) : [{ id: 'default', name: 'Checklist หลัก', ticker: '' }];
    } catch (e) {
      return [{ id: 'default', name: 'Checklist หลัก', ticker: '' }];
    }
  }

  function saveProfilesList(profiles) {
    localStorage.setItem(PROFILES_LIST_KEY, JSON.stringify(profiles));
  }

  function initProfiles() {
    const lastActive = localStorage.getItem(ACTIVE_PROFILE_KEY);
    const profiles = getProfiles();
    if (lastActive && profiles.some(p => p.id === lastActive)) {
      currentProfileId = lastActive;
    } else {
      currentProfileId = profiles[0].id;
    }
    renderProfilesMenu();
  }

  function renderProfilesMenu() {
    const profiles = getProfiles();
    elements.savedProfilesList.innerHTML = '';
    
    profiles.forEach(profile => {
      const li = document.createElement('li');
      li.className = `profile-item ${profile.id === currentProfileId ? 'active' : ''}`;
      
      const titleSpan = document.createElement('span');
      titleSpan.textContent = profile.ticker ? `${profile.ticker} (${profile.name})` : profile.name;

      li.appendChild(titleSpan);

      li.addEventListener('click', (e) => {
        if (!e.target.closest('.profile-delete-btn')) {
          switchProfile(profile.id);
          elements.profilesMenu.classList.add('hidden');
        }
      });

      if (profiles.length > 1 && profile.id !== 'default') {
        const delBtn = document.createElement('button');
        delBtn.className = 'profile-delete-btn';
        delBtn.innerHTML = '&times;';
        delBtn.title = 'ลบ Checklist นี้';
        delBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          deleteProfile(profile.id);
        });
        li.appendChild(delBtn);
      }

      elements.savedProfilesList.appendChild(li);
    });

    const activeProfile = profiles.find(p => p.id === currentProfileId) || profiles[0];
    elements.activeProfileLabel.textContent = activeProfile.ticker || activeProfile.name;
  }

  function switchProfile(profileId) {
    currentProfileId = profileId;
    localStorage.setItem(ACTIVE_PROFILE_KEY, profileId);
    loadProfile(profileId);
    renderProfilesMenu();
    showToast(`สลับไปยัง: ${elements.activeProfileLabel.textContent}`);
  }

  function createNewProfile() {
    const ticker = prompt('กรุณาระบุชื่อ Ticker หรือชื่อ Checklist (เช่น NVDA, VOO, CPALL):') || '';
    const newId = 'profile_' + Date.now();
    const profiles = getProfiles();
    const newProfile = {
      id: newId,
      name: ticker ? `Checklist ${ticker.toUpperCase()}` : `Checklist ใหม่ ${profiles.length + 1}`,
      ticker: ticker.toUpperCase()
    };
    profiles.push(newProfile);
    saveProfilesList(profiles);
    
    switchProfile(newId);
    if (ticker) {
      elements.assetTicker.value = ticker.toUpperCase();
      saveCurrentState();
    }
    elements.profilesMenu.classList.add('hidden');
  }

  function deleteProfile(profileId) {
    if (!confirm('ต้องการลบ Checklist นี้หรือไม่? ข้อมูลจะไม่สามารถกู้คืนได้')) {
      return;
    }
    let profiles = getProfiles();
    profiles = profiles.filter(p => p.id !== profileId);
    saveProfilesList(profiles);
    localStorage.removeItem(STORAGE_KEY_PREFIX + profileId);
    switchProfile(profiles[0].id);
  }

  // =========================================================================
  // 4. DATA PERSISTENCE & AUTOSAVE
  // =========================================================================

  function saveCurrentState() {
    if (isUpdatingUI) return;

    const data = {
      ticker: elements.assetTicker.value.trim(),
      assetType: activeAssetType,
      targetAllocation: elements.targetAllocation.value.trim(),
      checkboxes: {},
      thesisInputs: {},
      updatedAt: new Date().toISOString()
    };

    elements.taskCheckboxes.forEach(cb => {
      data.checkboxes[cb.dataset.id] = cb.checked;
    });

    elements.thesisInputs.forEach(input => {
      data.thesisInputs[input.id] = input.value;
    });

    localStorage.setItem(STORAGE_KEY_PREFIX + currentProfileId, JSON.stringify(data));

    // Sync profile metadata
    const profiles = getProfiles();
    const current = profiles.find(p => p.id === currentProfileId);
    if (current && current.ticker !== data.ticker) {
      current.ticker = data.ticker;
      if (data.ticker) {
        current.name = `Checklist ${data.ticker}`;
      }
      saveProfilesList(profiles);
      renderProfilesMenu();
    }

    updateUI();
  }

  function loadProfile(profileId) {
    isUpdatingUI = true;
    const raw = localStorage.getItem(STORAGE_KEY_PREFIX + profileId);
    let data = null;

    if (raw) {
      try {
        data = JSON.parse(raw);
      } catch (e) {
        console.error('Error parsing checklist data', e);
      }
    }

    elements.assetTicker.value = data?.ticker || '';
    elements.targetAllocation.value = data?.targetAllocation || '';
    setAssetTypeFilter(data?.assetType || 'all', false);

    elements.taskCheckboxes.forEach(cb => {
      const id = cb.dataset.id;
      cb.checked = data?.checkboxes?.[id] === true;
    });

    elements.thesisInputs.forEach(input => {
      input.value = data?.thesisInputs?.[input.id] || '';
    });

    isUpdatingUI = false;
    updateUI();
  }

  function resetChecklist() {
    if (!confirm('คุณแน่ใจว่าต้องการล้างข้อมูลทั้งหมดใน Checklist นี้หรือไม่?')) return;
    
    isUpdatingUI = true;
    elements.taskCheckboxes.forEach(cb => cb.checked = false);
    elements.thesisInputs.forEach(input => input.value = '');
    elements.targetAllocation.value = '';
    isUpdatingUI = false;

    saveCurrentState();
    showToast('ล้างข้อมูลเช็กลิสต์เรียบร้อยแล้ว');
  }

  // =========================================================================
  // 5. ASSET TYPE FILTERING ('all' | 'stock' | 'etf')
  // =========================================================================

  function setAssetTypeFilter(type, shouldSave = true) {
    activeAssetType = type;
    
    elements.typeTabs.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.type === type);
    });

    const filterItems = document.querySelectorAll('[data-filter-item]');
    filterItems.forEach(el => {
      const filterType = el.dataset.filterItem;
      if (type === 'all' || filterType === type) {
        el.style.display = '';
      } else {
        el.style.display = 'none';
      }
    });

    const navPillStock = document.querySelector('.strip-pill[data-filter="stock"]');
    if (navPillStock) {
      navPillStock.style.display = (type === 'etf') ? 'none' : '';
    }

    if (shouldSave) {
      saveCurrentState();
    } else {
      updateUI();
    }
  }

  // =========================================================================
  // 6. SCORE CALCULATION & REAL-TIME UI
  // =========================================================================

  function updateUI() {
    const ticker = elements.assetTicker.value.trim().toUpperCase() || 'ไม่ได้ระบุ Ticker';
    elements.footerTickerBadge.textContent = ticker;

    // Visible checkboxes only
    const visibleCheckboxes = Array.from(elements.taskCheckboxes).filter(cb => {
      const card = cb.closest('.section-card');
      const subContainer = cb.closest('[data-filter-item]');
      if (subContainer && subContainer.style.display === 'none') return false;
      if (card && card.style.display === 'none') return false;
      return true;
    });

    const totalVisible = visibleCheckboxes.length;
    const checkedVisible = visibleCheckboxes.filter(cb => cb.checked).length;
    const percent = totalVisible > 0 ? Math.round((checkedVisible / totalVisible) * 100) : 0;

    // Update Percentage & Counts
    elements.scorePercent.textContent = `${percent}%`;
    elements.scoreCountPassed.textContent = `${checkedVisible} / ${totalVisible}`;
    elements.footerPercent.textContent = `${percent}%`;
    elements.footerCount.textContent = `${checkedVisible} / ${totalVisible}`;

    // Linear Progress Bar Fill
    if (elements.scoreLinearBar) {
      elements.scoreLinearBar.style.width = `${percent}%`;
    }

    // Radial SVG Progress Ring (radius: 76, circumference: 2 * Math.PI * 76 ≈ 477.522)
    const circumference = 2 * Math.PI * 76;
    const offset = circumference - (percent / 100) * circumference;
    elements.scoreProgressRing.style.strokeDashoffset = offset;

    // Critical Deal-Breakers calculation
    const visibleCritical = visibleCheckboxes.filter(cb => cb.dataset.critical === 'true');
    const totalCritical = visibleCritical.length;
    const checkedCritical = visibleCritical.filter(cb => cb.checked).length;
    const uncheckedCritical = totalCritical - checkedCritical;

    // Update Critical Alert widget in Gauge
    const criticalRiskEl = document.getElementById('criticalRiskSummary');
    const criticalRiskText = document.getElementById('criticalRiskText');
    if (criticalRiskEl && criticalRiskText) {
      if (uncheckedCritical > 0) {
        criticalRiskEl.classList.remove('hidden');
        criticalRiskText.textContent = `ติดข้อวิกฤต ${uncheckedCritical} ข้อ`;
      } else {
        criticalRiskEl.classList.add('hidden');
      }
    }

    // Dynamic Color Shift
    if (uncheckedCritical > 0) {
      elements.scoreProgressRing.style.stroke = 'var(--rose-500)';
    } else if (percent === 100) {
      elements.scoreProgressRing.style.stroke = 'var(--emerald-400)';
    } else if (percent >= 70) {
      elements.scoreProgressRing.style.stroke = 'var(--emerald-500)';
    } else if (percent >= 40) {
      elements.scoreProgressRing.style.stroke = 'var(--amber-500)';
    } else {
      elements.scoreProgressRing.style.stroke = 'var(--rose-500)';
    }

    // Verdict Badge & Decision Message
    if (uncheckedCritical > 0) {
      elements.scoreStatusBadge.className = 'verdict-banner danger';
      elements.scoreStatusBadge.innerHTML = `<i data-lucide="alert-octagon" class="icon-xs"></i><span>🚨 ติดข้อวิกฤต ${uncheckedCritical} ข้อ (ห้ามซื้อ)</span>`;
      elements.decisionStatusMessage.innerHTML = `<i data-lucide="alert-octagon" class="icon-sm text-rose"></i><span class="text-rose"><strong>ยังติดข้อวิกฤต (Deal-Breaker) ${uncheckedCritical} ข้อ</strong> — ต้องตอบข้อเหล่านี้ให้ผ่านก่อนกดซื้อ</span>`;
    } else if (percent === 100) {
      elements.scoreStatusBadge.className = 'verdict-banner passed';
      elements.scoreStatusBadge.innerHTML = '<i data-lucide="check-check" class="icon-xs"></i><span>พร้อมลงทุนตามแผน 100%</span>';
      elements.decisionStatusMessage.innerHTML = '<i data-lucide="check-circle" class="icon-sm text-emerald"></i><span class="text-emerald"><strong>ผ่านการประเมิน 100%</strong> — ปราศจาก Red Flag และมีแผนรัดกุม</span>';
    } else if (percent >= 80) {
      elements.scoreStatusBadge.className = 'verdict-banner passed';
      elements.scoreStatusBadge.innerHTML = '<i data-lucide="check" class="icon-xs"></i><span>ความพร้อมสูงมาก</span>';
      elements.decisionStatusMessage.innerHTML = '<i data-lucide="info" class="icon-sm text-cyan"></i><span>ความพร้อมสูงเกือบครบถ้วน ผ่านข้อสำคัญหมดแล้ว เหลือเพียงบางจุดปลีกย่อย</span>';
    } else if (percent >= 50) {
      elements.scoreStatusBadge.className = 'verdict-banner';
      elements.scoreStatusBadge.innerHTML = '<i data-lucide="alert-triangle" class="icon-xs"></i><span>ต้องทำการบ้านเพิ่ม</span>';
      elements.decisionStatusMessage.innerHTML = '<i data-lucide="alert-triangle" class="icon-sm text-amber"></i><span>ยังตอบคำถามไม่ครบ อย่าเพิ่งรีบกดซื้อ ตลาดยังอยู่พรุ่งนี้</span>';
    } else {
      elements.scoreStatusBadge.className = 'verdict-banner';
      elements.scoreStatusBadge.innerHTML = '<i data-lucide="alert-circle" class="icon-xs"></i><span>ยังไม่ผ่านการประเมิน</span>';
      elements.decisionStatusMessage.innerHTML = '<i data-lucide="x-circle" class="icon-sm text-rose"></i><span class="text-rose">ยังไม่แนะนำให้ซื้อ — ข้อมูลและความเข้าใจยังไม่เพียงพอต่อการรับความเสี่ยง</span>';
    }

    // Update Individual Section Badges
    updateSectionBadges();

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  function updateSectionBadges() {
    updateBadgeForSection(1, 'badge-sec-1', 'sec-1');
    updateBadgeForSection(2, 'badge-sec-2', 'sec-2');
    updateSubBadge('badge-sec-2-stock', '[data-id^="s2_s"]');
    updateSubBadge('badge-sec-2-etf', '[data-id^="s2_e"]');
    updateBadgeForSection(3, 'badge-sec-3', 'sec-3');
    updateBadgeForSection(4, 'badge-sec-4', 'sec-4');
    updateBadgeForSection(5, 'badge-sec-5', 'sec-5');
    updateBadgeForSection(6, 'badge-sec-6', 'sec-6');
    updateBadgeForSection(7, 'badge-sec-7', 'sec-7');
    updateBadgeForSection(9, 'badge-sec-9', 'sec-9');
  }

  function updateBadgeForSection(sectionNum, badgeId, sectionElId) {
    const badge = document.getElementById(badgeId);
    const section = document.getElementById(sectionElId);
    if (!badge || !section) return;

    const checkboxes = Array.from(section.querySelectorAll('.task-checkbox')).filter(cb => {
      const sub = cb.closest('[data-filter-item]');
      return !sub || sub.style.display !== 'none';
    });

    const total = checkboxes.length;
    const checked = checkboxes.filter(cb => cb.checked).length;

    badge.textContent = `${checked} / ${total}`;
    const isDone = total > 0 && checked === total;
    badge.classList.toggle('completed', isDone);
    section.classList.toggle('section-completed', isDone);
  }

  function updateSubBadge(badgeId, selector) {
    const badge = document.getElementById(badgeId);
    if (!badge) return;
    const checkboxes = Array.from(document.querySelectorAll(selector));
    const total = checkboxes.length;
    const checked = checkboxes.filter(cb => cb.checked).length;
    badge.textContent = `${checked} / ${total}`;
    badge.classList.toggle('completed', total > 0 && checked === total);
  }

  // =========================================================================
  // 7. SECTION CHECK ALL / UNCHECK ALL TOGGLE
  // =========================================================================

  function toggleCheckAllSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (!section) return;

    const checkboxes = Array.from(section.querySelectorAll('.task-checkbox')).filter(cb => {
      const sub = cb.closest('[data-filter-item]');
      return !sub || sub.style.display !== 'none';
    });

    const allChecked = checkboxes.every(cb => cb.checked);
    checkboxes.forEach(cb => cb.checked = !allChecked);

    saveCurrentState();
    showToast(allChecked ? 'ยกเลิกการเลือกในหมวดนี้แล้ว' : 'เลือกทั้งหมดในหมวดนี้แล้ว');
  }

  // =========================================================================
  // 8. SCROLL SPY FOR NAVIGATION STRIP
  // =========================================================================

  function initScrollSpy() {
    const sections = document.querySelectorAll('.section-card');
    const navStripScroll = document.querySelector('.nav-strip-scroll');
    let lastActiveSecId = '';

    window.addEventListener('scroll', () => {
      let currentSecId = '';
      const scrollPos = window.scrollY + 140;

      sections.forEach(sec => {
        if (sec.offsetTop <= scrollPos) {
          currentSecId = sec.getAttribute('id');
        }
      });

      if (currentSecId && currentSecId !== lastActiveSecId) {
        lastActiveSecId = currentSecId;
        elements.stripPills.forEach(pill => {
          const href = pill.getAttribute('href').replace('#', '');
          const isActive = href === currentSecId;
          pill.classList.toggle('active', isActive);
          if (isActive && navStripScroll) {
            pill.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
          }
        });
      }
    }, { passive: true });
  }

  // =========================================================================
  // 9. EXPORT & REPORT GENERATOR
  // =========================================================================

  function generateMarkdownReport() {
    const ticker = elements.assetTicker.value.trim().toUpperCase() || 'N/A';
    const alloc = elements.targetAllocation.value.trim() ? `${elements.targetAllocation.value.trim()}%` : 'N/A';
    const dateStr = new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });
    
    let md = `# Pre-Investment Final Checklist — ก่อนลงทุนจริง\n\n`;
    md += `**สินทรัพย์ (Ticker):** \`${ticker}\` | **ประเภท:** ${activeAssetType.toUpperCase()} | **Target Allocation:** ${alloc} | **วันที่ประเมิน:** ${dateStr}\n\n`;
    md += `**ผลการประเมินความพร้อม:** ${elements.scorePercent.textContent} (${elements.scoreCountPassed.textContent} ข้อ)\n\n`;
    md += `---\n\n`;

    const getCheck = (id) => {
      const cb = document.querySelector(`[data-id="${id}"]`);
      const isCrit = cb && cb.dataset.critical === 'true' ? ' `[CRITICAL]`' : '';
      return (cb && cb.checked ? '[x]' : '[ ]') + isCrit;
    };

    const getText = (id) => {
      const inp = document.getElementById(id);
      return inp ? inp.value.trim() : '';
    };

    md += `## 1. ตัวเราเอง\n\n`;
    md += `* ${getCheck('s1_1')} เงินก้อนนี้เป็นเงินที่ยังไม่จำเป็นต้องใช้ในเร็ว ๆ นี้\n`;
    md += `* ${getCheck('s1_2')} มีเงินสำรองฉุกเฉินแยกจากเงินลงทุนแล้ว\n`;
    md += `* ${getCheck('s1_3')} รู้ว่าตัวเองรับการขาดทุนหรือความผันผวนได้ประมาณไหน\n`;
    md += `* ${getCheck('s1_4')} รู้ว่าลงทุนระยะสั้น กลาง หรือยาว\n`;
    md += `* ${getCheck('s1_5')} ไม่ได้ซื้อเพราะ FOMO หรือเห็นคนอื่นกำไร\n\n`;
    md += `**ผ่านเมื่อ:** ถ้าพอร์ตลงแรงแล้วยังสามารถทำตามแผนเดิมได้ ไม่จำเป็นต้องรีบขายเพราะกลัว\n\n---\n\n`;

    md += `## 2. เรารู้ไหมว่ากำลังซื้ออะไร\n\n`;
    if (activeAssetType !== 'etf') {
      md += `### ถ้าเป็นหุ้นรายตัว\n\n`;
      md += `* ${getCheck('s2_s1')} อธิบายได้ว่าบริษัททำธุรกิจอะไร\n`;
      md += `* ${getCheck('s2_s2')} รู้ว่าบริษัทหาเงินจากไหน\n`;
      md += `* ${getCheck('s2_s3')} รู้ว่าลูกค้าหลักคือใคร\n`;
      md += `* ${getCheck('s2_s4')} รู้ว่าอะไรทำให้รายได้โต\n`;
      md += `* ${getCheck('s2_s5')} รู้ว่าคู่แข่งหลักคือใคร\n`;
      md += `* ${getCheck('s2_s6')} พออธิบายได้ว่าบริษัทมี Moat หรือข้อได้เปรียบอะไร\n`;
      md += `* ${getCheck('s2_s7')} รู้ว่าความเสี่ยงหลักของธุรกิจคืออะไร\n\n`;
    }

    if (activeAssetType !== 'stock') {
      md += `### ถ้าเป็น ETF\n\n`;
      md += `* ${getCheck('s2_e1')} รู้ว่า ETF นี้ลงทุนตาม Index หรือ Strategy อะไร\n`;
      md += `* ${getCheck('s2_e2')} เปิดดู Holdings แล้ว\n`;
      md += `* ${getCheck('s2_e3')} รู้ว่า Top Holdings มีอะไรบ้าง\n`;
      md += `* ${getCheck('s2_e4')} ดู Sector Allocation แล้ว\n`;
      md += `* ${getCheck('s2_e5')} รู้ว่า ETF กระจายจริงหรือกระจุกอยู่ใน Sector/หุ้นไม่กี่ตัว\n`;
      md += `* ${getCheck('s2_e6')} ดู Expense Ratio แล้ว\n`;
      md += `* ${getCheck('s2_e7')} ถ้ามี ETF หลายตัว เช็กแล้วว่ามี Holding Overlap กันมากแค่ไหน\n\n`;
    }
    md += `---\n\n`;

    if (activeAssetType !== 'etf') {
      md += `## 3. ธุรกิจแข็งแรงไหม\n\n`;
      md += `* ${getCheck('s3_1')} **Revenue** — รายได้โตไหม และโตต่อเนื่องหรือไม่\n`;
      md += `* ${getCheck('s3_2')} **Gross Margin** — Margin ทรงตัวหรือดีขึ้นไหม\n`;
      md += `* ${getCheck('s3_3')} **Operating Margin** — บริษัทควบคุมค่าใช้จ่ายและ Scale ได้ไหม\n`;
      md += `* ${getCheck('s3_4')} **Net Income** — บริษัทมีกำไรจริงไหม\n`;
      md += `* ${getCheck('s3_5')} **Free Cash Flow** — ธุรกิจสร้างเงินสดจริงหรือเปล่า\n`;
      md += `* ${getCheck('s3_6')} **Debt** — หนี้อยู่ในระดับที่รับได้ไหม\n`;
      md += `* ${getCheck('s3_7')} **ROE / ROIC** — ใช้เงินทุนได้มีประสิทธิภาพไหม\n`;
      md += `* ${getCheck('s3_8')} **Shares Outstanding** — มี Dilution ผู้ถือหุ้นหนักหรือไม่\n\n---\n\n`;
    }

    md += `## 4. หุ้นดี แล้วราคาดีไหม\n\n`;
    md += `* ${getCheck('s4_1')} ดู Valuation แล้ว\n`;
    md += `* ${getCheck('s4_2')} ใช้ Ratio ที่เหมาะกับธุรกิจ ไม่ได้ดูแค่ P/E อย่างเดียว\n`;
    md += `* ${getCheck('s4_3')} เปรียบเทียบกับอดีตของบริษัท\n`;
    md += `* ${getCheck('s4_4')} เปรียบเทียบกับบริษัทใกล้เคียง\n`;
    md += `* ${getCheck('s4_5')} เอา Growth ของบริษัทมาคิดประกอบด้วย\n`;
    md += `* ${getCheck('s4_6')} คิดถึงความเสี่ยงของธุรกิจประกอบกับราคาที่จ่าย\n\n---\n\n`;

    md += `## 5. มี Investment Thesis หรือยัง\n\n`;
    md += `**ทำไมถึงซื้อหุ้น/ETF ตัวนี้?**\n`;
    md += `* 1. ${getText('thesis_reason_1') || '-'}\n`;
    md += `* 2. ${getText('thesis_reason_2') || '-'}\n`;
    md += `* 3. ${getText('thesis_reason_3') || '-'}\n\n`;

    md += `**อะไรจะทำให้บริษัทโต?**\n`;
    md += `* Growth Driver 1: ${getText('thesis_growth_1') || '-'}\n`;
    md += `* Growth Driver 2: ${getText('thesis_growth_2') || '-'}\n\n`;

    md += `**ความเสี่ยงคืออะไร?**\n`;
    md += `* Risk 1: ${getText('thesis_risk_1') || '-'}\n`;
    md += `* Risk 2: ${getText('thesis_risk_2') || '-'}\n`;
    md += `* Risk 3: ${getText('thesis_risk_3') || '-'}\n\n`;

    md += `**อะไรเกิดขึ้นแล้วแปลว่าเราวิเคราะห์ผิด? (Thesis Break)**\n`;
    md += `* Thesis Break 1: ${getText('thesis_break_1') || '-'}\n`;
    md += `* Thesis Break 2: ${getText('thesis_break_2') || '-'}\n\n---\n\n`;

    md += `## 6. Portfolio รับมันไหวไหม\n\n`;
    md += `* ${getCheck('s6_1')} รู้ว่าจะให้หุ้นตัวนี้กิน Portfolio กี่ %\n`;
    md += `* ${getCheck('s6_2')} ถ้าหุ้นตัวนี้ลง 50% Portfolio โดยรวมยังรับได้\n`;
    md += `* ${getCheck('s6_3')} ไม่ได้ Concentrate โดยไม่รู้ตัว\n`;
    md += `* ${getCheck('s6_4')} เช็กแล้วว่าหุ้น/ETF ที่ถือไม่ได้กระจุกอยู่ใน Sector เดียวกันมากเกินไป\n`;
    md += `* ${getCheck('s6_5')} มีแผนว่าจะลงทุนครั้งเดียวหรือทยอยลงทุน\n\n---\n\n`;

    md += `## 7. มีแผนหลังจากซื้อหรือยัง\n\n`;
    md += `* ${getCheck('s7_1')} ถ้าราคาลงแต่ Fundamental ไม่เปลี่ยน จะทำอะไร\n`;
    md += `* ${getCheck('s7_2')} ถ้าราคาขึ้นจน Valuation แพงมาก จะทำอะไร\n`;
    md += `* ${getCheck('s7_3')} ถ้า Fundamental แย่ลง จะทำอะไร\n`;
    md += `* ${getCheck('s7_4')} ถ้า Investment Thesis พัง จะทำอะไร\n`;
    md += `* ${getCheck('s7_5')} รู้ว่าจะกลับมา Review บริษัทเมื่อไร เช่น ทุก Earnings\n\n---\n\n`;

    md += `## ก่อนกด BUY ถามตัวเองครั้งสุดท้าย\n\n`;
    md += `* ${getCheck('s9_1')} รู้ว่าซื้ออะไร\n`;
    md += `* ${getCheck('s9_2')} รู้ว่ามันหาเงินยังไง\n`;
    md += `* ${getCheck('s9_3')} ดูงบแล้ว\n`;
    md += `* ${getCheck('s9_4')} ดู Valuation แล้ว\n`;
    md += `* ${getCheck('s9_5')} รู้ว่าความเสี่ยงคืออะไร\n`;
    md += `* ${getCheck('s9_6')} มีเหตุผลว่าทำไมถึงซื้อ\n`;
    md += `* ${getCheck('s9_7')} รู้ว่าอะไรจะทำให้ Thesis พัง\n`;
    md += `* ${getCheck('s9_8')} Position Size เหมาะสม\n`;
    md += `* ${getCheck('s9_9')} ไม่ได้ซื้อเพราะ FOMO\n`;
    md += `* ${getCheck('s9_10')} ถ้าราคาลงพรุ่งนี้ ยังรู้ว่าตัวเองต้องทำอะไร\n\n`;

    md += `> **“ไม่ซื้อก็ไม่เสียอะไร ตลาดยังอยู่พรุ่งนี้”**\n`;
    md += `> หน้าที่ของเราไม่ใช่ซื้อหุ้นให้เยอะที่สุด แต่คือเลือกลงทุนเฉพาะสิ่งที่เราเข้าใจและคิดว่าราคากับความเสี่ยงสมเหตุสมผล\n`;

    return md;
  }

  function copyToClipboard(text, successMsg) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        showToast(successMsg);
      }).catch(() => fallbackCopy(text, successMsg));
    } else {
      fallbackCopy(text, successMsg);
    }
  }

  function fallbackCopy(text, successMsg) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      showToast(successMsg);
    } catch (err) {
      showToast('ไม่สามารถคัดลอกได้ กรุณาลองใหม่อีกครั้ง');
    }
    document.body.removeChild(textarea);
  }

  function showToast(msg) {
    elements.toastMessage.textContent = msg;
    elements.toast.classList.remove('hidden');
    clearTimeout(elements.toastTimeout);
    elements.toastTimeout = setTimeout(() => {
      elements.toast.classList.add('hidden');
    }, 2800);
  }

  // =========================================================================
  // 10. EVENT BINDINGS
  // =========================================================================

  function bindEvents() {


    // Profile Dropdown
    elements.btnProfiles.addEventListener('click', (e) => {
      e.stopPropagation();
      elements.profilesMenu.classList.toggle('hidden');
    });

    document.addEventListener('click', (e) => {
      if (!elements.profilesMenu.contains(e.target) && !elements.btnProfiles.contains(e.target)) {
        elements.profilesMenu.classList.add('hidden');
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        elements.profilesMenu.classList.add('hidden');
      }
    });

    // Mouse wheel horizontal scroll on sub-nav
    const navStripScroll = document.querySelector('.nav-strip-scroll');
    if (navStripScroll) {
      navStripScroll.addEventListener('wheel', (e) => {
        if (e.deltaY !== 0 && navStripScroll.scrollWidth > navStripScroll.clientWidth) {
          e.preventDefault();
          navStripScroll.scrollLeft += e.deltaY;
        }
      }, { passive: false });
    }

    elements.btnNewChecklist.addEventListener('click', createNewProfile);

    // Asset Type Tabs
    elements.typeTabs.forEach(btn => {
      btn.addEventListener('click', () => {
        setAssetTypeFilter(btn.dataset.type, true);
      });
    });

    // Preset Ticker Chips
    elements.presetChips.forEach(chip => {
      chip.addEventListener('click', () => {
        const ticker = chip.dataset.ticker;
        const type = chip.dataset.type;
        const alloc = chip.dataset.alloc;

        elements.assetTicker.value = ticker;
        elements.targetAllocation.value = alloc;
        setAssetTypeFilter(type, true);
        saveCurrentState();
        showToast(`เลือก ${ticker} (${type.toUpperCase()}) แล้ว`);
      });
    });

    // Inputs & Checkboxes Change
    elements.assetTicker.addEventListener('input', saveCurrentState);
    elements.targetAllocation.addEventListener('input', saveCurrentState);

    elements.taskCheckboxes.forEach(cb => {
      cb.addEventListener('change', saveCurrentState);
    });

    // Check All per Section Buttons
    elements.btnCheckAllList.forEach(btn => {
      btn.addEventListener('click', () => {
        toggleCheckAllSection(btn.dataset.targetSection);
      });
    });

    // Auto-check parent block when typing thesis
    elements.thesisInputs.forEach(input => {
      input.addEventListener('input', () => {
        const block = input.closest('.thesis-block-card');
        if (block) {
          const parentCb = block.querySelector('.task-checkbox');
          if (parentCb) {
            const anyFilled = Array.from(block.querySelectorAll('.thesis-input')).some(i => i.value.trim() !== '');
            parentCb.checked = anyFilled;
          }
        }
        saveCurrentState();
      });
    });

    // Export & Print Actions
    elements.btnExportMarkdown.addEventListener('click', () => {
      const md = generateMarkdownReport();
      copyToClipboard(md, 'คัดลอกรายงาน Markdown เรียบร้อยแล้ว!');
    });

    elements.btnCopySummary.addEventListener('click', () => {
      const md = generateMarkdownReport();
      copyToClipboard(md, 'คัดลอกบทสรุปการประเมินเรียบร้อยแล้ว!');
    });

    elements.btnPrint.addEventListener('click', () => {
      window.print();
    });

    elements.btnReset.addEventListener('click', resetChecklist);

    elements.btnQuickTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Keyboard Shortcuts (Ctrl/Cmd + S to Save/Notify, Ctrl/Cmd + E to Copy Markdown)
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        saveCurrentState();
        showToast('บันทึกข้อมูลล่าสุดเรียบร้อยแล้ว');
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        const md = generateMarkdownReport();
        copyToClipboard(md, 'คัดลอกรายงาน Markdown เรียบร้อยแล้ว!');
      }
    });
  }

  // Run Initialization
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
