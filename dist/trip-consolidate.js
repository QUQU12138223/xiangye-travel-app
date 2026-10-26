/* One journey record: map, daily logistics, bookings and expenses share the same saved trip. */
(() => {
  const previous=renderTrip;
  const safe=value=>escapeHtml(String(value??''));
  function headingBefore(node){const previous=node?.previousElementSibling;if(previous?.classList.contains('section-heading'))previous.remove()}
  renderTrip=function(){
    const markup=previous().replace('埃及地图上的地点会同步到下方每日景点。','地点与地图使用同一份每日清单。').replaceAll('景点仍在下方增减。','景点请在当天地图增减。'),t=trip();if(!t)return markup;
    const template=document.createElement('template');template.innerHTML=markup;
    const root=template.content,map=root.querySelector('.trip-map-workspace'),daily=root.querySelector('.daily-workspace');
    if(!map||!daily)return markup;
    map.after(daily);
    const timeline=root.querySelector('.timeline');headingBefore(timeline);timeline?.remove();
    const infoGrid=root.querySelector('.info-grid'),infoForm=root.querySelector('#tripInfoForm');
    const infoHeading=[...root.querySelectorAll('.section-heading')].find(x=>x.textContent.includes('旅行资料夹'));
    if(infoHeading){const note=infoHeading.nextElementSibling;infoHeading.remove();if(note?.classList.contains('section-note'))note.remove()}
    infoGrid?.remove();
    const expenseSplit=[...root.querySelectorAll('.section-heading')].find(x=>x.textContent.includes('费用拆分'));
    if(expenseSplit){const grid=expenseSplit.nextElementSibling,note=grid?.nextElementSibling;expenseSplit.remove();if(grid?.classList.contains('budget-grid'))grid.remove();if(note?.classList.contains('section-note'))note.remove()}
    for(const [i,day] of t.days.entries()){
      const body=root.querySelector(`.daily-card[data-index="${i}"] .daily-body`);if(!body)continue;
      const block=document.createElement('div');block.className='daily-place-summary';
      block.innerHTML=`<strong>这一天的地点</strong><p>${day.places.length?day.places.map((key,j)=>`${j+1}. ${safe(XIANGYE_PLACES.byKey(key,XIANGYE_PLACES.destination(t))?.name||key.split('|')[0])}`).join(' · '):'还没有安排地点，留白也可以。'}</p><button type="button" class="secondary" data-action="trip-map-day" data-day="${i}">在地图编辑这一天 ↗</button>`;
      body.insertBefore(block,body.querySelector('.daily-form'));
    }
    const extra=document.createElement('details');extra.className='trip-supplement';extra.innerHTML='<summary>票据与全程补充资料 <span>有需要再填写</span></summary><p class="section-note">详细航班、租车、票据和全程备注放在这里；每天的交通与住宿请在上方填写。</p>';
    const integrated=root.querySelector('.integrated-workspace'),booking=root.querySelector('.booking-details');
    if(booking)extra.append(booking);if(infoForm)extra.append(infoForm);if(integrated)extra.append(integrated);
    daily.after(extra);
    return template.innerHTML;
  };
})();
