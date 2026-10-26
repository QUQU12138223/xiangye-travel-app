(()=>{
  const groups=[
    {name:'证件与入境',color:'yellow',ids:['id','visa','entry'],hint:'先核对证件和入境资格'},
    {name:'交通与路线',color:'blue',ids:['transport'],hint:'确认去程、返程及接驳'},
    {name:'住宿与预订',color:'pink',ids:['hotel'],hint:'确认每晚的落脚处'},
    {name:'每日行程',color:'lilac',ids:[],hint:'为每一天安排真实的地点'},
    {name:'健康与随身',color:'green',ids:['insurance','money','mobile','weather','medicine'],hint:'保险、联络与行李'},
    {name:'当地语言',color:'orange',ids:[],hint:'学会抵达后的几句话'}
  ];
  const base=renderTrip;
  function progress(t,g){if(g.name==='每日行程'){const days=t.days||[];return {done:days.filter(d=>d.places?.length).length,total:Math.max(days.length,1)}}if(g.name==='当地语言')return {done:Math.min(3,Number(t.languageDone||0)),total:3};const ids=g.ids.filter(id=>checklistItems(t).some(x=>x.id===id));return {done:ids.filter(id=>t.checked?.[id]).length,total:ids.length}}
  function ring(t){const rows=groups.map(g=>({...g,...progress(t,g)})).filter(g=>g.total);const done=rows.reduce((n,g)=>n+g.done,0),total=rows.reduce((n,g)=>n+g.total,0),pct=Math.round(done/total*100);const radius=76,circumference=2*Math.PI*radius,slot=circumference/rows.length,gap=9;
    const arcs=rows.map((g,i)=>{const start=i*slot+gap/2,length=slot-gap,filled=length*g.done/g.total;return `<circle class="ready-track" cx="100" cy="100" r="${radius}" stroke-dasharray="${length} ${circumference-length}" stroke-dashoffset="${-start}"/><circle class="ready-fill ready-${g.color}" cx="100" cy="100" r="${radius}" stroke-dasharray="${filled} ${circumference-filled}" stroke-dashoffset="${-start}"/>`}).join('');
    return `<section class="ready-card" aria-labelledby="ready-title"><div class="ready-heading"><span class="page-overline">YOUR JOURNEY</span><h2 id="ready-title">旅行准备环</h2><p>${escapeHtml(t.destination)} · ${prettyDate(t.start)}出发</p></div><div class="ready-visual"><svg viewBox="0 0 200 200" aria-hidden="true"><g transform="rotate(-90 100 100)">${arcs}</g></svg><div class="ready-center"><strong>${pct}<small>%</small></strong><span>已准备 ${done} / ${total} 项</span></div></div><div class="ready-legend">${rows.map(g=>`<button type="button" class="ready-segment" data-ready-group="${g.name}" aria-label="${g.name}，已完成${g.done}项，共${g.total}项"><span class="ready-dot ready-${g.color}"></span><span>${g.name}<small>${g.done}/${g.total}</small></span></button>`).join('')}</div><p class="ready-next">当地语言是加分准备，不影响证件与预订事项。</p><button type="button" class="ready-cta" data-action="checklist">打开出发清单 <span aria-hidden="true">↗</span></button></section>`}
  renderTrip=function(){const html=base();const t=trip();if(!t)return html;return html.replace(/<div class="ring ring-sm"[\s\S]*?<\/span><\/div>/,'').replace(/<div class="trip-heading">/,`${ring(t)}<div class="trip-heading">`)};
  document.addEventListener('click',e=>{const b=e.target.closest('[data-ready-group]');if(!b)return;const name=b.dataset.readyGroup;if(name==='当地语言'){document.getElementById('language-lesson')?.scrollIntoView({behavior:'smooth',block:'center'});return}goto(name==='每日行程'?'trip':'checklist');if(name!=='每日行程'){requestAnimationFrame(()=>{const section=[...document.querySelectorAll('.check-section')].find(x=>x.textContent.includes(name==='证件与入境'?'证件':name==='交通与路线'||name==='住宿与预订'?'预订':'随身'));section?.scrollIntoView({behavior:'smooth',block:'start'})})}});
})();
