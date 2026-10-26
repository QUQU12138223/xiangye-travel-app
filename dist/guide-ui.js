/* 一份地点手册：地区索引、城市攻略、已有地点共用同一目的地。 */
(() => {
  const guides=window.XIANGYE_GUIDES||[];
  const e=x=>escapeHtml(String(x??''));
  const originalDiscover=renderDiscover;
  renderDiscover=function(){
    const html=originalDiscover();
    const groups=['亚洲','申根欧洲','欧洲小镇','非洲','北美洲','南美洲','大洋洲','南极洲'].map(title=>[title,guides.filter(g=>g.group===title)]);
    return html+`<section class="guide-index"><div class="section-heading"><h2 class="section-title">从地图走进一座城</h2></div><p class="section-note">七大洲的旅行入口，含申根 29 国和更多城市、小镇。地点资料分为已核实地图点与待扩充线索，不把城市中心当成景点入口。</p>${groups.map(([title,items])=>`<details class="guide-group" ${title==='亚洲'?'open':''}><summary>${e(title)} <span>${items.length} 个目的地</span></summary><div class="guide-grid">${items.map(g=>`<button type="button" class="guide-country" data-guide-key="${e(g.key)}"><strong>${e(g.city)}</strong><small>${e(g.country)} · ${e(g.highlight)}</small></button>`).join('')}</div></details>`).join('')}<p class="guide-source">申根国家名单以<a href="${e(window.XIANGYE_SCHENGEN_SOURCE)}" target="_blank" rel="noopener noreferrer">欧盟委员会</a>为准；行前线索不是实时开放、交通或签证承诺。</p></section>`;
  };
  const originalDestination=renderDestination;
  renderDestination=function(){
    const html=originalDestination(),d=state.destination;if(!d)return html;
    const g=guides.find(x=>x.key===d.key||x.city===d.name);
    if(!g)return html;
    const known=(d.places||[]).filter(p=>p.kind?.includes('博物馆'));
    if(g.group==='南极洲'){
      const guide=`<section class="guide-collection"><span class="page-overline">POLAR FIELD NOTES · 南极洲</span><h2>先认识去南极的路</h2><p>这里没有普通城市和博物馆。${e(d.intro)}</p><div class="guide-slices"><article><span>01 / 出发</span><strong>乌斯怀亚等门户</strong><p>港口与转机安排需按航次向运营方核实。</p></article><article><span>02 / 航行</span><strong>探险船与海况</strong><p>登陆与野生动物观察取决于季节、天气和环境要求，不保证某个固定点。</p></article><article><span>03 / 准备</span><strong>证件与保障</strong><p>分别核对出发国、转机国的入境条件，以及船方的装备、保险和健康要求。</p></article></div></section>`;
      return html.replace(/<div class="section-heading"><h2 class="section-title">所有值得去<\/h2>[\s\S]*?<p class="notice">[\s\S]*?<\/p>/,guide);
    }
    const source=`https://www.openstreetmap.org/search?query=${encodeURIComponent(g.museum+' '+g.city)}`;
    const guide=`<section class="guide-collection"><span class="page-overline">CITY FIELD NOTES · ${e(g.group)}</span><h2>${e(g.city)}，慢慢走</h2><p>先去 <strong>${e(g.highlight)}</strong> 理解城市的样子；给 <strong>${e(g.museum)}</strong> 留出一段完整的参观时间。吃一份 <strong>${e(g.food)}</strong>，余下的空白留给街道与偶遇。</p><div class="guide-slices"><article><span>01 / 走走</span><strong>${e(g.highlight)}</strong><p>建议先在地图核对入口、步行距离与现场开放情况。</p></article><article><span>02 / 看展</span><strong>${e(g.museum)}</strong><p>${known.length?`本页已收录 ${known.length} 处有坐标的博物馆，可在下方打开地点卡片并加入行程。`:'这是城市博物馆线索；位置未在本站核实前，不自动生成地图钉。'}</p><a href="${e(source)}" target="_blank" rel="noopener noreferrer">核对博物馆位置 ↗</a></article><article><span>03 / 好好吃</span><strong>${e(g.food)}</strong><p>一道当地饮食线索，不预设餐馆、价格或营业时间。</p></article></div><p class="guide-source">这份手册是行前概览；地图钉只在地点坐标确认后加入，门票、交通、签证以官方实时资料为准。</p></section>`;
    return html.replace('<div class="section-heading"><h2 class="section-title">所有值得去</h2>',guide+'<div class="section-heading"><h2 class="section-title">所有值得去</h2>');
  };
  const previousTrip=renderTrip;
  renderTrip=function(){const markup=previousTrip(),t=trip(),d=t&&getDestination(t);if(!d||d.daily!==0)return markup;const template=document.createElement('template');template.innerHTML=markup;const tile=[...template.content.querySelectorAll('.overview-tile')].find(x=>x.textContent.includes('粗略估算'));if(tile){tile.innerHTML='<small>粗略估算</small><strong>待核对</strong>';const note=document.createElement('p');note.className='section-note';note.textContent='这里还没有可靠的目的地费用样本。请用每天的交通、住宿和实际报价填写预算，不把通用公式当成当地价格。';tile.parentElement.after(note)}return template.innerHTML};
  document.addEventListener('click',event=>{const b=event.target.closest?.('[data-guide-key]');if(!b)return;openDestination(b.dataset.guideKey)});
  render();
})();
