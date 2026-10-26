(()=>{
  const original=renderTrip;
  const esc=s=>escapeHtml(String(s??''));
  const money=v=>Number(v||0).toLocaleString('zh-CN');
  const remembered={trip:'',day:0,phrase:0,open:false,dayOpen:false,allPlaces:false};
  const lessonData=()=>{const card=document.querySelector('#language-lesson');return card};
  function lessonIndex(t){return Math.max(0,Math.min(2,Number(remembered.phrase??t.languageDone??0)))}
  function updateLesson(t){
    const card=lessonData();if(!card)return;
    const i=lessonIndex(t),values=[...card.querySelectorAll('.language-phrase')];
    const courseName=card.querySelector('h2 small')?.textContent||'';
    const all=window.__todayLessons?.[courseName];
    if(!all)return;
    const phrase=all[i],el=values[0];if(!el)return;
    el.textContent=phrase[0];card.querySelector('.language-meaning').innerHTML=`${esc(phrase[1])} <small>· ${esc(phrase[2])}</small>`;
    card.querySelector('.language-counter').textContent=`第 ${i+1} / 3 句 · ${i<Number(t.languageDone||0)?'已学会，可随时重听':'学会一句，再走一步'}`;
    card.querySelector('[data-language="learn"]').textContent=i<Number(t.languageDone||0)?'已学会': '我学会了';
    card.querySelectorAll('[data-language-nav]').forEach(b=>{b.disabled=(b.dataset.languageNav==='prev'&&i===0)||(b.dataset.languageNav==='next'&&i===2)});
  }
  window.__todayLessons={
    '埃及阿拉伯语':[['السلام عليكم','你好 / 愿你平安','as-salāmu ʿalaykum'],['شكراً','谢谢','shukran'],['من فضلك، إلى هذا العنوان','请带我去这个地址','min faḍlak, ilā hādhā al-ʿunwān']],
    '法语':[['Bonjour','你好','bon-jour'],['Merci','谢谢','mer-si'],['Où est la gare ?','车站在哪里？','ou è la gar']],
    '德语':[['Guten Tag','你好','gu-ten tak'],['Danke','谢谢','dan-ke'],['Wo ist der Bahnhof?','火车站在哪里？','vo ist der ban-hof']],
    '西班牙语':[['Hola','你好','o-la'],['Gracias','谢谢','gra-sias'],['¿Dónde está la estación?','车站在哪里？','don-de es-ta la es-ta-sion']],
    '意大利语':[['Buongiorno','你好','buon-jor-no'],['Grazie','谢谢','gra-tsie'],['Dov’è la stazione?','车站在哪里？','do-ve la sta-tsio-ne']],
    '葡萄牙语':[['Olá','你好','o-la'],['Obrigado / Obrigada','谢谢','o-bri-ga-do / da'],['Onde fica a estação?','车站在哪里？','on-de fi-ka a es-ta-são']],
    '荷兰语':[['Hallo','你好','ha-lo'],['Dank je wel','谢谢','dank ye vel'],['Waar is het station?','车站在哪里？','vaar is het sta-sion']],
    '希腊语':[['Γεια σας','你好','ya sas'],['Ευχαριστώ','谢谢','ef-ha-ri-sto'],['Πού είναι ο σταθμός;','车站在哪里？','pu ine o stathmos']],
    '日语':[['こんにちは','你好','konnichiwa'],['ありがとうございます','谢谢','arigatō gozaimasu'],['駅はどこですか','车站在哪里？','eki wa doko desu ka']],
    '韩语':[['안녕하세요','你好','annyeonghaseyo'],['감사합니다','谢谢','gamsahamnida'],['역이 어디예요?','车站在哪里？','yeogi eodi-yeyo']],
    '泰语':[['สวัสดี','你好','sawasdee'],['ขอบคุณ','谢谢','khop khun'],['สถานีรถไฟอยู่ที่ไหน','车站在哪里？','sathani rotfai yu thi nai']],
    '印尼语':[['Halo','你好','ha-lo'],['Terima kasih','谢谢','te-ri-ma ka-sih'],['Di mana stasiun?','车站在哪里？','di ma-na sta-siun']],
    '马来语':[['Hai','你好','hai'],['Terima kasih','谢谢','te-ri-ma ka-sih'],['Di mana stesen?','车站在哪里？','di ma-na ste-sen']],
    '旅行英语':[['Hello','你好','he-lo'],['Thank you','谢谢','thank you'],['Please take me to this address.','请带我去这个地址','please take me to this address']]
  };
  function today(t){
    const now=new Date(),today=[now.getFullYear(),String(now.getMonth()+1).padStart(2,'0'),String(now.getDate()).padStart(2,'0')].join('-');
    if(remembered.trip!==t.id){remembered.trip=t.id;const current=t.days.findIndex(d=>d.date===today);remembered.day=current<0?0:current;remembered.phrase=Math.min(2,Number(t.languageDone||0));remembered.open=false;remembered.dayOpen=false;remembered.allPlaces=false}
    const i=Math.min(remembered.day,t.days.length-1),day=t.days[i],d=day.daily||{};
    const placeData=(day.places||[]).map((key,n)=>({key,n,place:findPlace(t,key),name:findPlace(t,key)?.name||key.split('|')[0]}));
    const visiblePlaces=remembered.allPlaces?placeData:placeData.slice(0,4);
    const places=visiblePlaces.map(({n,name,place})=>`<button type="button" class="today-place" data-today="place" title="${esc(name)}"><b>${n+1}</b><span>${esc(name)}</span><small>${esc(place?.city||d.area||t.destination)}</small></button>`).join('')||'<p class="today-empty">还没选地点。展开后可以添加地点。</p>';
    const more=placeData.length>4&&!remembered.allPlaces?`<button type="button" class="today-more" data-today="all-places" aria-label="展开另外${placeData.length-4}个地点"><strong>+${placeData.length-4}</strong><span>全部地点</span></button>`:'';
    const route=[d.from,d.to].filter(Boolean).map(esc).join(' → ');
    const days=t.days.map((item,n)=>`<button type="button" data-today-day="${n}" class="${n===i?'active':''}" aria-pressed="${n===i}"><b>第${n+1}天</b><small>${esc(prettyDate(item.date))}</small></button>`).join('');
    const placeNames=placeData.map(({name},n)=>`<span><b>${n+1}</b>${esc(name)}</span>`).join('')||`<span class="today-empty">尚未安排具体地点；${esc(d.area||t.destination)}只是当天所在地区</span>`;
    const detail=remembered.dayOpen?`<div class="today-detail"><p><b>时间与编号</b> ${esc(d.flight||'待填写')} ${esc(d.departTime||'')} ${d.arriveTime?'→ '+esc(d.arriveTime):''}</p><p><b>住处位置</b> ${esc(d.hotelArea||'待填写')}</p><p><b>当天其他安排</b> ${esc(d.activities||'待填写')}</p><p><b>餐饮 / 活动预算</b> ¥${money(d.foodCost)} / ¥${money(d.activityCost)}</p><p><b>备注</b> ${esc(d.notes||'无')}</p><div class="today-actions"><button type="button" data-today="map">看当天地图 ↗</button><button type="button" data-today="edit">编辑这一天 ↗</button><button type="button" data-today="language">练一句当地话 ↗</button></div></div>`:'';
    return `<section class="today-mode" aria-label="合并后的逐日日程"><div class="today-top"><div><span class="page-overline">YOUR DAY</span><h2>这一天</h2><p>当天安排速览</p></div><span class="today-day-number">${String(i+1).padStart(2,'0')}</span></div><div class="today-days" aria-label="选择日期">${days}</div><div class="today-overview"><strong>${day.date===today?'今天':'第'+(i+1)+'天'} · ${esc(d.area||t.destination)}</strong><small>${esc(prettyDate(day.date))}</small><div class="today-overview-row"><b>地点</b><div class="today-place-names">${placeNames}</div></div><div class="today-overview-row"><b>交通</b><span>${esc(d.transport||d.flight||'待安排')}${route?' · '+route:''}</span></div><div class="today-overview-row"><b>住宿</b><span>${esc(d.hotel||'待安排')}</span></div><div class="today-overview-row"><b>预算</b><span>${d.dayBudget?'¥'+money(d.dayBudget):'待填写'}</span></div><button type="button" class="today-summary" data-today="toggle-day" aria-expanded="${remembered.dayOpen}">${remembered.dayOpen?'收起当天细节':'展开当天细节'} ↓</button></div><div class="today-stops"><div class="today-stops-title"><h3>地点钉 · ${placeData.length} 站</h3><span>左右滑动查看</span></div><div class="today-place-rail">${places}${more}</div></div>${detail}</section>`;
  }
  renderTrip=function(){const t=trip(),markup=original();if(!t?.days?.length)return markup;const modified=markup.replace(/<p>第 \d \/ 3 句 · [^<]*<\/p><\/div><div class="language-phrase"/,m=>m.replace('<p>','<p class="language-counter">')).replace(/<p>([^<]+) <small>· ([^<]+)<\/small><\/p><div class="language-actions">/,(_m,a,b)=>`<p class="language-meaning">${a} <small>· ${b}</small></p><div class="language-nav"><button type="button" data-language-nav="prev" aria-label="上一句">← 上一句</button><button type="button" data-language-nav="next" aria-label="下一句">下一句 →</button></div><div class="language-actions">`);return today(t)+`<details class="today-full" ${remembered.open?'open':''}><summary>完整行程、地图与准备事项 <span>${remembered.open?'收起':'展开'} ↗</span></summary><div class="today-full-content">${modified}</div></details>`};
  let audio;
  document.addEventListener('click',e=>{const b=e.target.closest?.('[data-today],[data-today-day],[data-language-nav],[data-language]');if(!b)return;const t=trip();if(!t)return;
    if(b.dataset.todayDay!==undefined){e.stopImmediatePropagation();remembered.day=Number(b.dataset.todayDay);remembered.dayOpen=true;remembered.allPlaces=false;render();return}
    if(b.dataset.today){e.stopImmediatePropagation();const a=b.dataset.today;if(a==='toggle-day'){remembered.dayOpen=!remembered.dayOpen;render();return}if(a==='all-places'){remembered.allPlaces=true;render();return}if(a==='place'){remembered.dayOpen=true;render();return}if(a==='prev'||a==='next'){remembered.day=Math.max(0,Math.min(t.days.length-1,remembered.day+(a==='next'?1:-1)));remembered.allPlaces=false;render();return}remembered.open=true;if(a==='map')state.mapDay=remembered.day;render();const selector=a==='map'?'#trip-map-workspace':a==='edit'?`.daily-card[data-index="${remembered.day}"]`:'#language-lesson';const target=document.querySelector(selector);if(a==='edit'&&target)target.open=true;target?.scrollIntoView({behavior:'smooth',block:'start'});return}
    if(b.dataset.languageNav){e.stopImmediatePropagation();remembered.phrase=Math.max(0,Math.min(2,remembered.phrase+(b.dataset.languageNav==='next'?1:-1)));updateLesson(t);return}
    if(!b.dataset.language)return;e.stopImmediatePropagation();const card=lessonData(),i=lessonIndex(t),phrase=card?.querySelector('.language-phrase')?.textContent||'',feedback=card?.querySelector('.language-feedback');if(b.dataset.language==='learn'){if(i>=Number(t.languageDone||0)){t.languageDone=Math.min(3,i+1);saveTrip(t);remembered.phrase=Math.min(2,i+1);render();notify('已记录，准备环的语言段更新了。')}else notify('这一句已经学会，可以随时重听。');return}const lang=card?.querySelector('.language-phrase')?.lang;if(lang==='ar-EG'){audio?.pause();audio=new Audio(`audio/ar-${i}.mp3`);audio.play().then(()=>{if(feedback)feedback.textContent='正在播放埃及阿拉伯语录音。'}).catch(()=>{if(feedback)feedback.textContent='录音无法播放，请检查设备音量。'});return}if(!('speechSynthesis' in window)){if(feedback)feedback.textContent='这台设备暂不支持朗读。';return}const voice=speechSynthesis.getVoices().find(v=>v.lang.toLowerCase().startsWith(lang?.slice(0,2).toLowerCase()));if(!voice){if(feedback)feedback.textContent='这台设备没有对应语言的语音。';return}speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(phrase);u.lang=lang;u.voice=voice;u.rate=.82;speechSynthesis.speak(u);if(feedback)feedback.textContent='正在朗读，可再点一次重听。'
  },true);
  document.addEventListener('toggle',e=>{if(e.target.matches?.('.today-full')){remembered.open=e.target.open;if(e.target.open)setTimeout(()=>window.dispatchEvent(new Event('resize')),150)}},true);
  const oldRender=render;render=function(){oldRender();if(state.view==='trip')updateLesson(trip())};
})();
