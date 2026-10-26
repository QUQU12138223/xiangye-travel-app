/* 向野地点适配层：目录、地图、搜索与行程共用原有地点对象和稳定 ID。 */
(() => {
  const guides=window.XIANGYE_EGYPT_GUIDES||[];
  const guideByKey=new Map(guides.map(g=>[`${g.name}|${g.city}`,g]));
  const official={
    '故宫博物院':'https://www.dpm.org.cn/Visit.html',
    '天坛公园':'https://www.tiantanpark.cn/en/index.html',
    '中国国家博物馆':'https://www.chnmuseum.cn/cg/',
    '清水寺':'https://www.kiyomizudera.or.jp/en/location/',
    '京都国立博物馆':'https://www.kyohaku.go.jp/jp/visit/info/',
    '伏见稻荷大社':'https://inari.jp/en/history/'
  };
  const finite=value=>value!==null&&value!==undefined&&value!==''&&Number.isFinite(Number(value));
  const coordinates=p=>finite(p?.lat)&&finite(p?.lon)&&Math.abs(Number(p.lat))<=90&&Math.abs(Number(p.lon))<=180;
  const idOf=(p,key,index)=>guideByKey.get(`${p.name}|${p.city}`)?.id||p.id||`${key}:${index}`;
  const enrich=(p,key,index)=>{
    if(!p)return null;
    const guide=guideByKey.get(`${p.name}|${p.city}`);
    p.id=idOf(p,key,index);p.kind=p.kind||'地点';
    p.summary=p.summary||guide?.lead||'此地点尚无核实的简介。';
    p.sources=guide?.sources||p.sources||(official[p.name]?[{label:'官方参观资料',url:official[p.name]}]:p.query?[{label:'百科检索（待核对）',url:`https://zh.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(p.query)}`}]:[]);
    p.openingUrl=(p.name==='伏见稻荷大社'?null:official[p.name])||p.openingUrl||null;
    p.positionStatus=p.positionStatus||(coordinates(p)?'已有坐标，出行前请核对入口位置':'坐标待核对');
    if(guide)p.guide=guide;
    return p;
  };
  for(const [key,d] of Object.entries(CATALOG))d.places?.forEach((p,i)=>enrich(p,key,i));
  const destination=t=>t?.destinationData||CATALOG[t?.key]||null;
  const forDestination=d=>(d?.places||[]).map((p,i)=>enrich(p,d.key||d.name||'remote',i));
  const byId=(id,d)=>forDestination(d).find(p=>p.id===id)||null;
  const byKey=(key,d)=>forDestination(d).find(p=>`${p.name}|${p.city||''}`===key)||null;
  const distanceKm=(a,b)=>{if(!coordinates(a)||!coordinates(b))return Infinity;const rad=Math.PI/180,p1=Number(a.lat)*rad,p2=Number(b.lat)*rad,dl=(Number(b.lon)-Number(a.lon))*rad,dp=p2-p1,x=Math.sin(dp/2)**2+Math.cos(p1)*Math.cos(p2)*Math.sin(dl/2)**2;return 6371*2*Math.atan2(Math.sqrt(x),Math.sqrt(1-x))};
  window.XIANGYE_PLACES={coordinates,enrich,forDestination,destination,byId,byKey,distanceKm};
  loadNearby=async function(r){if(!coordinates(r))return;const destinationId=state.destination?.key;try{const url=`https://zh.wikipedia.org/w/api.php?action=query&generator=geosearch&ggscoord=${r.lat}%7C${r.lon}&ggsradius=10000&ggslimit=15&prop=coordinates%7Cpageimages%7Cextracts&pithumbsize=300&exintro=1&explaintext=1&exsentences=2&format=json&origin=*`;const json=await fetchJson(url);if(state.destination?.key!==destinationId)return;state.destination.places=Object.values(json.query?.pages||{}).filter(p=>p.title!==r.name).slice(0,12).map(p=>({name:p.title,city:r.name,kind:/博物馆|museum/i.test(p.title)?'博物馆':'景点',summary:p.extract||'可打开百科核对资料。',photo:p.thumbnail?.source,query:p.title,lat:p.coordinates?.[0]?.lat,lon:p.coordinates?.[0]?.lon,sources:[{label:'维基百科原页面',url:`https://zh.wikipedia.org/?curid=${p.pageid}`}],time:'请自行安排',cost:0}));forDestination(state.destination);render()}catch{if(state.destination?.key===destinationId){state.destination.intro+=' 附近资料暂时无法加载；你仍可搜索具体地点。';render()}}};
})();
