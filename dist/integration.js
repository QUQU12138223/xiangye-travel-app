/* 向野主行程 ↔ Travel-Plan-Page 旅行工作台。 */
(() => {
  const originalSaveTrip=saveTrip;
  saveTrip=function(next){
    const editing=state.editTrip;
    if(editing?.id===next.id){
      for(const key of ['info','expenses','bookings','travelStyle','stayBase'])if(next[key]===undefined&&editing[key]!==undefined)next[key]=editing[key];
    }
    return originalSaveTrip(next);
  };
  const current = renderTrip;
  const originalDestination=renderDestination;
  renderDestination=function(){const html=originalDestination();if(state.destination?.key!=='egypt')return html;return html.replace('<div class="section-heading"><h2 class="section-title">所有值得去</h2>',`<div class="egypt-atlas-entry"><strong>开罗—吉萨 · 真实探索地图</strong><p>地图上的博物馆与遗址都有中文导览，可按日期加入旅行。</p><button class="primary full" data-action="open-egypt-atlas">打开埃及地图 ↗</button></div><div class="section-heading"><h2 class="section-title">所有值得去</h2>`)};
  const originalDetail=renderDetail;
  renderDetail=function(){const html=originalDetail();if(state.destination?.key!=='egypt')return html;const ids={'吉萨金字塔群':'giza','埃及博物馆':'emc','大埃及博物馆':'gem','埃及文明国家博物馆':'nmec','伊斯兰艺术博物馆':'islamic','萨卡拉与阶梯金字塔':'saqqara'};const id=ids[state.detail?.name];if(!id)return html;return html.replace('<div id="wikiDetail"',`<div class="egypt-atlas-entry"><strong>这里有完整中文讲解</strong><p>从馆藏或遗址的历史开始，读完再决定怎么安排这一天。</p><button class="primary full" data-action="open-egypt-atlas" data-place="${id}">打开地图与讲解 ↗</button></div><div id="wikiDetail"`)};
  const profileBeforeCredits=renderProfile;
  renderProfile=function(){return `${profileBeforeCredits()}<p class="section-note"><a href="photo-credits.html">景点图片来源与许可 ↗</a> · <a href="travel-plan/LICENSE">Travel-Plan-Page 开源许可 ↗</a></p>`};
  const bookingPanel=t=>{
    const b=t.bookings||{},f=b.flight||{},car=b.rental||{},tickets=b.tickets||[];
    const input=(name,label,value='',type='text',placeholder='')=>`<label class="field"><span>${label}</span><input name="${name}" type="${type}" value="${escapeHtml(value)}" placeholder="${placeholder}" required></label>`;
    return `<details class="booking-details"><summary>航班、租车与票据资料 <span>展开填写</span></summary><p class="section-note">只填写已确认的资料；这些信息保存在当前浏览器，不会自动订票。不要录入订单验证码或完整证件号。</p><form id="flightBookingForm" class="info-edit"><strong>已确认航班</strong><div class="field-row">${input('airline','航空公司',f.airline)}${input('number','航班号',f.number)}</div><div class="field-row">${input('fromCode','出发机场代码',f.fromCode,'text','如 PVG')}${input('fromCity','出发城市',f.fromCity)}</div><div class="field-row">${input('toCode','到达机场代码',f.toCode,'text','如 CAI')}${input('toCity','到达城市',f.toCity)}</div><div class="field-row">${input('departDate','起飞日期',f.departDate,'date')}${input('departTime','起飞当地时间',f.departTime,'time')}</div><div class="field-row">${input('arriveDate','到达日期',f.arriveDate,'date')}${input('arriveTime','到达当地时间',f.arriveTime,'time')}</div><div class="field-row">${input('departureOffset','起飞地 UTC 时差',f.departureOffset,'text','如 +08:00')}${input('arrivalOffset','到达地 UTC 时差',f.arrivalOffset,'text','如 +02:00')}</div><button class="secondary full" type="submit">保存航班</button></form><form id="rentalBookingForm" class="info-edit"><strong>租车与还车</strong>${input('company','租车公司',car.company)}<div class="field-row">${input('pickupDate','取车日期',car.pickupDate,'date')}${input('pickupTime','取车时间',car.pickupTime,'time')}</div>${input('pickupLocation','取车地点',car.pickupLocation)}<div class="field-row">${input('dropoffDate','还车日期',car.dropoffDate,'date')}${input('dropoffTime','还车时间',car.dropoffTime,'time')}</div>${input('dropoffLocation','还车地点',car.dropoffLocation)}<div class="field-row">${input('offset','还车地 UTC 时差',car.offset,'text','如 +08:00')}${input('price','租车费用（人民币）',car.price,'number')}</div><button class="secondary full" type="submit">保存租车</button></form><form id="ticketBookingForm" class="info-edit"><strong>门票或预约链接</strong><div class="field-row"><label class="field"><span>对应日期</span><select name="day">${t.days.map((day,i)=>`<option value="${i}">第${i+1}天 · ${prettyDate(day.date)}</option>`).join('')}</select></label>${input('name','名称','','text','例如：博物馆门票')}</div><label class="field"><span>官方或票据链接（可选）</span><input name="url" type="url" placeholder="https://"></label><button class="secondary full" type="submit">保存票据</button></form>${tickets.length?`<div class="ticket-mini-list">${tickets.map(ticket=>`<div><span>${escapeHtml(ticket.name)} · 第${Number(ticket.day)+1}天</span><button data-action="remove-booked-ticket" data-id="${escapeHtml(ticket.id)}">移除</button></div>`).join('')}</div>`:''}</details>`;
  };
  const mapPanel = t => {
    if(t.key==='egypt'||t.destination==='埃及')return `<section class="route-section-x"><div class="section-heading"><h2 class="section-title">埃及真实探索地图</h2></div><p class="section-note">原开源项目的路线图片是示意画，不代表真实地理位置。这里已改为可点地标的开罗—吉萨地图。</p><button class="primary full" data-action="open-egypt-atlas">打开地图与博物馆讲解 ↗</button></section>`;
    const all = t.days.flatMap(day => day.places || []).map(key => findPlace(t,key)).filter(Boolean);
    const geocoded = all.filter(place => Number.isFinite(Number(place.lat)) && Number.isFinite(Number(place.lon)));
    const center = geocoded.length ? {lat:geocoded.reduce((sum,p)=>sum+Number(p.lat),0)/geocoded.length,lon:geocoded.reduce((sum,p)=>sum+Number(p.lon),0)/geocoded.length} : getDestination(t);
    const dayIndex=Math.max(0,Math.min(t.days.length-1,Number(state.mapDay)||0));
    const places=t.days[dayIndex]?.places.map(key => findPlace(t,key)).filter(Boolean) || [];
    const lat=Number(center?.lat),lon=Number(center?.lon),hasCoords=Number.isFinite(lat)&&Number.isFinite(lon);
    const box=hasCoords?[lon-0.12,lat-0.08,lon+0.12,lat+0.08].join('%2C'):'';
    const iframe=hasCoords?`<iframe class="route-map-frame" title="${escapeHtml(t.destination)}地图" loading="lazy" referrerpolicy="no-referrer" src="https://www.openstreetmap.org/export/embed.html?bbox=${box}&layer=mapnik&marker=${lat}%2C${lon}"></iframe>`:'<div class="empty">地点还没有坐标。仍可逐日添加地点，再查看地图。</div>';
    return `<section class="route-section-x"><div class="section-heading"><h2 class="section-title">在地图上规划</h2><span class="small muted">按天看地点</span></div><div class="route-day-tabs-x" role="group" aria-label="选择地图日期">${t.days.map((day,i)=>`<button class="${i===dayIndex?'selected':''}" data-action="map-day" data-day="${i}" aria-pressed="${i===dayIndex}">第${i+1}天</button>`).join('')}</div>${iframe}<p class="section-note">底图来自 OpenStreetMap。路线顺序是计划，不代表实际道路；中国境内地图服务可能无法加载，可直接打开外部地图。</p><ol class="route-place-list">${places.map((place,i)=>`<li><span class="route-place-number">${i+1}</span><span><b>${escapeHtml(place.name)}</b><small>${escapeHtml(place.city || '')}</small></span></li>`).join('')||'<li>这天还没有地点，点下方“添加地点”即可补充。</li>'}</ol><div class="actions"><button class="secondary" data-action="map-directions" data-day="${dayIndex}" ${places.length<2?'disabled':''}>查看当天路线 ↗</button><button class="secondary" data-action="map-location" ${!hasCoords?'disabled':''}>打开地图 ↗</button></div></section>`;
  };
  renderTrip = function(){const html=current(),t=trip();if(!t)return html;return html.replace('<div id="weatherPanel"',`<div class="integrated-workspace"><strong>完整旅行工作台</strong><p>已接入 Travel-Plan-Page：路线示意、逐日行程、门票状态、出发事项与多人记账。</p><button class="primary full" data-action="open-travel-plan">打开工作台 ↗</button></div>${mapPanel(t)}${bookingPanel(t)}<div id="weatherPanel"`)};
  document.addEventListener('submit',event=>{
    const id=event.target.id;
    if(!['flightBookingForm','rentalBookingForm','ticketBookingForm'].includes(id))return;
    event.preventDefault();const t=trip();if(!t)return;
    const data=new FormData(event.target);t.bookings=t.bookings||{};
    if(id==='flightBookingForm'){
      const f={};for(const key of ['airline','number','fromCode','fromCity','toCode','toCity','departDate','departTime','arriveDate','arriveTime','departureOffset','arrivalOffset'])f[key]=String(data.get(key)||'').trim().slice(0,80);
      if(!/^[-+]\d{2}:\d{2}$/.test(f.departureOffset)||!/^[-+]\d{2}:\d{2}$/.test(f.arrivalOffset)){notify('UTC 时差请写成 +08:00 这样的格式。');return;}
      t.bookings.flight=f;
    }else if(id==='rentalBookingForm'){
      const car={};for(const key of ['company','pickupDate','pickupTime','pickupLocation','dropoffDate','dropoffTime','dropoffLocation','offset','price'])car[key]=String(data.get(key)||'').trim().slice(0,100);
      if(!/^[-+]\d{2}:\d{2}$/.test(car.offset)||car.dropoffDate<car.pickupDate||Number(car.price)<=0){notify('请核对还车日期、UTC 时差和费用。');return;}
      t.bookings.rental=car;
    }else{
      const name=String(data.get('name')||'').trim().slice(0,80),raw=String(data.get('url')||'').trim();
      let url='';if(raw){try{const parsed=new URL(raw);if(!['https:','http:'].includes(parsed.protocol))throw Error();url=parsed.href;}catch{notify('票据链接必须以 https:// 或 http:// 开头。');return;}}
      t.bookings.tickets=t.bookings.tickets||[];t.bookings.tickets.push({id:uid(),day:Number(data.get('day'))||0,name,url});
    }
    saveTrip(t);render();notify('已保存到当前旅行，工作台会同步读取。');
  });
  document.addEventListener('click',event=>{
    const button=event.target.closest('button[data-action]');if(!button)return;
    if(button.dataset.action==='open-egypt-atlas'){const t=trip(),search=new URLSearchParams();if(t&&(t.key==='egypt'||t.destination==='埃及'))search.set('trip',t.id);if(button.dataset.place)search.set('place',button.dataset.place);location.href=`egypt-atlas.html${search.size?'?'+search:''}`;return}
    const t=trip();if(!t)return;
    if(button.dataset.action==='remove-booked-ticket'){
      t.bookings=t.bookings||{};t.bookings.tickets=(t.bookings.tickets||[]).filter(item=>item.id!==button.dataset.id);saveTrip(t);render();notify('票据已移除。');return;
    }
    if(button.dataset.action==='map-day'){state.mapDay=Number(button.dataset.day);render();}
    if(button.dataset.action==='map-location'){
      const d=getDestination(t);if(!d?.lat||!d?.lon)return;
      window.open(`https://www.openstreetmap.org/?mlat=${encodeURIComponent(d.lat)}&mlon=${encodeURIComponent(d.lon)}#map=11/${encodeURIComponent(d.lat)}/${encodeURIComponent(d.lon)}`,'_blank','noopener');
    }
    if(button.dataset.action==='map-directions'){
      const places=t.days[Number(button.dataset.day)]?.places.map(key=>findPlace(t,key)).filter(Boolean)||[];
      if(places.length<2)return;
      const query=place=>encodeURIComponent(place.query || `${place.name}, ${place.city||t.destination}`);
      const via=places.slice(1,-1).map(query).join('%7C');
      const url=`https://www.google.com/maps/dir/?api=1&origin=${query(places[0])}&destination=${query(places.at(-1))}${via?`&waypoints=${via}`:''}`;
      window.open(url,'_blank','noopener');
    }
    if(button.dataset.action==='open-travel-plan'){
      const d=getDestination(t),items=[...checklistItems(t),...(t.customItems||[]).map(item=>({id:`custom:${item.id}`,label:item.label}))];
      try{localStorage.setItem('xiangye-bridge-trip',JSON.stringify({trip:t,destination:d,checklist:items}));}
      catch{notify('当前浏览器无法保存旅行资料，工作台暂时无法打开。');return;}
      location.href=`travel-plan/?trip=${encodeURIComponent(t.id)}&v=5`;
    }
  });
  if(new URLSearchParams(location.search).get('atlasPlan')==='egypt'){state.planDestination={key:'egypt',...CATALOG.egypt};state.planRegion='出境';goto('plan')}else render();
})();
