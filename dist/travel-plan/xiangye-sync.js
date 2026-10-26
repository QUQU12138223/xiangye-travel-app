/* Keep the original template's local To Do edits visible in Xiangye's checklist. */
(() => {
  const id = new URLSearchParams(location.search).get('trip');
  if (!id) return;
  const key=`travel-plan:runtime:v1:${encodeURIComponent(id)}`;
  const showRealMap=()=>{try{const trips=JSON.parse(localStorage.getItem('xiangye-trips')||'[]');const trip=trips.find(item=>item.id===id);if(!(trip?.key==='egypt'||trip?.destination==='埃及'))return;document.body.classList.add('xiangye-egypt');const route=document.getElementById('route');if(route&&!route.querySelector('.xiangye-real-map-link')){const a=document.createElement('a');a.className='xiangye-real-map-link';a.href=`../egypt-atlas.html?trip=${encodeURIComponent(id)}`;a.textContent='打开开罗—吉萨真实地图与博物馆讲解 ↗';route.querySelector('.section-heading')?.after(a)}}catch{}};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',showRealMap,{once:true});else showRealMap();
  window.addEventListener('pagehide', () => {
    try {
      const snapshot=JSON.parse(localStorage.getItem(key)||'null');
      if (!snapshot?.todos) return;
      const all=JSON.parse(localStorage.getItem('xiangye-trips')||'[]');
      const trip=all.find(item=>item.id===id);
      if (!trip) return;
      trip.checked=trip.checked||{};
      trip.customItems=trip.customItems||[];
      const known=new Set(trip.customItems.map(item=>item.id));
      for (const todo of snapshot.todos) {
        const todoId=String(todo.id||'');
        if (!todoId) continue;
        if (todoId.startsWith('custom:')) {
          const customId=todoId.slice(7);
          if (!known.has(customId)) { trip.customItems.push({id:customId,label:String(todo.text||'').slice(0,80)}); known.add(customId); }
          trip.checked[todoId]=Boolean(todo.completed);
        } else if (todoId.startsWith('todo-')) {
          if (!known.has(todoId)){trip.customItems.push({id:todoId,label:String(todo.text||'').slice(0,80)});known.add(todoId);}
          trip.checked[`custom:${todoId}`]=Boolean(todo.completed);
        } else trip.checked[todoId]=Boolean(todo.completed);
      }
      localStorage.setItem('xiangye-trips',JSON.stringify(all));
    } catch (error) { console.warn('向野清单同步未完成',error); }
  });
})();
