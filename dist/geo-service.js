/* Small-scale, user-triggered geocoding. No autocomplete or bulk collection. */
(() => {
  const root='https://nominatim.openstreetmap.org';
  const cache=new Map();
  let queue=Promise.resolve(),nextAt=0;
  async function request(path){
    if(cache.has(path))return cache.get(path);
    const job=queue.catch(()=>{}).then(async()=>{
      const delay=Math.max(0,nextAt-Date.now());
      if(delay)await new Promise(resolve=>setTimeout(resolve,delay));
      nextAt=Date.now()+1200;
      const response=await fetch(root+path,{referrerPolicy:'strict-origin-when-cross-origin'});
      if(!response.ok)throw new Error(`地点服务暂不可用 (${response.status})`);
      const data=await response.json();
      if(cache.size>80)cache.delete(cache.keys().next().value);
      cache.set(path,data);return data;
    });
    queue=job.then(()=>{},()=>{});
    return job;
  }
  window.XIANGYE_GEO={
    search(name){return request(`/search?format=jsonv2&q=${encodeURIComponent(name)}&limit=5&addressdetails=1&accept-language=zh-CN`);},
    reverse(lat,lon){return request(`/reverse?format=jsonv2&lat=${Number(lat).toFixed(5)}&lon=${Number(lon).toFixed(5)}&zoom=10&addressdetails=1&accept-language=zh-CN`);},
    source:root,
  };
})();
