/* Hallmark · pre-emit critique: P5 H4 E4 S5 R5 V4 · true geospatial atlas, not a decorative route image */
import * as maplibregl from './vendor/maplibre/maplibre-gl.mjs';
maplibregl.setWorkerUrl(new URL('./vendor/maplibre/maplibre-gl-worker.mjs', import.meta.url).href);

const guides=window.XIANGYE_EGYPT_GUIDES||[];
const byId=new Map(guides.map(place=>[place.id,place]));
const allTrips=()=>{try{return JSON.parse(localStorage.getItem('xiangye-trips')||'[]')}catch{return []}};
const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const params=new URLSearchParams(location.search);
let tripId=params.get('trip')||'';
let dayIndex=Math.max(0,Number(params.get('day'))||0);
let selectedId=byId.has(params.get('place'))?params.get('place'):'gem';
let filter='all';
let map;
let leafletMap;
let speaking=false;
let narration=[];
const markers=new Map();
const status=document.getElementById('map-status');
const toast=document.getElementById('toast');
let toastTimer;

function notify(message){toast.textContent=message;toast.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove('show'),3500)}
function currentTrip(){const list=allTrips();return list.find(t=>t.id===tripId&&(t.key==='egypt'||t.destination==='埃及'))||list.find(t=>t.key==='egypt'||t.destination==='埃及')||null}
function findTripPlace(t,id){const guide=byId.get(id);return t&&guide?guide.name+'|'+guide.city:null}
function selectedDay(t){return t?.days?.[Math.min(dayIndex,t.days.length-1)]||null}
function savedIds(t){const keys=new Set((t?.days||[]).flatMap(day=>day.places||[]));return new Set(guides.filter(g=>keys.has(g.name+'|'+g.city)).map(g=>g.id))}
function createPin(place){const button=document.createElement('button');button.type='button';button.className='map-pin '+(place.kind==='博物馆'?'museum':'heritage');button.setAttribute('aria-label','查看'+place.name+'的讲解');button.title=place.name;const glyph=document.createElement('span');glyph.textContent=place.kind==='博物馆'?'⌂':'◆';button.append(glyph);button.addEventListener('click',event=>{event.stopPropagation();select(place.id,true)});return button}
function updateMarkers(){const saved=savedIds(currentTrip());for(const [id,marker] of markers){const element=marker.getElement()?.querySelector('.map-pin')||marker.getElement();if(!element)continue;element.classList.toggle('selected',id===selectedId);element.classList.toggle('saved',saved.has(id))}}
function initLeaflet(){
  if(!window.L){status.hidden=false;status.textContent='地图暂时无法启动；地点和讲解仍可阅读。';return}
  leafletMap=L.map('egypt-map',{zoomControl:false,scrollWheelZoom:false}).setView([30.011,31.188],10);
  L.tileLayer('https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png',{subdomains:'abc',maxZoom:19,attribution:'© OpenStreetMap contributors · OpenStreetMap France',crossOrigin:true}).addTo(leafletMap);
  L.control.zoom({position:'bottomright'}).addTo(leafletMap);
  for(const place of guides){const pin=createPin(place);const marker=L.marker([place.lat,place.lon],{icon:L.divIcon({html:pin.outerHTML,className:'leaflet-place-icon',iconSize:[36,46],iconAnchor:[18,46]}),title:place.name}).addTo(leafletMap);marker.on('click',()=>select(place.id,true));markers.set(place.id,marker)}
  updateMarkers();status.hidden=true;
}
function initMap(){
  status.hidden=false;status.textContent='正在打开真实地图…';
  if(params.get('view')!=='3d'||!document.createElement('canvas').getContext('webgl2')){initLeaflet();return}
  try{
    map=new maplibregl.Map({container:'egypt-map',style:'https://tiles.openfreemap.org/styles/liberty',center:[31.188,30.011],zoom:10.4,pitch:48,bearing:-12,maxPitch:75,antialias:true,attributionControl:true});
    map.addControl(new maplibregl.NavigationControl({showCompass:true}),'bottom-right');
    map.on('load',()=>{
      const layers=map.getStyle()?.layers||[];
      const label=layers.find(layer=>layer.type==='symbol')?.id;
      if(map.getSource('openmaptiles')){
        map.addLayer({id:'xiangye-real-buildings',type:'fill-extrusion',source:'openmaptiles','source-layer':'building',minzoom:15,filter:['all',['has','render_height'],['>', ['get','render_height'],0]],paint:{'fill-extrusion-color':getComputedStyle(document.documentElement).getPropertyValue('--map-building').trim(),'fill-extrusion-opacity':0.75,'fill-extrusion-height':['get','render_height'],'fill-extrusion-base':['coalesce',['get','render_min_height'],0]}},label);
      }
      status.hidden=true;
    });
    for(const place of guides){const marker=new maplibregl.Marker({element:createPin(place),anchor:'bottom'}).setLngLat([place.lon,place.lat]).addTo(map);markers.set(place.id,marker)}
    updateMarkers();
    map.on('error',event=>{if(!map?.loaded()&&event.error){status.hidden=false;status.textContent='地图底图暂时没有加载。地点和讲解仍可使用；请检查网络后刷新。'}});
  }catch(error){map?.remove();map=null;markers.clear();initLeaflet()}
}

