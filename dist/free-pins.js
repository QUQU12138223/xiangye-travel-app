/* Explicit place search: never invent coordinates or silently choose a namesake. */
(() => {
  let serial=0,results=[];
  const escape=value=>escapeHtml(String(value??''));
  const status=message=>{let box=document.getElementById('trip-map-search-results');const form=document.getElementById('trip-map-add');if(!form)return;if(!box){box=document.createElement('div');box.id='trip-map-search-results';box.className='trip-map-search-results';box.setAttribute('role','status');form.after(box)}box.innerHTML=message};
  document.addEventListener('submit',async event=>{
    if(event.target.id!=='trip-map-add')return;
    const t=trip(),d=XIANGYE_PLACES.destination(t),name=String(new FormData(event.target).get('placeName')||'').trim();
    if(!t||!name||XIANGYE_PLACES.forDestination(d).some(p=>p.name===name))return;
    event.preventDefault();event.stopImmediatePropagation();
    const current=++serial;results=[];status('正在查找真实地点…');
    try{
      results=await XIANGYE_GEO.search(name);if(current!==serial)return;
      status(results.length?`<p>请选择准确地点；结果来自 OpenStreetMap，加入前请核对地址和国家。</p>${results.map((p,i)=>`<button type="button" class="trip-place-candidate" data-free-pin="${i}"><strong>${escape(p.name||p.display_name.split(',')[0])}</strong><small>${escape(p.display_name)}</small></button>`).join('')}<small>© OpenStreetMap contributors · 地点资料可能不完整</small>`:'没有查到这个地名。请试试更完整的名称（例如“故宫博物院 北京”），或在地图上手动选点。');
    }catch{if(current===serial)status('地点查询暂时不可用；未添加不确定的地图钉。请稍后重试。')}
  },true);
  document.addEventListener('click',event=>{
    const button=event.target.closest?.('[data-free-pin]');if(!button)return;
    const found=results[Number(button.dataset.freePin)],t=trip();if(!found||!t)return;
    const index=Math.max(0,Math.min(t.days.length-1,Number(state.mapDay)||0)),day=t.days[index];
    const city=found.address?.city||found.address?.town||found.address?.county||found.address?.state||'';
    const name=found.name||found.display_name.split(',')[0],key=`${name}|${city}`;
    if(day.places.includes(key)){status('这一天已经有这个地点。');return}
    if(!t.destinationData){const base=getDestination(t);t.destinationData={...base,places:[...(base?.places||[])]}}
    t.destinationData.places ||= [];
    let place=t.destinationData.places.find(p=>`${p.name}|${p.city||''}`===key);
    if(!place){place={id:`osm:${found.osm_type}:${found.osm_id}`,name,city,kind:found.type==='museum'?'博物馆':'地点',summary:'此位置来自 OpenStreetMap；景点介绍与开放时间尚未核实。',lat:Number(found.lat),lon:Number(found.lon),sources:[{label:'OpenStreetMap 地点资料',url:`https://www.openstreetmap.org/${found.osm_type}/${found.osm_id}`}],openingUrl:null,cost:0,time:'请自行安排'};t.destinationData.places.push(place)}
    day.places.push(key);saveTrip(t);state.tripMapPlaceId=place.id;results=[];render();notify('已把确认的地点加入当天行程与地图。');
  });
})();
