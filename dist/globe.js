/* 向野地球：离线可用的 Canvas 正射投影，国界数据单独加载。 */
(() => {
  const rad = Math.PI / 180;
  const palettes = ['#f5d1d9','#f2d9a6','#d1e1c1','#cbd8ed','#e0d1e9','#f5e1c8','#c3dcd9'];
  let countries = [];
  fetch('./world.geojson').then(r => r.json()).then(data => {
    countries = data.features || [];
    window.dispatchEvent(new Event('xiangye:globe-data'));
  }).catch(() => {});

  function inRing(point, ring) {
    let inside = false;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const a = ring[i], b = ring[j];
      if ((a[1] > point[1]) !== (b[1] > point[1]) && point[0] < (b[0]-a[0])*(point[1]-a[1])/(b[1]-a[1])+a[0]) inside = !inside;
    }
    return inside;
  }
  function countryAt(lat, lon) {
    if (lat < -60) return 'Antarctica';
    if (lat > 66) return 'Arctic';
    for (const feature of countries) {
      const geometry = feature.geometry;
      if (!geometry) continue;
      const polys = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.type === 'MultiPolygon' ? geometry.coordinates : [];
      if (polys.some(rings => rings.length && inRing([lon,lat], rings[0]) && !rings.slice(1).some(hole => inRing([lon,lat],hole)))) return feature.properties?.name || '未知地区';
    }
    return '';
  }
  function mount() {
    const canvas = document.getElementById('globeCanvas')||document.getElementById('memoryGlobeCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const host = canvas.parentElement;
    const view = {lon: 20, lat: 15, zoom: 1, selected: null};
    let width = 0, height = 0, radius = 0, pointer = null, moved = false;
    const reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
    let idleUntil=0,lastFrame=0,visible=true;
    const pauseAuto=()=>{idleUntil=performance.now()+2500};
    const clamp = (v,min,max) => Math.min(max,Math.max(min,v));
    const project = (lon,lat) => {
      const phi = lat*rad, phi0 = view.lat*rad, dl = (lon-view.lon)*rad;
      const visible = Math.sin(phi0)*Math.sin(phi)+Math.cos(phi0)*Math.cos(phi)*Math.cos(dl) > 0;
      return {x:width/2+radius*Math.cos(phi)*Math.sin(dl), y:height/2-radius*(Math.cos(phi0)*Math.sin(phi)-Math.sin(phi0)*Math.cos(phi)*Math.cos(dl)), visible};
    };
    const inverse = (x,y) => {
      const xx=(x-width/2)/radius, yy=(height/2-y)/radius, rho=Math.hypot(xx,yy);
      if (rho>1) return null;
      if (rho<1e-8) return {lat:view.lat,lon:view.lon};
      const c=Math.asin(rho), phi0=view.lat*rad;
      const lat=Math.asin(Math.cos(c)*Math.sin(phi0)+yy*Math.sin(c)*Math.cos(phi0)/rho)/rad;
      let lon=view.lon+Math.atan2(xx*Math.sin(c),rho*Math.cos(phi0)*Math.cos(c)-yy*Math.sin(phi0)*Math.sin(c))/rad;
      lon=((lon+540)%360)-180;
      return {lat,lon};
    };
    function draw() {
      if (!canvas.isConnected) return;
      ctx.clearRect(0,0,width,height);
      const cx=width/2,cy=height/2;
      const glow=ctx.createRadialGradient(cx-radius*.38,cy-radius*.48,radius*.08,cx,cy,radius*1.2);
      glow.addColorStop(0,'#effcf9');glow.addColorStop(.7,'#cbe9e9');glow.addColorStop(1,'#aed3dd');
      ctx.fillStyle=glow;ctx.beginPath();ctx.arc(cx,cy,radius,0,Math.PI*2);ctx.fill();
      ctx.save();ctx.beginPath();ctx.arc(cx,cy,radius,0,Math.PI*2);ctx.clip();
      ctx.strokeStyle='#ffffff78';ctx.lineWidth=.8;
      for(let lat=-60;lat<=60;lat+=30){ctx.beginPath();let started=false;for(let lon=-180;lon<=180;lon+=3){const p=project(lon,lat);if(p.visible){if(!started)ctx.moveTo(p.x,p.y);else ctx.lineTo(p.x,p.y);started=true}else started=false}ctx.stroke()}
      for(let lon=-180;lon<180;lon+=30){ctx.beginPath();let started=false;for(let lat=-90;lat<=90;lat+=3){const p=project(lon,lat);if(p.visible){if(!started)ctx.moveTo(p.x,p.y);else ctx.lineTo(p.x,p.y);started=true}else started=false}ctx.stroke()}
      countries.forEach((feature,index)=>{
        const geometry=feature.geometry;if(!geometry)return;
        const polys=geometry.type==='Polygon'?[geometry.coordinates]:geometry.type==='MultiPolygon'?geometry.coordinates:[];
        const memory=canvas.id==='memoryGlobeCanvas'&&window.XIANGYE_MEMORY?.countryColor?.(feature.properties?.name);
        ctx.fillStyle=canvas.id==='memoryGlobeCanvas'?(memory||'#eee8df'):palettes[index%palettes.length];ctx.strokeStyle=canvas.id==='memoryGlobeCanvas'?'#c9bdb0':'#fffaf0';ctx.lineWidth=.75;
        for(const rings of polys){
          for(const ring of rings){ctx.beginPath();let previous=false, visibleCount=0;
            for(const point of ring){const p=project(point[0],point[1]);if(p.visible){if(previous)ctx.lineTo(p.x,p.y);else ctx.moveTo(p.x,p.y);visibleCount++;}previous=p.visible}
            if(visibleCount>2){ctx.fill();ctx.stroke()}
          }
        }
      });
      ctx.restore();
      ctx.strokeStyle='#ffffffd9';ctx.lineWidth=2;ctx.beginPath();ctx.arc(cx,cy,radius,0,Math.PI*2);ctx.stroke();
      if(view.selected){const p=project(view.selected.lon,view.selected.lat);if(p.visible){ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(p.x,p.y,8,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#b56078';ctx.lineWidth=3;ctx.beginPath();ctx.arc(p.x,p.y,6,0,Math.PI*2);ctx.stroke()}}
    }
    function resize(){const rect=host.getBoundingClientRect(), dpr=Math.min(devicePixelRatio||1,2);width=rect.width;height=rect.height;radius=Math.min(width,height)*.455*view.zoom;canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);draw()}
    function select(lat,lon){view.selected={lat,lon};const country=countryAt(lat,lon);draw();document.dispatchEvent(new CustomEvent('xiangye:globe-select',{detail:{lat,lon,country}}))}
    canvas.addEventListener('pointerdown',e=>{pauseAuto();pointer={x:e.clientX,y:e.clientY,lon:view.lon,lat:view.lat};moved=false;canvas.setPointerCapture(e.pointerId)});
    canvas.addEventListener('pointermove',e=>{if(!pointer)return;const dx=e.clientX-pointer.x,dy=e.clientY-pointer.y;if(Math.hypot(dx,dy)>4)moved=true;if(moved){view.lon=((pointer.lon-dx/width*220+540)%360)-180;view.lat=clamp(pointer.lat+dy/height*130,-80,80);draw()}});
    canvas.addEventListener('pointerup',e=>{if(!pointer)return;pauseAuto();const rect=canvas.getBoundingClientRect();if(!moved){const at=inverse(e.clientX-rect.left,e.clientY-rect.top);if(at)select(at.lat,at.lon)}pointer=null});
    canvas.addEventListener('pointercancel',()=>{pointer=null;pauseAuto()});
    canvas.addEventListener('wheel',e=>{e.preventDefault();pauseAuto();view.zoom=clamp(view.zoom+(e.deltaY<0?.08:-.08),.76,1.16);resize()},{passive:false});
    host.querySelectorAll('[data-globe-zoom]').forEach(b=>b.addEventListener('click',()=>{pauseAuto();view.zoom=clamp(view.zoom+(b.dataset.globeZoom==='in'?.12:-.12),.76,1.16);resize()}));
    host.querySelectorAll('[data-globe-preset]').forEach(b=>b.addEventListener('click',()=>{pauseAuto();const [lat,lon]=b.dataset.globePreset.split(',').map(Number);view.lat=clamp(lat,-80,80);view.lon=lon;select(lat,lon)}));
    const observer=new ResizeObserver(resize);observer.observe(host);
    const redraw=()=>draw();window.addEventListener('xiangye:globe-data',redraw,{once:true});
    resize();
    const visibility=new IntersectionObserver(entries=>{visible=entries[0]?.isIntersecting??false});visibility.observe(canvas);
    function animate(now){
      if(!canvas.isConnected){visibility.disconnect();observer.disconnect();return}
      if(now-lastFrame>=33){
        const elapsed=lastFrame?Math.min(now-lastFrame,100):33;lastFrame=now;
        if(visible&&!document.hidden&&!reduceMotion.matches&&!pointer&&now>=idleUntil){
          view.lon=((view.lon+elapsed*.001+540)%360)-180;
          draw();
        }
      }
      requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
  }
  window.mountXiangyeGlobe=mount;
  window.xiangyeCountryAt=countryAt;
})();