function renderList(){const shown=guides.filter(place=>filter==='all'||place.kind===filter);document.getElementById('place-count').textContent=`${shown.length}处已核对地点`;document.getElementById('place-list').innerHTML=shown.map((place,i)=>`<button type="button" class="place-card ${place.kind==='博物馆'?'museum':'heritage'} ${place.id===selectedId?'selected':''}" data-place="${place.id}" aria-label="查看${escapeHtml(place.name)}的讲解"><span class="number">${String(i+1).padStart(2,'0')}</span><span><strong>${escapeHtml(place.name)}</strong><small>${escapeHtml(place.city)} · ${escapeHtml(place.kind)}</small></span><span class="arrow">↗</span></button>`).join('')}
function renderGuide(){const place=byId.get(selectedId);if(!place)return;document.getElementById('guide-kind').textContent=place.kind;document.getElementById('guide-title').textContent=place.name;document.getElementById('guide-lead').textContent=place.lead;document.getElementById('guide-sections').innerHTML=place.sections.map(section=>`<article><h3>${escapeHtml(section.title)}</h3><p>${escapeHtml(section.body)}</p></article>`).join('');document.getElementById('guide-sources').innerHTML=place.sources.map(source=>`<a href="${escapeHtml(source.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(source.label)} ↗</a>`).join('');renderTripControls()}
function renderTripControls(){const t=currentTrip(),host=document.getElementById('trip-controls');if(!t){host.innerHTML='<strong>想把这里放进行程？</strong><p>先建立一段埃及旅程，再按日期添加地点。不会自动预订门票。</p><button type="button" id="create-trip">规划埃及旅程 ↗</button>';document.getElementById('create-trip').addEventListener('click',()=>location.href='./?atlasPlan=egypt&v=6');return}
  tripId=t.id;dayIndex=Math.min(dayIndex,t.days.length-1);const key=findTripPlace(t,selectedId),included=selectedDay(t)?.places?.includes(key);host.innerHTML=`<strong>${escapeHtml(t.destination)} · 放进哪一天</strong><label>选择日期 <select id="atlas-day">${t.days.map((day,i)=>`<option value="${i}" ${i===dayIndex?'selected':''}>第${i+1}天 · ${escapeHtml(day.date)}</option>`).join('')}</select></label><button id="save-place" type="button">${included?'✓ 已在这一天':'＋ 加入这一天'}</button><p>当前行程保存在此浏览器；切换设备不会自动同步。</p>`;document.getElementById('atlas-day').addEventListener('change',event=>{dayIndex=Number(event.target.value);renderTripControls();renderRoute()});document.getElementById('save-place').addEventListener('click',saveSelectedPlace)}
