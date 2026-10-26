/* 行程档案封面流：沿用原有旅行数据与打开/编辑动作。 */
(() => {
  let active = 0, showAll = false, startY = null, wheelAt = 0;
  const safe = value => escapeHtml(String(value ?? ''));
  const cover = t => {
    const d = getDestination(t);
    return window.XIANGYE_DESTINATION_COVERS?.[t.key] || window.XIANGYE_PHOTOS?.[t.destination] || window.XIANGYE_PHOTOS?.[d?.name] || d?.photo || d?.places?.find(p => p.photo)?.photo || '';
  };
  const card = (t, index, count) => {
    let distance = index - active;
    if (distance > count / 2) distance -= count;
    if (distance < -count / 2) distance += count;
    const slot = distance === 0 ? 'main' : distance === -1 ? 'before' : distance === 1 ? 'after' : 'hidden';
    const photo = cover(t);
    return `<button type="button" class="archive-cover archive-${slot}" data-archive-select="${index}" aria-label="${safe(t.destination)}，${index + 1} / ${count}${slot === 'main' ? '，当前档案' : ''}" ${slot === 'hidden' ? 'tabindex="-1" aria-hidden="true"' : ''} style="--archive-photo:${photo ? `url('${encodeURI(photo).replace(/'/g, '%27')}')` : 'none'}"><span class="archive-cover-top"><small>向野 · 旅行档案</small><span>${String(index + 1).padStart(2, '0')} / ${String(count).padStart(2, '0')}</span></span><span class="archive-cover-bottom"><small>${safe(t.travelStyle === 'stay' ? '一地慢住' : '沿途探索')}</small><strong>${safe(t.destination)}</strong><span>${safe(prettyDate(t.start))} — ${safe(prettyDate(t.end))}</span></span></button>`;
  };
  const details = t => `<div class="archive-current"><div><small>当前档案 · ${safe(t.origin)}出发</small><strong>${safe(t.destination)}</strong><span>${duration(t)}天 · ${t.people}人</span></div><div class="archive-current-actions"><button type="button" class="primary" data-action="open-trip" data-id="${safe(t.id)}">打开行程</button><button type="button" class="secondary" data-action="edit-trip" data-id="${safe(t.id)}">编辑计划</button></div></div>`;
  const old = renderTrips;
  renderTrips = function () {
    const all = trips();
    if (!all.length) return old();
    active = ((active % all.length) + all.length) % all.length;
    return `<section class="page-hero"><span class="page-overline">MY JOURNEYS</span><h1 class="page-title">路上的日子</h1><p class="sub">每段旅程，都有自己的节奏。</p></section><div class="overview-grid"><div class="overview-tile tile-pink"><small>已保存旅程</small><strong>${all.length}</strong></div><div class="overview-tile tile-yellow"><small>准备中的下一站</small><strong>${safe(all[0].destination)}</strong></div></div><div class="section-heading archive-heading"><h2 class="section-title">旅行档案</h2><button type="button" class="text-button" data-archive-all aria-expanded="${showAll}">${showAll ? '收起展示 ↑' : '全部展示 ↗'}</button></div>${showAll ? `<div class="archive-all">${all.map((t, i) => `<article class="archive-all-card"><button type="button" class="archive-all-cover" data-archive-select="${i}" style="--archive-photo:${cover(t) ? `url('${encodeURI(cover(t)).replace(/'/g, '%27')}')` : 'none'}"><small>TRAVEL ${String(i + 1).padStart(2, '0')}</small><strong>${safe(t.destination)}</strong><span>${safe(prettyDate(t.start))} — ${safe(prettyDate(t.end))}</span></button><div><button type="button" data-action="open-trip" data-id="${safe(t.id)}">打开行程</button><button type="button" data-action="edit-trip" data-id="${safe(t.id)}">编辑计划</button></div></article>`).join('')}</div>` : `<p class="archive-instruction">上下滑动封面切换旅程 · 点击邻卡也可以选中</p><div class="archive-deck" aria-label="旅行档案封面流">${all.map((t, i) => card(t, i, all.length)).join('')}</div><div class="archive-controls"><button type="button" data-archive-step="-1" aria-label="上一个旅行档案" ${all.length < 2 ? 'disabled' : ''}>↑</button><span>${active + 1} / ${all.length}</span><button type="button" data-archive-step="1" aria-label="下一个旅行档案" ${all.length < 2 ? 'disabled' : ''}>↓</button></div>${details(all[active])}`}<button class="secondary full" data-action="new-trip">＋ 开始一段新旅程</button><p class="section-note"><a href="destination-cover-credits.html" target="_blank" rel="noopener noreferrer">查看目的地封面来源 ↗</a></p>`;
  };
  const step = delta => { const all = trips(); if (!all.length) return; active = (active + delta + all.length) % all.length; render(); };
  document.addEventListener('click', event => {
    const allButton = event.target.closest('[data-archive-all]');
    if (allButton) { showAll = !showAll; render(); return; }
    const selected = event.target.closest('[data-archive-select]');
    if (selected) { active = Number(selected.dataset.archiveSelect); if (showAll) showAll = false; render(); return; }
    const arrow = event.target.closest('[data-archive-step]');
    if (arrow) step(Number(arrow.dataset.archiveStep));
  });
  document.addEventListener('touchstart', event => { if (event.target.closest('.archive-deck')) startY = event.touches[0]?.clientY ?? null; }, { passive: true });
  document.addEventListener('touchend', event => { if (startY == null || !event.target.closest('.archive-deck')) return; const delta = startY - (event.changedTouches[0]?.clientY ?? startY); startY = null; if (Math.abs(delta) > 35) step(delta > 0 ? 1 : -1); }, { passive: true });
  document.addEventListener('wheel', event => { if (!event.target.closest('.archive-deck') || Math.abs(event.deltaY) < 18 || performance.now() - wheelAt < 500) return; wheelAt = performance.now(); event.preventDefault(); step(event.deltaY > 0 ? 1 : -1); }, { passive: false });
})();
