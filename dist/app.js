const rooms = [
  {name:'Standard Room',rate:20000,detail:'A simple stay · Wi-Fi, TV & hot shower'},
  {name:'Budget Double',rate:30000,detail:'Double bed · Wi-Fi, TV & hot shower'},
  {name:'Deluxe Room',rate:40000,detail:'A little more comfort · Fan, Wi-Fi & TV'},
  {name:'Executive Room',rate:50000,detail:'Cool and comfortable · Air conditioning'},
  {name:'Premium Airbnb Suite',rate:70000,detail:'Living area · Balcony, AC & kitchenette'},
  {name:'Royal Airbnb Apartment',rate:100000,detail:'Multiple rooms · Living room, kitchen & AC'}
];
const money=n=>new Intl.NumberFormat('en-UG').format(n);
const $=s=>document.querySelector(s);
const form=$('#booking-form'), dialog=$('#booking');
let currentStep=1, requestMessage='';
$('#year').textContent=new Date().getFullYear();
rooms.forEach((room,i)=>{
  const article=document.createElement('article'); article.className='room-item';
  article.innerHTML=`<div><h3>${room.name}</h3><p>${room.detail}</p></div><div class="room-price">UGX ${money(room.rate)}<small>from / night</small><button class="text-link" data-room="${i}">Choose room</button></div>`;
  $('#room-list').append(article);
  const option=new Option(`${room.name} · UGX ${money(room.rate)}`,String(i));$('#room-select').add(option);
});
function localDate(d){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
const today=localDate(new Date());
const tomorrow=new Date();tomorrow.setDate(tomorrow.getDate()+1);
form.elements.checkin.min=today;form.elements.checkin.value=today;
form.elements.checkout.value=localDate(tomorrow);form.elements.visitdate.min=today;form.elements.visitdate.value=today;
function syncKind(){
  const stay=form.elements.kind.value==='Stay';
  $('#stay-fields').hidden=!stay;$('#day-fields').hidden=stay;
  form.elements.checkin.required=stay;form.elements.checkout.required=stay;form.elements.visitdate.required=!stay;
  estimate();
}
function nights(){return Math.round((Date.parse(form.elements.checkout.value)-Date.parse(form.elements.checkin.value))/86400000);}
function estimate(){
  const start=form.elements.checkin.value;
  if(start){const end=new Date(start+'T12:00:00');end.setDate(end.getDate()+1);form.elements.checkout.min=localDate(end);}
  const n=nights(),room=rooms[Number(form.elements.room.value)];
  $('#estimate').textContent=n>0?`${n} night${n!==1?'s':''} · ${form.elements.count.value} room${form.elements.count.value!=='1'?'s':''} · Estimated room total: UGX ${money(n*room.rate*Number(form.elements.count.value))}. Final rate confirmed by Eden.`:'Select a check-out after your check-in.';
}
function showStep(step){
  currentStep=step;
  document.querySelectorAll('.step').forEach(el=>el.hidden=Number(el.dataset.step)!==step);
  document.querySelectorAll('.steps span').forEach((el,i)=>el.classList.toggle('active',i+1===step));
  $('#back').hidden=step===1;$('#next').hidden=step===3;$('#form-error').textContent='';
  dialog.scrollTop=0;
}
function openBooking({room,service}={}){
  form.elements.kind.value=service?'Wellness':'Stay';
  if(room!==undefined)form.elements.room.value=String(room);
  if(service)form.elements.service.value=service;
  syncKind();showStep(1);dialog.showModal();
}
document.querySelectorAll('[data-book]').forEach(el=>el.addEventListener('click',()=>openBooking()));
document.querySelectorAll('[data-room]').forEach(el=>el.addEventListener('click',()=>openBooking({room:Number(el.dataset.room)})));
document.querySelectorAll('[data-service]').forEach(el=>el.addEventListener('click',()=>openBooking({service:el.dataset.service})));
document.querySelectorAll('dialog .close').forEach(el=>el.addEventListener('click',()=>el.closest('dialog').close()));
document.querySelectorAll('dialog').forEach(el=>el.addEventListener('click',e=>{if(e.target===el){const r=el.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)el.close();}}));
form.addEventListener('change',syncKind);form.addEventListener('input',estimate);form.addEventListener('submit',e=>e.preventDefault());
function validateVisit(){
  const stay=form.elements.kind.value==='Stay';
  const fields=stay?['checkin','checkout']:['visitdate'];
  for(const name of fields){if(!form.elements[name].reportValidity())return false;}
  if(stay&&(!(nights()>0)||form.elements.checkin.value<today)){ $('#form-error').textContent='Choose a check-in from today and a later check-out.';return false;}
  if(!stay&&form.elements.visitdate.value<today){$('#form-error').textContent='Choose a visit date from today.';return false;}
  return true;
}
function buildMessage(){
  const e=form.elements; const stay=e.kind.value==='Stay';
  let msg=`Hello Eden King & Queen,\nI would like to request ${stay?'an overnight stay':'a day visit'}.\n\n`;
  if(stay){const room=rooms[Number(e.room.value)];msg+=`Room: ${room.name}\nCheck-in: ${e.checkin.value}\nCheck-out: ${e.checkout.value}\nNights: ${nights()}\nGuests: ${e.guests.value}\nRooms: ${e.count.value}\nAdvertised starting rate: UGX ${money(room.rate)} / night\nEstimated room total: UGX ${money(nights()*room.rate*Number(e.count.value))}\n`;}
  else msg+=`Experience: ${e.service.value}\nDate: ${e.visitdate.value}\nPreferred time: ${e.visittime.value||'Please advise'}\nPeople: ${e.people.value}\n`;
  msg+=`\nName: ${e.name.value.trim()}\nPhone / WhatsApp: ${e.phone.value.trim()}\n`;
  if(e.notes.value.trim())msg+=`Notes: ${e.notes.value.trim()}\n`;
  msg+='\nPlease confirm availability, the final price, and any booking requirements. Thank you.';
  return msg;
}
$('#next').addEventListener('click',()=>{
  if(currentStep===1){if(validateVisit())showStep(2);return;}
  for(const name of ['name','phone']){const field=form.elements[name];field.value=field.value.trim();if(!field.reportValidity())return;}
  if(!validateVisit()){showStep(1);$('#form-error').textContent='Please check your visit dates.';return;}
  requestMessage=buildMessage();$('#review').textContent=requestMessage;
  $('#send-whatsapp').href=`https://wa.me/256700339077?text=${encodeURIComponent(requestMessage)}`;
  $('#copy-status').textContent='';showStep(3);
});
$('#back').addEventListener('click',()=>showStep(currentStep-1));
$('#copy-message').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(requestMessage);$('#copy-status').textContent='Request copied. Paste it into your chat with Eden.';}catch{$('#copy-status').textContent='Select and copy the request above, then paste it into WhatsApp.';}});
const video=$('#hero-video'),videoButton=$('#video-toggle');
video.addEventListener('play',()=>{videoButton.textContent='Pause film';videoButton.setAttribute('aria-label','Pause opening film');});
video.addEventListener('pause',()=>{videoButton.textContent='Play film';videoButton.setAttribute('aria-label','Play opening film');});
videoButton.addEventListener('click',()=>video.paused?video.play().catch(()=>{}):video.pause());
if(!matchMedia('(prefers-reduced-motion: reduce)').matches&&!navigator.connection?.saveData){video.autoplay=true;video.play().catch(()=>{});}
document.querySelectorAll('[data-image]').forEach(button=>button.addEventListener('click',()=>{const img=$('#lightbox-image');img.src=`assets/${button.dataset.image}`;img.alt=button.dataset.caption;$('#lightbox-caption').textContent=button.dataset.caption;$('#lightbox').showModal();}));
$('.menu').addEventListener('click',()=>{const open=$('nav').classList.toggle('open');$('.menu').setAttribute('aria-expanded',String(open));});
document.querySelectorAll('nav a').forEach(a=>a.addEventListener('click',()=>{$('nav').classList.remove('open');$('.menu').setAttribute('aria-expanded','false');}));
syncKind();
if(document.modelContext?.registerTool){const lifecycle=new AbortController();const tools=[{name:'list_eden_rooms',description:'Read advertised Eden room types and starting nightly rates in UGX. Availability requires manager confirmation.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true},execute:()=>({rooms})},{name:'start_eden_visit_request',description:'Open the Eden booking form and select a room or wellness service. Does not submit or confirm a booking.',inputSchema:{type:'object',properties:{roomIndex:{type:'integer',minimum:0,maximum:5},service:{type:'string',enum:['Sauna & steam','Massage & body care','Gym & aerobics','Salon & beauty','Meals, salon or meeting space']}},additionalProperties:false},annotations:{readOnlyHint:false},execute:input=>{if(!input||typeof input!=='object'||Object.keys(input).some(k=>!['roomIndex','service'].includes(k)))throw new Error('Invalid request');if(input.roomIndex!==undefined&&(!Number.isInteger(input.roomIndex)||input.roomIndex<0||input.roomIndex>5))throw new Error('Invalid room');if(input.service!==undefined&&![...form.elements.service.options].some(o=>o.value===input.service))throw new Error('Invalid service');openBooking({room:input.roomIndex,service:input.service});return {status:'form_open',kind:form.elements.kind.value};}}];for(const tool of tools){try{Promise.resolve(document.modelContext.registerTool(tool,{signal:lifecycle.signal})).catch(()=>{});}catch{}}window.addEventListener('pagehide',()=>lifecycle.abort(),{once:true});}