function saveSelectedPlace(){const list=allTrips(),index=list.findIndex(t=>t.id===tripId),place=byId.get(selectedId);if(index<0||!place)return;const t=list[index],day=selectedDay(t),key=findTripPlace(t,selectedId);if(!day||!key)return;if(day.places.includes(key)){notify('这一天已经有这个地点了');return}day.places.push(key);localStorage.setItem('xiangye-trips',JSON.stringify(list));notify(`${place.name}已加入第${dayIndex+1}天`);renderTripControls();renderRoute();updateMarkers()}
function renderRoute(){const host=document.getElementById('route-content'),t=currentTrip();if(!t){host.innerHTML='<div class="route-card"><p>还没有埃及行程。先挑一处想去的博物馆，再建立旅程。</p><a href="./?atlasPlan=egypt&v=7">开始规划 ↗</a></div>';return}const day=selectedDay(t),d=day?.daily||{},places=(day?.places||[]).map(key=>guides.find(guide=>guide.name+'|'+guide.city===key)).filter(Boolean),route=places.length>1?`https://www.google.com/maps/dir/?api=1&origin=${places[0].lat}%2C${places[0].lon}&destination=${places.at(-1).lat}%2C${places.at(-1).lon}${places.length>2?'&waypoints='+places.slice(1,-1).map(p=>`${p.lat}%2C${p.lon}`).join('%7C'):''}&travelmode=driving`:null;host.innerHTML=`<div class="route-card"><p><strong>第${dayIndex+1}天 · ${escapeHtml(day.date)}</strong></p><p>所在地区：${escapeHtml(d.area||'待填写')} · 今晚住宿：${escapeHtml(d.hotel||'待填写')}</p><p>移动：${escapeHtml([d.from,d.transport,d.to].filter(Boolean).join(' → ')||'待填写')}${d.flight?' · '+escapeHtml(d.flight):''}</p><p>当天预算：${Number(d.dayBudget||0)>0?'¥'+Number(d.dayBudget).toLocaleString():'待填写'}</p>${places.length?`<ol>${places.map(p=>`<li>${escapeHtml(p.name)}</li>`).join('')}</ol>`:'<p>这一天还没有收录在地图上的地点，点图钉就能加入。</p>'}${route?`<a href="${route}" target="_blank" rel="noopener noreferrer">在谷歌地图规划真实道路 ↗</a>`:''}<a class="route-edit" href="./?openTrip=${encodeURIComponent(t.id)}&v=7">编辑这一天的交通、住宿和预算 ↗</a><p class="footnote">地图和旅行工作台读取同一份浏览器行程；道路与路况由谷歌地图打开后计算。</p></div>`}
function focusPlace(place,zoom){if(map)map.flyTo({center:[place.lon,place.lat],zoom,pitch:58,bearing:-15,essential:false});else if(leafletMap)leafletMap.flyTo([place.lat,place.lon],zoom,{animate:false})}
function select(id,fromMap=false){if(!byId.has(id))return;stopSpeech();selectedId=id;renderList();renderGuide();updateMarkers();const place=byId.get(id);focusPlace(place,Math.max(map?.getZoom()||leafletMap?.getZoom()||10,15));if(fromMap||window.innerWidth<760)document.getElementById('guide').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'})}
function stopSpeech(){if('speechSynthesis'in window)window.speechSynthesis.cancel();speaking=false;narration=[];document.getElementById('speak-guide').textContent='▷ 朗读讲解'}
function speakNext(){if(!speaking||!narration.length){stopSpeech();return}const text=narration.shift(),utterance=new SpeechSynthesisUtterance(text);utterance.lang='zh-CN';utterance.rate=.9;utterance.onend=()=>speakNext();utterance.onerror=()=>{stopSpeech();notify('语音朗读不可用，仍可阅读完整讲解')};window.speechSynthesis.speak(utterance)}
document.getElementById('speak-guide').addEventListener('click',()=>{if(speaking){stopSpeech();return}if(!('speechSynthesis'in window)){notify('这台设备不支持文字朗读，请阅读下方讲解');return}const place=byId.get(selectedId);narration=[place.name,place.lead,...place.sections.flatMap(s=>[s.title,s.body])];speaking=true;document.getElementById('speak-guide').textContent='■ 停止朗读';speakNext()});
document.getElementById('view-place').addEventListener('click',()=>{const place=byId.get(selectedId);if(map||leafletMap){focusPlace(place,16);document.getElementById('map-title').scrollIntoView({block:'start',behavior:'smooth'})}else window.open(`https://www.google.com/maps/search/?api=1&query=${place.lat}%2C${place.lon}`,'_blank','noopener')});
document.getElementById('reset-view').addEventListener('click',()=>{if(map)map.flyTo({center:[31.188,30.011],zoom:10.4,pitch:48,bearing:-12,essential:false});else leafletMap?.setView([30.011,31.188],10)});
document.getElementById('place-list').addEventListener('click',event=>{const button=event.target.closest('[data-place]');if(button)select(button.dataset.place)});
document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{filter=button.dataset.filter;document.querySelectorAll('[data-filter]').forEach(item=>{const active=item===button;item.classList.toggle('selected',active);item.setAttribute('aria-pressed',String(active))});renderList()}));
window.addEventListener('pagehide',stopSpeech);
renderList();renderGuide();renderRoute();try{initMap()}catch(error){status.hidden=false;status.textContent='地图组件未能启动，地点与讲解仍可阅读。';console.error('Atlas map initialization failed',error)}
