/* 地球点选先保留坐标；只有附近确有已收录地点时才推荐该地点。 */
(() => {
  const registry=window.XIANGYE_PLACES;
  const ports=[{name:'乌斯怀亚',lat:-54.8019,lon:-68.303,region:'南美南端'}, {name:'朗伊尔城',lat:78.2232,lon:15.6267,region:'斯瓦尔巴'}, {name:'雷克雅未克',lat:64.1466,lon:-21.9426,region:'冰岛'}, {name:'开普敦',lat:-33.9249,lon:18.4241,region:'南非'}];
  const originalCard=globeSpotCard;
  let lookupSerial=0;
  async function identifyLand(spot,lat,lon){
    const serial=++lookupSerial;
    try{
      const data=await XIANGYE_GEO.reverse(lat,lon);if(serial!==lookupSerial||state.globeSpot!==spot)return;
      const address=data.address||{},local=address.town||address.village||address.county||address.district||address.city||address.state||data.name,name=[local,address.city&&address.city!==local?address.city:null].filter(Boolean).join(' · ');
      if(!name)return;
      const nearest=Object.entries(CATALOG).filter(([,d])=>d.type==='city'&&registry.coordinates(d)).map(([key,d])=>({key,d,km:registry.distanceKm({lat,lon},d)})).sort((a,b)=>a.km-b.km)[0];
      if(nearest?.km<25){spot.destination={key:nearest.key,...nearest.d};spot.destination.places=[...nearest.d.places];spot.note=`所选坐标在${name}附近；距离${nearest.d.name}中心约 ${Math.round(nearest.km)} 公里。打开可看这座城市的攻略，坐标仍按原位置显示。`}
      else{spot.destination.name=name;spot.destination.center=name;spot.destination.country=address.country||spot.destination.country;spot.note=`这里是${name}附近。位置名称来自 OpenStreetMap；景点和路线请继续核对。`}
      document.getElementById('globeSpot').innerHTML=globeSpotCard();
    }catch{if(serial===lookupSerial&&state.globeSpot===spot){spot.note='已保留准确坐标；附近地名暂时无法查询。你仍可按坐标探索。';document.getElementById('globeSpot').innerHTML=globeSpotCard()}}
  }
  globeSpotCard=function(){const s=state.globeSpot;if(!s)return originalCard();const ocean=s.type==='海洋坐标',polar=s.type==='极地探索',near=s.near||[],port=s.port;return `<div class="spot-card"><span class="spot-kicker">${escapeHtml(s.type)} · ${s.lat.toFixed(3)}°, ${s.lon.toFixed(3)}°</span><h2>${escapeHtml(ocean?'海面上的一点':polar?s.destination.name:s.destination.name)}</h2><p>${escapeHtml(s.note)}</p>${near.length?`<p><strong>已收录的附近地点</strong>：${near.map(p=>escapeHtml(p.name)).join('、')}</p>`:'<p>这个坐标附近暂未核实可参观的地点；不会自动放一个城市景点在这里。</p>'}${port?`<p class="spot-port">${ocean?'相对较近的港口参考':'常见探险门户'}：${escapeHtml(port.name)}（${escapeHtml(port.region)}）。航线、接驳和可达性仍需向运营方核对。</p>`:ocean?'<p>暂未核实附近的合适出发港。可以先用坐标在地图中查看周边海岸。</p>':''}<div class="actions"><button class="primary" data-action="globe-explore">查看这里的资料</button><button class="secondary" data-action="globe-plan">规划这里</button></div></div>`};
  document.addEventListener('xiangye:globe-select',event=>{const s=state.globeSpot;if(!s)return;const {lat,lon}=event.detail,ocean=s.type==='海洋坐标',polar=s.type==='极地探索';const p={lat,lon};s.near=Object.values(CATALOG).flatMap(d=>registry.forDestination(d)).filter(x=>registry.coordinates(x)&&registry.distanceKm(p,x)<=60).sort((a,b)=>registry.distanceKm(p,a)-registry.distanceKm(p,b)).slice(0,3);s.port=null;if(ocean){s.port=ports.sort((a,b)=>registry.distanceKm(p,a)-registry.distanceKm(p,b)).find(x=>registry.distanceKm(p,x)<450)||null;s.near=[]}else if(polar){s.near=[];s.port=lat<0?ports[0]:ports[1]}else{s.destination=remoteDestination({name:`所选坐标 ${lat.toFixed(2)}°, ${lon.toFixed(2)}°`,country:s.destination.country||s.destination.name,lat,lon,countryCode:event.detail.country==='China'?'CN':''});s.destination.places=[...s.near];s.note='正在识别附近城市；你点选的坐标已保留。';identifyLand(s,lat,lon)}document.getElementById('globeSpot').innerHTML=globeSpotCard()});
})();
