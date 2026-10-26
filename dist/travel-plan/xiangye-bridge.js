/* MIT-based Travel-Plan-Page runtime adapter. Original runtime retained alongside this file. */
(() => {
  const originalFetch = window.fetch.bind(window);
  const params = new URLSearchParams(location.search);
  const selectedId = params.get('trip');
  const read = key => { try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch { return null; } };
  const trips = read('xiangye-trips') || [];
  const chosen = trips.find(item => item.id === selectedId) || trips[0];
  const bridge = read('xiangye-bridge-trip');
  const destination = bridge?.trip?.id === chosen?.id ? bridge.destination : chosen?.destinationData;
  if (!chosen) return;
  const catalog = Array.isArray(destination?.places) ? destination.places : [];
  const keyFor = place => `${place.name}|${place.city || ''}`;
  const uniqueKeys = [...new Set(chosen.days.flatMap(day => day.places || []))];
  const locations = uniqueKeys.map((key, index) => {
    const item = catalog.find(place => keyFor(place) === key || place.name === key.split('|')[0]) || {};
    return { id:`place-${index + 1}`, key, name:item.name || key.split('|')[0], city:item.city || destination?.center || chosen.destination,
      lat:Number(item.lat), lon:Number(item.lon), query:item.query || item.name || key.split('|')[0], cost:Number(item.cost || 0) };
  });
  const geocoded = locations.filter(place => Number.isFinite(place.lat) && Number.isFinite(place.lon));
  const west=Math.min(...geocoded.map(place => place.lon)), east=Math.max(...geocoded.map(place => place.lon));
  const south=Math.min(...geocoded.map(place => place.lat)), north=Math.max(...geocoded.map(place => place.lat));
  const positioned = locations.map((place,index) => {
    const usable=Number.isFinite(place.lat)&&Number.isFinite(place.lon)&&geocoded.length>1;
    const x=usable?260+(place.lon-west)/Math.max(0.01,east-west)*900:250+(index%4)*250;
    const y=usable?820-(place.lat-south)/Math.max(0.01,north-south)*580:360+Math.floor(index/4)*160;
    return {id:place.id,label:place.name,lines:[place.name],x,y,query:place.query,color:['#ec8eb8','#e1ac38','#76b3d5','#98b77c'][index%4]};
  });
  const days = chosen.days.map((day,index) => {
    const places=(day.places || []).map(key => locations.find(place => place.key === key)).filter(Boolean);
    return {id:`day-${index+1}`,day:index+1,date:day.date,title:places.length?places.map(place => place.name).join(' · '):'留白的一天',
      locations:places.map(place => place.city),schedule:places.map((place,i) => ({id:`schedule-${index+1}-${i+1}`,time:`${String(9+i*3).padStart(2,'0')}:00`,text:place.name,type:'attraction',placeId:place.id})),notes:[],costReferences:[]};
  });
  const routes=days.filter(day => day.schedule.length>1).map(day => ({day:day.day,placeIds:day.schedule.map(item => item.placeId)}));
  const tickets=days.flatMap(day => day.schedule.map(item => {
    const place=locations.find(loc => loc.id===item.placeId);
    return place?.cost>0?{id:`ticket-${item.id}`,dayId:day.id,name:place.name,requirement:'needs-confirmation',guidance:'票价只是向野的粗略参考；请核对官方渠道。',scheduleItemIds:[item.id]}:null;
  }).filter(Boolean));
  const booking=chosen.bookings||{},flight=booking.flight,rental=booking.rental;
  const journeys=flight?[{id:'xiangye-flight',title:`${flight.fromCity} → ${flight.toCity}`}]:[];
  const flights=flight?[{id:'xiangye-flight-leg',journeyId:'xiangye-flight',sequence:1,flightNumber:flight.number,airline:{nameZh:flight.airline,name:flight.airline},
    departure:{date:flight.departDate,time:flight.departTime,airportCode:flight.fromCode,city:flight.fromCity,utcOffset:flight.departureOffset},
    arrival:{date:flight.arriveDate,time:flight.arriveTime,airportCode:flight.toCode,city:flight.toCity,utcOffset:flight.arrivalOffset}}]:[];
  const rentalCar=rental?{company:rental.company,pickup:{date:rental.pickupDate,time:rental.pickupTime,location:rental.pickupLocation,address:'',utcOffset:rental.offset},
    dropoff:{date:rental.dropoffDate,time:rental.dropoffTime,vehicleReturnPoint:rental.dropoffLocation,utcOffset:rental.offset,timeZoneLabel:`UTC${rental.offset}`,deadlineWarning:'以租车订单的实际还车要求为准。',recommendedArrivalTime:'请按订单核对'},
    rentalPeriodDays:Math.max(1,Math.ceil((new Date(rental.dropoffDate)-new Date(rental.pickupDate))/86400000)),vehicle:{example:'已预订车辆',class:'车型请核对订单'},price:{currency:'CNY',payAtCounter:Number(rental.price)},insurance:[],unlimitedKilometers:false}:null;
  tickets.push(...(booking.tickets||[]).map(ticket=>{
    const day=days[Number(ticket.day)];if(!day)return null;
    const itemId=`ticket-item-${ticket.id}`;
    day.schedule.push({id:itemId,time:'待确认',text:`票据：${ticket.name}`,type:'note'});
    return {id:`booked-${ticket.id}`,dayId:day.id,name:ticket.name,requirement:'needs-confirmation',guidance:'确认预约时间、入场规则和票据内容。',documentUrl:ticket.url||'',scheduleItemIds:[itemId]};
  }).filter(Boolean));
  const allChecked=chosen.checked || {};
  const data={schemaVersion:'2.0-lite',config:{schemaVersion:'1.0.0',modules:{flights:flights.length>0,overview:positioned.length>0,itinerary:true,todo:true,driving:Boolean(rentalCar),ledger:true},language:'zh-CN',persistence:{mode:'local'}},
    metadata:{tripId:chosen.id,title:`${chosen.destination} · 向野旅行`,language:'zh-CN',assets:{}},
    trip:{status:'planned',startDate:chosen.start,endDate:chosen.end,dayCount:days.length,nightCountAway:Math.max(0,days.length-1),countries:[{code:chosen.region==='国内'?'CN':'XX',nameZh:destination?.country || chosen.destination,nameEn:destination?.country || chosen.destination}],primaryDestinationCountries:[chosen.region==='国内'?'CN':'XX'],primaryDestinationName:chosen.destination,heroTitle:chosen.destination,heroEyebrow:'XIANGYE JOURNEY',citiesAndAreas:[...new Set(locations.map(place => place.city))],routeSummary:`${chosen.origin} → ${chosen.destination}`,groupSize:chosen.people},
    flightJourneys:journeys,flights,accommodations:chosen.info?.hotel?[{name:chosen.info.hotel}]:[],groundTransport:{rentalCar,rentalChecklist:[],drivingNotes:[],drivingReferenceLinks:[],plannedRoadLegs:[],publicTransitAndRail:[]},
    days,places:locations.map(place => ({id:place.id,name:place.name,nameZh:place.name,cityOrArea:place.city,geo:{lat:place.lat,lng:place.lon},navigation:{query:place.query}})),restaurants:[],bookingsAndTickets:[],
    ticketPlanning:{statusStorage:'local',statusStorageNote:'状态仅保存在当前浏览器。',items:tickets},
    preTrip:{todoItems:[...(bridge?.checklist || [])].map((item,index) => ({id:item.id || `prep-${index}`,text:item.label,completed:Boolean(allChecked[item.id])})),packingItems:[],preparationsExplicitlyMentioned:[],missingNote:''},
    mapLinks:{providedGoogleMapsLinks:[],note:'',cityLevelNavigationDisabled:false,navigationPolicy:{noNavigationTypes:['flight','rest'],selfNavigationTypes:['attraction','walk','drive','transfer']},navigationPlaces:[]},
    routeMap:{defaultRegionId:'journey',regions:[{id:'journey',label:chosen.destination,canvas:{width:1448,height:1086},baseImage:'assets/maps/templates/template-04-urban.webp',heading:{text:chosen.destination,x:45,y:100},ariaLabel:`${chosen.destination}行程示意图`,description:'模板示意图；地点位置和连接顺序仅供规划，实际导航请打开地图服务。',disclaimer:'模板示意图，不代表真实地理边界；点地点可打开真实地图。',places:positioned,routes,overviewPlaceIds:positioned.map(place => place.id)}]}
  };
  window.fetch=(input,options) => {
    const url=typeof input==='string'?input:input?.url || '';
    if (url === 'trip-data.json' || url.endsWith('/trip-data.json')) return Promise.resolve(new Response(JSON.stringify(data),{status:200,headers:{'Content-Type':'application/json'}}));
    return originalFetch(input,options);
  };
})();
