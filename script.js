const TG_TOKEN='YOUR_BOT_TOKEN';
const TG_CHAT='YOUR_CHAT_ID';

/* ════════════════════════════════════════════════════════
   درگاه پرداخت زرین‌پال
   مقدار زیر را با Merchant ID واقعی که از پنل زرین‌پال
   (zarinpal.com) دریافت می‌کنید جایگزین کنید.
   نکته‌ی مهم امنیتی: ارسال درخواست پرداخت مستقیماً از مرورگر
   (همان‌طور که در این فایل پیاده‌سازی شده) فقط برای تست/دمو
   مناسب است. در نسخه‌ی نهایی و واقعی، حتماً این درخواست را از
   طریق سرور خودتان (بک‌اند) به زرین‌پال بفرستید تا هم
   Merchant ID لو نرود و هم مبلغ پرداختی توسط کاربر قابل
   دستکاری نباشد.
════════════════════════════════════════════════════════ */
const ZP_MERCHANT_ID = 'YOUR-ZARINPAL-MERCHANT-ID';
const ZP_CALLBACK_URL = window.location.origin + window.location.pathname;
const ZP_REQUEST_URL  = 'https://payment.zarinpal.com/pg/v4/payment/request.json';
const ZP_VERIFY_URL   = 'https://payment.zarinpal.com/pg/v4/payment/verify.json';
const ZP_STARTPAY_URL = 'https://www.zarinpal.com/pg/StartPay/';

/* درخواست ساخت تراکنش در زرین‌پال — مبلغ به تومان (currency:IRT) */
async function zpRequestPayment({ amount, description, mobile }) {
  const res = await fetch(ZP_REQUEST_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({
      merchant_id: ZP_MERCHANT_ID,
      amount: Math.round(amount),
      currency: 'IRT',
      description: description,
      callback_url: ZP_CALLBACK_URL,
      metadata: mobile ? { mobile } : undefined,
    }),
  });
  const data = await res.json();
  if (data && data.data && data.data.code === 100 && data.data.authority) {
    return data.data.authority;
  }
  const errMsg = data?.errors?.message || 'خطای نامشخص از زرین‌پال';
  throw new Error(errMsg);
}

/* تأیید نهایی تراکنش پس از بازگشت کاربر از زرین‌پال */
async function zpVerifyPayment({ amount, authority }) {
  const res = await fetch(ZP_VERIFY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({
      merchant_id: ZP_MERCHANT_ID,
      amount: Math.round(amount),
      currency: 'IRT',
      authority: authority,
    }),
  });
  return res.json();
}

(async function loadAvanData(){
try{
const res=await fetch('./avan-data.json?_='+Date.now());
if(!res.ok)return;
const d=await res.json();
if(d.origins&&Array.isArray(d.origins)){
const activeOrigins=d.origins.filter(o=>o.active!==false);
const sel=document.getElementById('origin-select');
if(sel&&activeOrigins.length){
sel.innerHTML=activeOrigins.map(o=>`<option value="${o.city}">${o.city}</option>`).join('');
fs.origin=activeOrigins[0].city;
}
const grid=document.getElementById('city-grid');
if(grid&&activeOrigins.length){
grid.innerHTML=activeOrigins.map(o=>`
<button class="city-card" data-city="${o.city}" onclick="setCity('${o.city}')">
<div class="city-card-icon">✈</div>
<div class="city-card-name">${o.city}</div>
</button>`).join('');
}
window._avanOrigins=activeOrigins;
}
if(d.hotels){
if(typeof hotelData!=='undefined'){
['karbala','najaf','kazsamarra'].forEach(city=>{
if(d.hotels[city]){
['lux','mid','eco'].forEach(tier=>{
if(d.hotels[city][tier])hotelData[city][tier]=d.hotels[city][tier];
});
}
});
}
window._avanHotels=d.hotels;
}
if(d.pricing){
window._avanPricing=d.pricing;
}
if(d.caravans&&Array.isArray(d.caravans)){
const mapped=d.caravans.map(c=>({
grad:c.grad||'#0F4D3A,#CFA13A',
title:c.title,
price:c.price.toLocaleString('fa-IR'),
badges:[
`کربلا ${c.karbala.toLocaleString('fa-IR')}شب`,
`نجف ${c.najaf.toLocaleString('fa-IR')}شب`,
`از ${c.origin}`,
...(c.kazTransit?[]:[`کاظمین ${c.kazNights.toLocaleString('fa-IR')}شب`])
],
meta:`🗓 ${c.meta||''}`,
sub:c.sub||''
}));
if(mapped.length&&typeof caravans!=='undefined'){
caravans.length=0;
mapped.forEach(m=>caravans.push(m));
if(typeof groupPage!=='undefined')groupPage=1;
const gg=document.getElementById('cgrid-group');
const cv=document.getElementById('cvt-list');
if(typeof renderCaravans==='function'){
if(gg)renderCaravans(gg,false);
if(cv)renderCaravans(cv,true);
}
if(typeof window._refreshGcalCityMenu==='function')window._refreshGcalCityMenu();
if(typeof window._refreshGcal==='function')window._refreshGcal();
if(typeof window._refreshCstBar==='function')window._refreshCstBar();
}
}
if(d.departures&&Array.isArray(d.departures)){
window._avanDepartures=d.departures;
}
if(d.pricing&&typeof updatePreview==='function'){
if(d.pricing.hotel&&typeof basePrice!=='undefined'){
basePrice.air=Math.round((d.pricing.profitAir+(d.origins||[]).find(o=>o.active)?.airPrice||4500000)/1000000)+6;
basePrice.land=Math.round((d.pricing.profitLand+(d.origins||[]).find(o=>o.active)?.busPrice||1800000)/1000000)+4;
basePrice.mixed=Math.round((basePrice.air+basePrice.land)/2);
}
updatePreview();
}
console.log('✦ آوان:داده از avan-data.json بارگذاری شد');
}catch(e){
console.log('آوان:avan-data.json یافت نشد، از داده پیش‌فرض استفاده می‌شود');
}
})();
let _piData={};
let _pilgrims=[];
let _piMethods={};
let _jdpTarget=null;
const JDP_MONTHS=['فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور','مهر','آبان','آذر','دی','بهمن','اسفند'];
const JDP_DAYS_IN_MONTH=[31,31,31,31,31,31,30,30,30,30,30,29];
let jdpSel={y:1365,m:1,d:1};
function toFarsiNum(n){return String(n).replace(/\d/g,d=>'۰۱۲۳۴۵۶۷۸۹'[d]);}
function buildDrum(listEl,items,selectedIdx){
listEl.innerHTML='';
const pad=2;
for(let i=0;i<pad;i++){
const el=document.createElement('div');
el.className='jdp-drum-item';
el.style.opacity='0';
el.style.pointerEvents='none';
el.textContent=' ';
listEl.appendChild(el);
}
items.forEach((item,i)=>{
const el=document.createElement('div');
el.className='jdp-drum-item'+(i===selectedIdx?' active':(Math.abs(i-selectedIdx)===1?' near':''));
el.textContent=item;
el.dataset.i=i;
listEl.appendChild(el);
});
for(let i=0;i<pad;i++){
const el=document.createElement('div');
el.className='jdp-drum-item';
el.style.opacity='0';
el.style.pointerEvents='none';
el.textContent=' ';
listEl.appendChild(el);
}
scrollDrumTo(listEl.parentElement,selectedIdx,false);
}
function scrollDrumTo(drum,idx,animate){
const list=drum.querySelector('.jdp-drum-list');
const itemH=40,pad=2;
const offset=-(idx)*itemH;
list.style.transition=animate?'transform .2s cubic-bezier(.2,.8,.2,1)':'none';
list.style.transform=`translateY(${offset}px)`;
list.querySelectorAll('.jdp-drum-item').forEach((el,i)=>{
const realI=i-pad;
el.classList.toggle('active',realI===idx);
el.classList.toggle('near',Math.abs(realI-idx)===1);
});
}
function getDrumIdx(drum){
const list=drum.querySelector('.jdp-drum-list');
const t=list.style.transform;
const match=t.match(/translateY\(([-\d.]+)px\)/);
if(!match)return 0;
return Math.round(-parseFloat(match[1])/40);
}
function initDrumDrag(drum,items,onSelect){
let startY=0,startIdx=0,curIdx=0,dragging=false;
const list=drum.querySelector('.jdp-drum-list');
const pad=2;
function clamp(i){return Math.max(0,Math.min(items.length-1,i));}
function onDown(e){
dragging=true;
startY=e.type==='touchstart'?e.touches[0].clientY:e.clientY;
startIdx=getDrumIdx(drum);
list.style.transition='none';
}
function onMove(e){
if(!dragging)return;
const y=e.type==='touchmove'?e.touches[0].clientY:e.clientY;
const delta=startY-y;
const newIdx=clamp(startIdx+Math.round(delta/40));
if(newIdx!==curIdx){curIdx=newIdx;scrollDrumTo(drum,curIdx,false);}
e.preventDefault();
}
function onUp(){
if(!dragging)return;
dragging=false;
const finalIdx=clamp(getDrumIdx(drum));
scrollDrumTo(drum,finalIdx,true);
onSelect(finalIdx);
}
drum.addEventListener('mousedown',onDown,{passive:false});
drum.addEventListener('mousemove',onMove,{passive:false});
drum.addEventListener('mouseup',onUp);
drum.addEventListener('mouseleave',onUp);
drum.addEventListener('touchstart',onDown,{passive:false});
drum.addEventListener('touchmove',onMove,{passive:false});
drum.addEventListener('touchend',onUp);
drum.addEventListener('wheel',e=>{
e.preventDefault();
const cur=getDrumIdx(drum);
const dir=e.deltaY>0?1:-1;
const newIdx=clamp(cur+dir);
scrollDrumTo(drum,newIdx,true);
onSelect(newIdx);
},{passive:false});
}
function updateJDPPreview(){
document.getElementById('jdpPreview').textContent=
`${toFarsiNum(jdpSel.y)}/${JDP_MONTHS[jdpSel.m-1]}/${toFarsiNum(jdpSel.d)}`;
}
function openJDP(idx){
_jdpTarget=idx;
const ov=document.getElementById('jdpOverlay');
const years=[];for(let y=1395;y>=1300;y--)years.push(toFarsiNum(y));
const months=JDP_MONTHS.map((m,i)=>toFarsiNum(i+1)+' — '+m);
const daysInM=JDP_DAYS_IN_MONTH[jdpSel.m-1];
const days=[];for(let d=1;d<=daysInM;d++)days.push(toFarsiNum(d));
buildDrum(document.getElementById('jdpYearList'),years,1395-jdpSel.y);
buildDrum(document.getElementById('jdpMonthList'),months,jdpSel.m-1);
buildDrum(document.getElementById('jdpDayList'),days,jdpSel.d-1);
initDrumDrag(document.getElementById('jdpYear'),years,(i)=>{jdpSel.y=1395-i;updateJDPPreview();});
initDrumDrag(document.getElementById('jdpMonth'),months,(i)=>{
jdpSel.m=i+1;
const d2=JDP_DAYS_IN_MONTH[i];
const days2=[];for(let d=1;d<=d2;d++)days2.push(toFarsiNum(d));
if(jdpSel.d>d2)jdpSel.d=d2;
buildDrum(document.getElementById('jdpDayList'),days2,jdpSel.d-1);
initDrumDrag(document.getElementById('jdpDay'),days2,(di)=>{jdpSel.d=di+1;updateJDPPreview();});
updateJDPPreview();
});
initDrumDrag(document.getElementById('jdpDay'),days,(i)=>{jdpSel.d=i+1;updateJDPPreview();});
updateJDPPreview();
ov.classList.add('open');
}
function closeJDP(){document.getElementById('jdpOverlay').classList.remove('open');}
function confirmJDP(){
if(_jdpTarget===null)return;
const val=`${jdpSel.y}/${String(jdpSel.m).padStart(2,'0')}/${String(jdpSel.d).padStart(2,'0')}`;
const trigger=document.getElementById(`zaer-dob-btn-${_jdpTarget}`);
if(trigger){
trigger.textContent=`${toFarsiNum(jdpSel.y)}/${JDP_MONTHS[jdpSel.m-1]}/${toFarsiNum(jdpSel.d)}`;
trigger.classList.add('filled');
trigger.dataset.value=val;
}
closeJDP();
}
function openPilgrimSheet(data){
_piData=data;_pilgrims=[];_zaerCount=0;
document.getElementById('piFormView').style.display='flex';
const gate=document.getElementById('piGateView');
gate.classList.remove('show');gate.style.display='none';
const tp=document.getElementById('piTripSum');
tp.innerHTML=`<svg class="s18" viewBox="0 0 24 24" ><path d="M12 2l2 7h7l-5.5 4 2 7L12 16l-5.5 4 2-7L3 9h7z"/></svg>
<div class="pi-trip-info">
<div class="pi-trip-title">${data.tripTitle||'سفر زیارتی'}</div>
<div class="pi-trip-price">${(data.totalPrice||0).toLocaleString('fa-IR')}تومان${data.addons?.length?' · '+data.addons.join('، '):''}</div>
</div>`;
const ph=document.getElementById('piHotels');
ph.innerHTML=(data.hotels&&data.hotels.length?data.hotels:[{city:'کربلا',name:data.hotel?.name||'اقامتگاه'}])
.map(h=>`<div class="pi-hotel-pill"><svg class="s18" viewBox="0 0 24 24" ><path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6"/></svg>${h.city||''}:${h.name}</div>`).join('');
document.getElementById('piZaerList').innerHTML='';
addPilgrim();
document.getElementById('piSheet').classList.add('open');
document.getElementById('piOverlay').classList.add('open');
document.getElementById('piScroll').scrollTop=0;
}
function closePilgrim(){
document.getElementById('piSheet').classList.remove('open');
document.getElementById('piOverlay').classList.remove('open');
}
let _zaerCount=0;
function addPilgrim(){
const idx=_zaerCount++;
_piMethods[idx]='manual';
const div=document.createElement('div');
div.className='pi-zaer active';
div.id=`zaer-${idx}`;
div.innerHTML=`
<div class="pi-zaer-head" onclick="toggleZaer(${idx})">
<div class="pi-zaer-num">${toFarsiNum(idx+1)}</div>
<div class="pi-zaer-name-lbl" id="zaer-lbl-${idx}">زائر ${toFarsiNum(idx+1)}</div>
<div class="pi-zaer-tick" id="zaer-tick-${idx}">✓</div>
</div>
<div class="pi-zaer-body">
<div class="pi-mtab">
<button class="pi-mtab-btn" onclick="setMethod(${idx},'upload')">📷 آپلود گذرنامه</button>
<button class="pi-mtab-btn active" onclick="setMethod(${idx},'manual')">✏️ ورود دستی</button>
</div>
<div id="zaer-upload-${idx}" style="display:none;">
<div class="pi-upload" id="zaer-drop-${idx}">
<input type="file" accept="image/*" onchange="onPassportFile(${idx},this)">
<div class="pi-upload-icon"><svg class="s18" viewBox="0 0 24 24" ><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg></div>
<h4>عکس صفحه اول گذرنامه</h4>
<p>تصویر را بکشید یا ضربه بزنید</p>
<div class="pi-preview" id="zaer-prev-${idx}"><img id="zaer-img-${idx}" src=""><button class="pi-preview-rm" onclick="rmPassport(${idx})">✕</button></div>
</div>
<div class="pi-fields" style="margin-top:12px;">
<div class="pi-field">
<label><span class="pi-req"></span>تلفن همراه</label>
<input type="tel" id="zaer-ph-u-${idx}" placeholder="۰۹۱۲..." dir="ltr" inputmode="numeric">
</div>
</div>
<button class="pi-save-zaer" onclick="saveZaer(${idx})">
<svg class="s22" viewBox="0 0 24 24" ><path d="M20 6 9 17l-5-5"/></svg>
ذخیره و ادامه
</button>
</div>
<div id="zaer-manual-${idx}">
<div class="pi-fields">
<div class="pi-field">
<label><span class="pi-req"></span>نام</label>
<input type="text" id="zaer-fn-${idx}" placeholder="علی" oninput="liveValidate(${idx})">
</div>
<div class="pi-field">
<label><span class="pi-req"></span>نام خانوادگی</label>
<input type="text" id="zaer-ln-${idx}" placeholder="احمدی" oninput="liveValidate(${idx})">
</div>
<div class="pi-field">
<label><span class="pi-req"></span>کد ملی</label>
<input type="text" id="zaer-nat-${idx}" placeholder="۱۲۳۴۵۶۷۸۹۰" inputmode="numeric" dir="ltr" maxlength="10" oninput="liveValidate(${idx})">
</div>
<div class="pi-field">
<label>تاریخ تولد(اختیاری)</label>
<button type="button" class="pi-dob-trigger" id="zaer-dob-btn-${idx}" onclick="openJDP(${idx})" data-value="">
انتخاب تاریخ
<span class="pi-dob-icon"><svg class="si" viewBox="0 0 24 24" ><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg></span>
</button>
</div>
<div class="pi-field">
<label><span class="pi-req"></span>تلفن همراه</label>
<input type="tel" id="zaer-ph-${idx}" placeholder="۰۹۱۲..." dir="ltr" inputmode="numeric" oninput="liveValidate(${idx})">
</div>
</div>
<button class="pi-save-zaer" onclick="saveZaer(${idx})" id="zaer-save-btn-${idx}">
<svg class="s22" viewBox="0 0 24 24" ><path d="M20 6 9 17l-5-5"/></svg>
ذخیره و ادامه
</button>
</div>
</div>`;
const list=document.getElementById('piZaerList');
list.appendChild(div);
list.querySelectorAll('.pi-zaer').forEach(z=>{if(z.id!==div.id)z.classList.remove('active');});
setTimeout(()=>div.scrollIntoView({behavior:'smooth',block:'nearest'}),80);
updateFooter();
}
function liveValidate(idx){
const fn=document.getElementById(`zaer-fn-${idx}`)?.value.trim();
const ln=document.getElementById(`zaer-ln-${idx}`)?.value.trim();
const nat=document.getElementById(`zaer-nat-${idx}`)?.value.trim();
const ph=document.getElementById(`zaer-ph-${idx}`)?.value.trim();
if(fn)document.getElementById(`zaer-fn-${idx}`).classList.add('ok');
if(ln)document.getElementById(`zaer-ln-${idx}`).classList.add('ok');
if(nat&&nat.length===10)document.getElementById(`zaer-nat-${idx}`).classList.add('ok');
if(ph&&ph.length>=11)document.getElementById(`zaer-ph-${idx}`).classList.add('ok');
}
function toggleZaer(idx){
const el=document.getElementById(`zaer-${idx}`);
const wasActive=el.classList.contains('active');
document.querySelectorAll('.pi-zaer').forEach(z=>z.classList.remove('active'));
if(!wasActive)el.classList.add('active');
}
function setMethod(idx,method){
_piMethods[idx]=method;
document.getElementById(`zaer-upload-${idx}`).style.display=method==='upload'?'block':'none';
document.getElementById(`zaer-manual-${idx}`).style.display=method==='manual'?'block':'none';
const btns=document.getElementById(`zaer-${idx}`).querySelectorAll('.pi-mtab-btn');
btns.forEach(b=>b.classList.remove('active'));
btns[method==='upload'?0:1].classList.add('active');
}
function onPassportFile(idx,input){
const f=input.files[0];if(!f)return;
const r=new FileReader();
r.onload=e=>{
document.getElementById(`zaer-img-${idx}`).src=e.target.result;
document.getElementById(`zaer-prev-${idx}`).style.display='block';
_pilgrims[idx]=_pilgrims[idx]||{};
_pilgrims[idx].passportImg=e.target.result;
_pilgrims[idx].passportFile=f.name;
};
r.readAsDataURL(f);
}
function rmPassport(idx){
document.getElementById(`zaer-prev-${idx}`).style.display='none';
document.getElementById(`zaer-img-${idx}`).src='';
if(_pilgrims[idx])delete _pilgrims[idx].passportImg;
}
function saveZaer(idx){
const method=_piMethods[idx]||'manual';
const data={method};
if(method==='upload'){
const ph=document.getElementById(`zaer-ph-u-${idx}`).value.trim();
if(!_pilgrims[idx]?.passportImg){showToast('لطفاً تصویر گذرنامه را آپلود کنید');return;}
if(!ph){document.getElementById(`zaer-ph-u-${idx}`).classList.add('err');showToast('تلفن همراه الزامی است');return;}
data.phone=ph;data.passportImg=_pilgrims[idx].passportImg;data.passportFile=_pilgrims[idx].passportFile;
data.label='از روی گذرنامه';
}else{
const fn=document.getElementById(`zaer-fn-${idx}`).value.trim();
const ln=document.getElementById(`zaer-ln-${idx}`).value.trim();
const nat=document.getElementById(`zaer-nat-${idx}`).value.trim();
const dobBtn=document.getElementById(`zaer-dob-btn-${idx}`);
const dob=dobBtn?dobBtn.dataset.value||'':'';
const ph=document.getElementById(`zaer-ph-${idx}`).value.trim();
const errs=[!fn&&`zaer-fn-${idx}`,!ln&&`zaer-ln-${idx}`,!nat&&`zaer-nat-${idx}`,!ph&&`zaer-ph-${idx}`].filter(Boolean);
if(errs.length){
errs.forEach(id=>{const el=document.getElementById(id);if(el){el.classList.add('err');el.classList.remove('ok');}});
showToast('لطفاً فیلدهای الزامی ★ را پر کنید');
return;
}
[fn&&`zaer-fn-${idx}`,ln&&`zaer-ln-${idx}`,nat&&`zaer-nat-${idx}`,ph&&`zaer-ph-${idx}`].filter(Boolean)
.forEach(id=>{const el=document.getElementById(id);if(el){el.classList.remove('err');el.classList.add('ok');}});
data.firstName=fn;data.lastName=ln;data.nationalId=nat;data.birthDate=dob;data.phone=ph;
data.label=`${fn}${ln}`;
}
_pilgrims[idx]=data;
const card=document.getElementById(`zaer-${idx}`);
card.classList.add('done');
card.classList.remove('active');
document.getElementById(`zaer-lbl-${idx}`).textContent=data.label||`زائر ${idx+1}`;
document.getElementById(`zaer-tick-${idx}`).textContent='✓';
updateFooter();
showToast('✦ اطلاعات زائر ذخیره شد');
}
function updateFooter(){
const done=_pilgrims.filter(p=>p&&p.label);
const doneCount=done.length;
const total=_piData.totalPrice||0;
const pp=doneCount||1;
document.getElementById('piFootCount').textContent=`${toFarsiNum(doneCount)}نفر تکمیل شده`;
document.getElementById('piFootTotal').textContent=(total*pp).toLocaleString('fa-IR')+' ت';
const totalZaers=_zaerCount||1;
const pct=Math.round((doneCount/totalZaers)*100);
document.getElementById('piProgressFill').style.width=pct+'%';
document.getElementById('piProgressLbl').textContent=`${toFarsiNum(doneCount)}از ${toFarsiNum(totalZaers)}`;
const btn=document.getElementById('piPayBtn');
btn.disabled=(doneCount===0);
if(doneCount>0){
btn.style.opacity='1';
btn.style.pointerEvents='auto';
}
}
function goToGate(){
const done=_pilgrims.filter(p=>p&&p.label);
if(!done.length){showToast('حداقل اطلاعات یک زائر را ذخیره کنید');return;}
document.getElementById('piFormView').style.display='none';
const gate=document.getElementById('piGateView');
gate.style.display='flex';
gate.classList.add('show');
const count=done.length;
const total=(_piData.totalPrice||0)*count;
document.getElementById('piGateAmount').textContent=total.toLocaleString('fa-IR');
document.getElementById('piGateSummary').textContent=`${_piData.tripTitle||'سفر زیارتی'}— ${toFarsiNum(count)}نفر`;
}
function backToForm(){
document.getElementById('piFormView').style.display='flex';
const gate=document.getElementById('piGateView');
gate.classList.remove('show');
gate.style.display='none';
}
async function handlePayment(){
const btn=document.getElementById('piGatePay');
const sending=document.getElementById('piSending');
btn.disabled=true;sending.classList.add('show');
try{await sendToTelegram();}catch(e){console.warn('TG error',e);}
btn.disabled=false;sending.classList.remove('show');
closePilgrim();
showToast('✦ رزرو شما ثبت شد!تیم آوان به زودی تماس می‌گیرد');
}
async function sendToTelegram(){
const done=_pilgrims.filter(p=>p&&p.label);
const count=done.length;
const total=(_piData.totalPrice||0)*count;
let msg=`✦*رزرو جدید آوان*\n\n`;
msg+=`🗺 سفر:${_piData.tripTitle||'—'}\n`;
msg+=`💰 مبلغ:${total.toLocaleString('fa-IR')}تومان\n`;
if(_piData.addons?.length)msg+=`➕ خدمات:${_piData.addons.join('، ')}\n`;
if(_piData.hotels?.length)msg+=`🏨 اقامت:${_piData.hotels.map(h=>`${h.city}${h.name}`).join(' | ')}\n`;
msg+=`\n👥*زائران(${count}نفر):*\n`;
done.forEach((p,i)=>{
msg+=`\n${i+1}. `;
if(p.method==='upload')msg+=`📷 گذرنامه آپلود | 📱 ${p.phone}`;
else msg+=`${p.firstName}${p.lastName}| کد ملی:${p.nationalId}| تولد:${p.birthDate||'—'}| 📱 ${p.phone}`;
});
const payload={chat_id:TG_CHAT,text:msg,parse_mode:'Markdown'};
await fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
for(const p of done){
if(p.passportImg){
const blob=await(await fetch(p.passportImg)).blob();
const fd=new FormData();fd.append('chat_id',TG_CHAT);fd.append('photo',blob,'passport.jpg');fd.append('caption',`گذرنامه — ${p.label||''}`);
await fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendPhoto`,{method:'POST',body:fd});
}
}
}
function showToast(msg){
const t=document.getElementById('toast');
t.textContent=msg;t.classList.add('active');
setTimeout(()=>t.classList.remove('active'),2800);
}

// ===== script block =====

function openPanel(id){
  window.scrollTo(0,0);
  document.querySelectorAll('.panel').forEach(p=>{
    if(p.id==='panel-'+id){
      p.classList.remove('exit-up');p.classList.add('active');
    }else{
      p.classList.remove('active');p.classList.add('exit-up');
      setTimeout(()=>p.classList.remove('exit-up'),380);
    }
  });
}
/* ── Quick Start switch (انفرادی / کاروانی) ────────── */
function qsSelect(btn){
  const wrap=document.getElementById('qs');
  const switchEl=document.getElementById('qs-switch');
  const goText=document.getElementById('qs-go-text');
  if(!wrap||!switchEl||!btn) return;
  switchEl.querySelectorAll('.qs-opt').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  const mode=btn.dataset.mode;
  switchEl.dataset.mode=mode;
  wrap.dataset.mode=mode;
  if(goText) goText.textContent = mode==='solo' ? 'شروع سفر انفرادی' : 'شروع سفر کاروانی';
}
function qsGo(){
  const active=document.querySelector('#qs-switch .qs-opt.active');
  const target=active ? active.dataset.target : 'builder';
  openPanel(target);
}
document.addEventListener('DOMContentLoaded',function(){
  document.querySelectorAll('#qs-switch .qs-opt').forEach(function(b){
    b.addEventListener('click',function(){ qsSelect(b); });
  });
  const goBtn=document.getElementById('qs-go');
  if(goBtn) goBtn.addEventListener('click',qsGo);
});
function toggleStats(){
const el=document.getElementById('tstats');
const btn=document.getElementById('tsToggle');
const open=el.classList.toggle('open');
btn.setAttribute('aria-expanded',open?'true':'false');
}
const fs={
origin:'تهران',
karbala:3,najaf:2,
kazsamarra:'transit',
kazsamarraNights:1,
mode:'air',timing:'this-week',exactDate:'',jalaliDate:null,
hotelTier:{karbala:null,najaf:null,kazsamarra:null},
hotelName:{karbala:null,najaf:null,kazsamarra:null}
};
const cityMeta={
karbala:{label:'کربلا',icon:'🕌'},
najaf:{label:'نجف',icon:'🕌'},
kazsamarra:{label:'کاظمین/سامرا',icon:'🕌'}
};
const ml={air:'هوایی',land:'زمینی',mixed:'ترکیبی'};
let cs=1;const ts=4;
let variants=[];let cv=null;
function upProg(){document.querySelectorAll('.pseg').forEach(d=>{const s=+d.dataset.step;d.classList.toggle('active',s===cs);d.classList.toggle('done',s<cs);});}
function showStep(n){
document.querySelectorAll('.form-step').forEach(s=>s.classList.toggle('active',+s.dataset.step===n));
document.getElementById('btn-back').style.visibility=n===1?'hidden':'visible';
document.getElementById('btn-next').textContent=n===ts?'مشاهده پیشنهادها ✦':'ادامه';
upProg();
if(n===4&&window._jcalRender)window._jcalRender();
}
showStep(1);
document.getElementById('btn-next').addEventListener('click',()=>{if(cs<ts){cs++;showStep(cs);}else submitForm();});
document.getElementById('btn-back').addEventListener('click',()=>{if(cs>1){cs--;showStep(cs);}});
document.getElementById('origin-select').addEventListener('change',e=>fs.origin=e.target.value);
const hotelData={
karbala:{
lux:[{name:'هتل بیت‌العباس',stars:'★★★★★',dist:'۸۰ متر'},{name:'هتل الحسین',stars:'★★★★★',dist:'۱۲۰ متر'}],
mid:[{name:'هتل کوثر',stars:'★★★★',dist:'۲۰۰ متر'},{name:'هتل الرافدین',stars:'★★★★',dist:'۳۲۰ متر'}],
eco:[{name:'هتل المصطفی',stars:'★★★',dist:'۴۵۰ متر'},{name:'هتل الزهرا',stars:'★★★',dist:'۵۵۰ متر'}],
},
najaf:{
lux:[{name:'هتل الصفوه',stars:'★★★★★',dist:'۱۰۰ متر'},{name:'هتل النجف',stars:'★★★★★',dist:'۱۵۰ متر'}],
mid:[{name:'هتل العلوی',stars:'★★★★',dist:'۲۸۰ متر'},{name:'هتل الامام',stars:'★★★★',dist:'۳۵۰ متر'}],
eco:[{name:'هتل الکاظم',stars:'★★★',dist:'۵۰۰ متر'},{name:'هتل الاخوه',stars:'★★★',dist:'۶۰۰ متر'}],
},
kazsamarra:{
lux:[{name:'هتل الکاظمیه',stars:'★★★★★',dist:'۹۰ متر'},{name:'هتل الامامین',stars:'★★★★★',dist:'۱۸۰ متر'}],
mid:[{name:'هتل الجواد',stars:'★★★★',dist:'۳۰۰ متر'},{name:'هتل السامرا',stars:'★★★★',dist:'۴۰۰ متر'}],
eco:[{name:'هتل الهادی',stars:'★★★',dist:'۵۵۰ متر'},{name:'هتل العسکری',stars:'★★★',dist:'۶۵۰ متر'}],
}
};
function renderInlineHotel(cityKey){
const wrap=document.getElementById('hotel-tiers-'+cityKey);
if(!wrap)return;
const tier=fs.hotelTier[cityKey];
const tiers=[{k:'lux',l:'لوکس ۵★'},{k:'mid',l:'متوسط ۴★'},{k:'eco',l:'اقتصادی ۳★'}];
let html=`<div class="cty-hotel-tier-label">درجه هتل</div>
<div class="cty-tier-row">
${tiers.map(t=>`<button class="cty-tier-btn${tier===t.k?' active':''}" data-tier="${t.k}" data-city="${cityKey}">${t.l}</button>`).join('')}
</div>`;
if(tier){
const opts=hotelData[cityKey][tier]||[];
html+=`<div class="cty-hotel-tier-label">انتخاب هتل</div><div class="cty-hotel-opts">
${opts.map(h=>`<div class="cty-hotel-opt${fs.hotelName[cityKey]===h.name?' selected':''}" data-hotel="${h.name}" data-city="${cityKey}">
<span class="cty-hotel-opt-star">${h.stars}</span>
<span class="cty-hotel-opt-name">${h.name}</span>
<span class="cty-hotel-opt-dist">${h.dist}</span>
<div class="cty-hotel-opt-radio"></div>
</div>`).join('')}
</div>`;
}
wrap.innerHTML=html;
wrap.querySelectorAll('.cty-tier-btn').forEach(btn=>{
btn.addEventListener('click',()=>{
fs.hotelTier[btn.dataset.city]=btn.dataset.tier;
fs.hotelName[btn.dataset.city]=null;
renderInlineHotel(btn.dataset.city);
});
});
wrap.querySelectorAll('.cty-hotel-opt').forEach(opt=>{
opt.addEventListener('click',()=>{
fs.hotelName[opt.dataset.city]=opt.dataset.hotel;
renderInlineHotel(opt.dataset.city);
setTimeout(()=>collapseAndAdvance(opt.dataset.city),260);
});
});
}
const cityOrder=['karbala','najaf','kazsamarra'];
const cityNightsKey={karbala:'karbala',najaf:'najaf',kazsamarra:'kazsamarraNights'};
function showHotelSummary(cityKey){
const sum=document.getElementById('hotel-summary-'+cityKey);
if(!sum)return;
const hotelName=fs.hotelName[cityKey]||'';
const nightsKey=cityNightsKey[cityKey];
const nights=fs[nightsKey]||fs[cityKey]||1;
const tierLabels={lux:'لوکس ۵★',mid:'متوسط ۴★',eco:'اقتصادی ۳★'};
const tier=tierLabels[fs.hotelTier[cityKey]]||'';
sum.innerHTML=`
<div class="cty-hotel-summary-info">
<div class="cty-hotel-summary-dot"></div>
<div>
<div class="cty-hotel-summary-text">🏨 ${hotelName}</div>
<div class="cty-hotel-summary-sub">${nights.toLocaleString('fa-IR')}شب · ${tier}</div>
</div>
</div>
<span class="cty-hotel-summary-edit">✎ تغییر</span>`;
sum.style.display='flex';
}
function collapseAndAdvance(doneCity){
const sec=document.getElementById('hotel-'+doneCity);
if(sec){
sec.style.maxHeight=sec.scrollHeight+'px';
sec.style.overflow='hidden';
sec.style.transition='max-height .35s ease,opacity .3s ease';
requestAnimationFrame(()=>{sec.style.maxHeight='0';sec.style.opacity='0';});
setTimeout(()=>{
sec.style.display='none';
sec.style.maxHeight='';sec.style.opacity='';sec.style.transition='';
showHotelSummary(doneCity);
},360);
}
const card=document.querySelector(`.cty-card[data-city="${doneCity}"]`);
if(card)card.classList.add('cty-done');
const idx=cityOrder.indexOf(doneCity);
for(let i=idx+1;i<cityOrder.length;i++){
const next=cityOrder[i];
const nextSec=document.getElementById('hotel-'+next);
if(nextSec&&nextSec.style.display!=='none'){
setTimeout(()=>{
const nextCard=document.querySelector(`.cty-card[data-city="${next}"]`);
if(nextCard)nextCard.scrollIntoView({behavior:'smooth',block:'center'});
},420);
return;
}
}
}
function reopenHotel(cityKey){
const sum=document.getElementById('hotel-summary-'+cityKey);
const sec=document.getElementById('hotel-'+cityKey);
if(!sec)return;
if(sum)sum.style.display='none';
sec.style.display='';
sec.style.maxHeight='0';sec.style.overflow='hidden';
sec.style.transition='max-height .35s ease';
requestAnimationFrame(()=>{sec.style.maxHeight=sec.scrollHeight+200+'px';});
setTimeout(()=>{sec.style.maxHeight='';sec.style.overflow='';sec.style.transition='';},380);
const card=document.querySelector(`.cty-card[data-city="${cityKey}"]`);
if(card)card.classList.remove('cty-done');
}
function toggleHotelSection(cityKey,show){
const sec=document.getElementById('hotel-'+cityKey);
if(!sec)return;
sec.style.display=show?'':'none';
if(show)renderInlineHotel(cityKey);
}
toggleHotelSection('karbala',true);
toggleHotelSection('najaf',true);
document.querySelectorAll('#city-dg .stepper').forEach(st=>{
const key=st.dataset.key,ce=st.querySelector('.cnt');
st.querySelector('.minus').addEventListener('click',()=>{
if(st.closest('.cty-stepper-wrap').classList.contains('disabled'))return;
fs[key]=Math.max(1,fs[key]-1);ce.textContent=fs[key].toLocaleString('fa-IR')+' روز';
if(typeof updatePreview==='function')updatePreview();
});
st.querySelector('.plus').addEventListener('click',()=>{
if(st.closest('.cty-stepper-wrap').classList.contains('disabled'))return;
fs[key]=Math.min(10,fs[key]+1);ce.textContent=fs[key].toLocaleString('fa-IR')+' روز';
if(typeof updatePreview==='function')updatePreview();
});
});
document.querySelectorAll('.cty-switch').forEach(sw=>{
sw.addEventListener('click',()=>{
const key=sw.dataset.transitKey;
const isNowTransit=!sw.classList.contains('on');
sw.classList.toggle('on',isNowTransit);
const card=sw.closest('.cty-card');
card.classList.toggle('is-transit',isNowTransit);
card.querySelector('.cty-stepper-wrap').classList.toggle('disabled',isNowTransit);
if(key==='kazsamarra'){
fs.kazsamarra=isNowTransit?'transit':'stay';
toggleHotelSection('kazsamarra',!isNowTransit);
if(isNowTransit){fs.hotelTier.kazsamarra=null;fs.hotelName.kazsamarra=null;}
}
if(key==='karbala'||key==='najaf'){
fs[key+'__transit']=isNowTransit;
toggleHotelSection(key,!isNowTransit);
if(isNowTransit){fs.hotelTier[key]=null;fs.hotelName[key]=null;}
}
if(typeof updatePreview==='function')updatePreview();
});
});
document.querySelectorAll('.mc').forEach(c=>{
c.addEventListener('click',()=>{document.querySelectorAll('.mc').forEach(x=>x.classList.remove('active'));c.classList.add('active');fs.mode=c.dataset.mode;});
});
(function(){
const months=['فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور','مهر','آبان','آذر','دی','بهمن','اسفند'];
const dpm=[31,31,31,31,31,31,30,30,30,30,30,29];
const holidays={
'0-1':1,'0-2':1,'0-3':1,'0-12':1,'1-1':1,'1-2':1,
'2-14':1,'3-14':1,'5-3':1,'5-4':1,'6-16':1,'9-22':1,'10-22':1
};
function firstDayOffset(month){
let days=0;for(let i=0;i<month;i++)days+=dpm[i];
return days%7;
}
function toFa(n){return n.toLocaleString('fa-IR');}
let curMonth=0;
const todayJ={m:2,d:26};
function render(){
const lbl=document.getElementById('jcal-month-lbl');
const grid=document.getElementById('jcal-days');
if(!lbl||!grid)return;
lbl.textContent=months[curMonth]+' ۱۴۰۵';
const offset=firstDayOffset(curMonth);
const total=dpm[curMonth];
let html='';
for(let i=0;i<offset;i++)html+=`<div class="jcal-day jcal-day--empty"></div>`;
for(let d=1;d<=total;d++){
const isPast=curMonth<todayJ.m||(curMonth===todayJ.m&&d<todayJ.d);
const isToday=curMonth===todayJ.m&&d===todayJ.d;
const isHoliday=holidays[curMonth+'-'+d];
const isSel=fs.jalaliDate&&fs.jalaliDate.m===curMonth&&fs.jalaliDate.d===d;
const cls=['jcal-day',isPast?'jcal-day--past':'',isToday?'jcal-day--today':'',isHoliday?'jcal-day--holiday':'',isSel?'jcal-day--selected':''].filter(Boolean).join(' ');
html+=`<div class="${cls}" data-m="${curMonth}" data-d="${d}">${toFa(d)}</div>`;
}
grid.innerHTML=html;
grid.querySelectorAll('.jcal-day:not(.jcal-day--empty):not(.jcal-day--past)').forEach(el=>{
el.addEventListener('click',()=>{
const m=+el.dataset.m,d=+el.dataset.d;
fs.jalaliDate={m,d};
fs.exactDate=`1405/${String(m+1).padStart(2,'0')}/${String(d).padStart(2,'0')}`;
render();
updateSelectedLabel();
});
});
updateSelectedLabel();
}
function updateSelectedLabel(){
const el=document.getElementById('jcal-selected');
if(!el)return;
if(fs.jalaliDate){
const{m,d}=fs.jalaliDate;
el.innerHTML=`<div class="jcal-sel-icon"><svg class="si" viewBox="0 0 24 24" ><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg></div>
<div><div class="jcal-sel-text">✦ ${toFa(d)}${months[m]}۱۴۰۵</div><div class="jcal-sel-sub">تاریخ اعزام انتخاب شد</div></div>`;
}else{
el.innerHTML=`<span class="jcal-sel-placeholder">روز اعزام را انتخاب کنید ↑</span>`;
}
}
document.getElementById('jcal-prev')?.addEventListener('click',()=>{if(curMonth>0){curMonth--;render();}});
document.getElementById('jcal-next')?.addEventListener('click',()=>{if(curMonth<11){curMonth++;render();}});
curMonth=todayJ.m;
window._jcalRender=render;
render();
})();
function submitForm(){
document.querySelector('.form-step.active').classList.remove('active');
document.querySelector('.fnav').style.display='none';
document.getElementById('loading').classList.add('active');
setTimeout(()=>{
document.getElementById('loading').classList.remove('active');
document.querySelector('.fnav').style.display='';
revealSuggestions();
},1300);
}
function tierLabel(c){
const t=fs.hotelTier[c];
if(!t)return '';
const labels={lux:'لوکس ۵★',mid:'متوسط ۴★',eco:'اقتصادی ۳★'};
return labels[t]||'';
}
function buildSummary(){
const p=[`کربلا ${fs.karbala.toLocaleString('fa-IR')}شب`,`نجف ${fs.najaf.toLocaleString('fa-IR')}شب`];
if(fs.kazsamarra==='stay')p.push(`کاظمین/سامرا ${fs.kazsamarraNights.toLocaleString('fa-IR')}شب`);else p.push('کاظمین/سامرا عبوری');
return `${p.join(' · ')}— ${ml[fs.mode]}از ${fs.origin}`;
}
function buildItinerary(){
const days=[];const tl=fs.mode==='air'?'پرواز':(fs.mode==='land'?'اتوبوس VIP':'پرواز یا زمینی');
days.push(`حرکت از ${fs.origin}با ${tl}و ترانسفر به هتل کربلا`);
for(let i=0;i<fs.karbala;i++)days.push('اقامت در کربلا، زیارت حرم امام حسین(ع)و حضرت ابوالفضل(ع)');
const tr=[];
if(fs.kazsamarra==='transit')tr.push('بازدید عبوری از حرم کاظمین و سامرا');
days.push(`انتقال به نجف${tr.length?'('+tr.join(' و ')+')':''}`);
for(let i=0;i<fs.najaf;i++)days.push('اقامت در نجف، زیارت حرم امام علی(ع)');
if(fs.kazsamarra==='stay')for(let i=0;i<fs.kazsamarraNights;i++)days.push('اقامت در کاظمین/سامرا، زیارت حرم امام کاظم، امام جواد، امام هادی و امام عسکری(ع)');
days.push(`بازگشت به ${fs.origin}`);return days;
}
function revealSuggestions(){
const inlineEl=document.getElementById('inline-results');
const processingEl=document.getElementById('ir-processing');
const readyEl=document.getElementById('ir-ready');
inlineEl.classList.add('show');
processingEl.style.display='flex';
readyEl.style.display='none';
setTimeout(()=>{
inlineEl.scrollIntoView({behavior:'smooth',block:'start'});
},100);
const msgs=['در حال جستجو در بانک کاروان‌ها','تطبیق با ترجیحات شما','بررسی هتل‌های موجود','محاسبه بهترین قیمت‌ها','آماده‌سازی پیشنهادها'];
const textEl=document.getElementById('ir-proc-text');
let mi=0;
const iv=setInterval(()=>{
mi=(mi+1)%msgs.length;
textEl.style.opacity='0';
setTimeout(()=>{textEl.textContent=msgs[mi];textEl.style.opacity='1';},200);
},480);
textEl.style.transition='opacity .2s';
setTimeout(()=>{
clearInterval(iv);
processingEl.style.display='none';
document.getElementById('ir-summary-text').textContent=buildSummary();
readyEl.style.display='flex';
readyEl.style.flexDirection='column';
readyEl.style.gap='14px';
renderInlineResults();
},2400);
}
function runRevealAnimation(){
const statusMsgs=['در حال جستجو در بانک کاروان‌ها','تطبیق با ترجیحات شما','بررسی در دسترس بودن هتل‌ها','محاسبه بهترین قیمت‌ها','آماده‌سازی پیشنهادها'];
const statusEl=document.getElementById('rw-status-text');
const dotsEl=document.getElementById('rw-dots');
const counterEl=document.getElementById('rw-counter');
const widget=document.getElementById('reveal-widget');
const list=document.getElementById('suggestion-list');
const fallback=document.getElementById('sg-fallback');
list.innerHTML='';
fallback.style.display='none';
counterEl.style.display='none';
let msgIdx=0;
const msgInterval=setInterval(()=>{
msgIdx=(msgIdx+1)%statusMsgs.length;
statusEl.style.opacity='0';
setTimeout(()=>{statusEl.textContent=statusMsgs[msgIdx];statusEl.style.opacity='1';},200);
},500);
statusEl.style.transition='opacity .2s';
setTimeout(()=>{
clearInterval(msgInterval);
statusEl.style.opacity='0';
dotsEl.style.opacity='0';
setTimeout(()=>{
counterEl.style.display='block';
document.getElementById('rw-counter-num').textContent='۴';
setTimeout(()=>{
widget.style.transition='all .6s cubic-bezier(.2,.8,.2,1)';
widget.style.minHeight='0';
widget.style.height='0';
widget.style.opacity='0';
widget.style.marginBottom='0';
widget.style.overflow='hidden';
setTimeout(()=>{
widget.style.display='none';
renderSpectacularSuggestions();
},620);
},800);
},200);
},2000);
}
function renderSpectacularSuggestions(){
const list=document.getElementById('suggestion-list');
list.innerHTML='';
const fallback=document.getElementById('sg-fallback');
const td=fs.karbala+fs.najaf+1;
const ml2=ml[fs.mode];
const modeIcon=fs.mode==='air'?'✈':fs.mode==='land'?'🚌':'✦';
variants=[
{tag:'cheap',nodeClass:'n-cheap',nodeEmoji:'💚',label:'مقرون‌به‌صرفه',badgeLabel:'بهترین قیمت',price:13800000,hotel:sh.karbala[0],gradient:'linear-gradient(135deg,#1F6F6B,#0F4D3A)',heroGrad:'135deg,#0A3328,#1a6b51'},
{tag:'near',nodeClass:'n-near',nodeEmoji:'🕌',label:'نزدیک‌ترین به حرم',badgeLabel:'نزدیک حرم',price:18500000,hotel:sh.karbala[1],gradient:'linear-gradient(135deg,#0F4D3A,#CFA13A)',heroGrad:'135deg,#0F4D3A,#8a6520'},
{tag:'luxury',nodeClass:'n-luxury',nodeEmoji:'✦',label:'لوکس‌ترین',badgeLabel:'ممتاز',price:24900000,hotel:sh.karbala[2],gradient:'linear-gradient(135deg,#CFA13A,#0F4D3A)',heroGrad:'135deg,#9A6F1A,#CFA13A'},
{tag:'vip',nodeClass:'n-vip',nodeEmoji:'👑',label:'VIP ویژه',badgeLabel:'VIP',price:31500000,hotel:{name:'هتل عباسیه VIP',stars:'۵★',dist:'۳۰ متر'},gradient:'linear-gradient(135deg,#1a1a3e,#3a3a8e)',heroGrad:'135deg,#1a1a3e,#3a3a8e'},
];
variants.forEach((v,i)=>{
const card=document.createElement('div');
card.className='sr-card';
card.innerHTML=`
<div class="sr-node ${v.nodeClass}">${v.nodeEmoji}</div>
<div class="sr-body" data-i="${i}">
<div class="sr-hero">
<div class="sr-hero-bg" style="background:linear-gradient(${v.heroGrad});"></div>
<div class="sr-hero-shimmer"></div>
<div class="sr-hero-content">
<div class="sr-hero-rank">0${i+1}</div>
<div class="sr-hero-badge">✦ ${v.badgeLabel}</div>
<div class="sr-hero-price-tag">
<span class="sr-hero-from">هر نفر از</span>
<span class="sr-hero-amount">${v.price.toLocaleString('fa-IR')}</span>
</div>
</div>
</div>
<div class="sr-info">
<div class="sr-title">${td.toLocaleString('fa-IR')}روز ${ml2}${modeIcon}— ${v.label}</div>
<div class="sr-pills">
<span class="sr-pill p-city">کربلا ${fs.karbala.toLocaleString('fa-IR')}شب</span>
<span class="sr-pill p-city">نجف ${fs.najaf.toLocaleString('fa-IR')}شب</span>
<span class="sr-pill p-mode">${modeIcon}${ml2}</span>
<span class="sr-pill p-tag">${v.label}</span>
</div>
<div class="sr-hotel-row">
<svg class="s18" viewBox="0 0 24 24" ><path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6"/></svg>
${v.hotel.name}· ${v.hotel.stars}· ${v.hotel.dist}تا حرم
</div>
<div class="sr-cta-row">
<span class="sr-cta">مشاهده جزئیات<svg class="s22" viewBox="0 0 24 24" ><path d="M19 12H5M12 19l-7-7 7-7"/></svg></span>
<button class="sr-detail-btn" data-i="${i}">رزرو این سفر ✦</button>
</div>
</div>
</div>`;
card.querySelector('.sr-body').addEventListener('click',()=>openModal(i));
card.querySelector('.sr-detail-btn').addEventListener('click',(e)=>{e.stopPropagation();openModal(i);});
list.appendChild(card);
setTimeout(()=>card.classList.add('revealed'),i*180+80);
});
const fbCaravan=caravans[0];
if(fbCaravan){
document.getElementById('sg-fallback-title').textContent=fbCaravan.title;
document.getElementById('sg-fallback-price').innerHTML=fbCaravan.price+'<small>هر نفر</small>';
document.getElementById('sg-fallback-badges').innerHTML=fbCaravan.badges.map(b=>`<span class="badge">${b}</span>`).join('');
document.getElementById('sg-fallback-meta').textContent=fbCaravan.meta||'';
}
setTimeout(()=>{
fallback.style.display='block';
fallback.style.opacity='0';fallback.style.transform='translateY(16px)';fallback.style.transition='opacity .5s ease,transform .5s ease';
setTimeout(()=>{fallback.style.opacity='1';fallback.style.transform='none';},50);
},variants.length*180+300);
}
function renderInlineResults(){
const grid=document.getElementById('ir-grid');
if(!grid)return;
grid.innerHTML='';
const td=fs.karbala+fs.najaf+1;
const ml2=ml[fs.mode];
const modeIcon=fs.mode==='air'?'✈':fs.mode==='land'?'🚌':'✦';
const departureDates=['۱۵ تیر ۱۴۰۴','۲۲ تیر ۱۴۰۴','۵ مرداد ۱۴۰۴','۱۲ مرداد ۱۴۰۴'];
variants=[
{label:'مقرون‌به‌صرفه',badge:'بهترین قیمت',emoji:'💚',price:13800000,hotel:sh.karbala[0],
accent:'#1a6b51',accentB:'#0A3328',tagClass:'t-highlight',tagColor:'#1a6b51',stripe:'linear-gradient(90deg,#0A3328,#1a6b51)'},
{label:'نزدیک‌ترین به حرم',badge:'نزدیک حرم',emoji:'🕌',price:18500000,hotel:sh.karbala[1],
accent:'#0F4D3A',accentB:'#CFA13A',tagClass:'t-highlight',tagColor:'#0F4D3A',stripe:'linear-gradient(90deg,#0F4D3A,#CFA13A)'},
{label:'لوکس و ممتاز',badge:'لوکس',emoji:'✦',price:24900000,hotel:sh.karbala[2],
accent:'#9A6F1A',accentB:'#CFA13A',tagClass:'t-highlight',tagColor:'#9A6F1A',stripe:'linear-gradient(90deg,#9A6F1A,#CFA13A)'},
{label:'VIP اختصاصی',badge:'VIP',emoji:'👑',price:31500000,hotel:{name:'هتل عباسیه VIP',stars:'۵★',dist:'۳۰ متر'},
accent:'#1a1a3e',accentB:'#3a3a8e',tagClass:'t-highlight',tagColor:'#1a1a3e',stripe:'linear-gradient(90deg,#1a1a3e,#3a3a8e)'},
];
variants.forEach((v,i)=>{
if(i>0){
const sep=document.createElement('div');
sep.className='irc-sep';
sep.innerHTML='<div class="irc-sep-line"></div><div class="irc-sep-dot"></div><div class="irc-sep-line"></div>';
grid.appendChild(sep);
}
const card=document.createElement('div');
card.className='irc';
card.style.transitionDelay=`${i*0.1}s`;
card.innerHTML=`
<div class="irc-stripe" style="background:${v.stripe};"></div>
<div class="irc-inner">
<div class="irc-accent" style="background:linear-gradient(160deg,${v.accent},${v.accentB});">
<div class="irc-rank">0${i+1}</div>
<div class="irc-icon-wrap">${v.emoji}</div>
<div class="irc-badge-v">${v.badge}</div>
</div>
<div class="irc-content">
<div class="irc-top-row">
<div class="irc-title-block">
<div class="irc-card-title">${td.toLocaleString('fa-IR')}روز ${modeIcon}${ml2}</div>
<div class="irc-card-sub">${v.label}· ${v.hotel.name}</div>
</div>
<div class="irc-price-block">
<span class="irc-price-from">هر نفر از</span>
<div class="irc-price-num">${(v.price/1000000).toLocaleString('fa-IR')}<small style="font-size:11px;font-weight:500">M</small></div>
<span class="irc-price-unit">تومان</span>
</div>
</div>
<div class="irc-date-row">
<div class="irc-date-icon">
<svg class="si" viewBox="0 0 24 24" ><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
</div>
<div class="irc-date-info">
<div class="irc-date-label">نزدیک‌ترین تاریخ اعزام</div>
<div class="irc-date-val">${departureDates[i]}</div>
</div>
</div>
<div class="irc-tags">
<span class="irc-tag t-city">کربلا ${fs.karbala.toLocaleString('fa-IR')}شب</span>
<span class="irc-tag t-city">نجف ${fs.najaf.toLocaleString('fa-IR')}شب</span>
<span class="irc-tag t-mode">${modeIcon}${ml2}</span>
<span class="irc-tag t-hotel">🏨 ${v.hotel.stars}· ${v.hotel.dist}تا حرم</span>
</div>
<div class="irc-cta-row">
<span class="irc-see">جزئیات و رزرو<svg class="s22" viewBox="0 0 24 24" ><path d="M19 12H5M12 19l-7-7 7-7"/></svg></span>
<button class="irc-btn" style="background:linear-gradient(135deg,${v.accent},${v.accentB});" data-i="${i}">
<svg class="si" viewBox="0 0 24 24" ><path d="M5 12h14M12 5l7 7-7 7"/></svg>
انتخاب این گزینه
</button>
</div>
</div>
</div>`;
card.addEventListener('click',()=>openModal(i));
card.querySelector('.irc-btn').addEventListener('click',(e)=>{e.stopPropagation();openModal(i);});
grid.appendChild(card);
requestAnimationFrame(()=>setTimeout(()=>card.classList.add('in'),i*130+60));
});
const gbCaravan=caravans&&caravans[0];
if(gbCaravan){
const gb=document.getElementById('ir-group-block');
if(gb){
gb.querySelector('.ir-gb-title').textContent=gbCaravan.title||'سفر گروهی عتبات عالیات';
gb.querySelector('.ir-gb-price-num').textContent=gbCaravan.price||'۱۶٬۵۰۰٬۰۰۰';
const depMatch=gbCaravan.meta&&gbCaravan.meta.match(/اعزام\s+(.+?)\s*·/);
if(depMatch)gb.querySelector('.ir-gb-date-val').textContent=depMatch[1];
}
}
}
let cdsBase=0,cdsAddons=0;
function openSheet(data){
window._cdsData=data;
const{tag,title,grad,price,origin,stops=[],hotel={},chips=[],days=[],hotels=[]}=data;
document.getElementById('cdsTag').textContent=tag||'کاروان';
document.getElementById('cdsTitle').textContent=title||'';
const hero=document.getElementById('cdsHero');
hero.style.background=`linear-gradient(135deg,${grad||'#0F4D3A,#CFA13A'})`;
cdsBase=price||0;cdsAddons=0;
document.getElementById('cdsAddonSim').classList.remove('checked');
document.getElementById('cdsAddonIns').classList.remove('checked');
updateCdsPrice();
const svgIcons={
days:`<svg class="s18" viewBox="0 0 24 24" ><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>`,
date:`<svg class="s18" viewBox="0 0 24 24" ><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>`,
karbala:`<svg class="s18" viewBox="0 0 24 24" ><path d="M12 2l2 7h7l-5.5 4 2 7L12 16l-5.5 4 2-7L3 9h7z"/></svg>`,
najaf:`<svg class="s18" viewBox="0 0 24 24" ><path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6"/></svg>`,
capacity:`<svg class="s18" viewBox="0 0 24 24" ><circle cx="9" cy="7" r="3"/><path d="M3 20c0-3.3 2.7-5 6-5s6 1.7 6 5"/><circle cx="17" cy="8" r="2.5"/><path d="M15 19c0-2.3 1.5-4 4.5-4"/></svg>`,
air:`<svg class="s18" viewBox="0 0 24 24" ><path d="M22 2 11 13M22 2 15 22l-4-9-9-4 20-7z"/></svg>`,
land:`<svg class="s18" viewBox="0 0 24 24" ><rect x="1" y="6" width="22" height="12" rx="3"/><path d="M7 18v2M17 18v2M1 12h22M7 6V4M17 6V4"/></svg>`,
sleep:`<svg class="s18" viewBox="0 0 24 24" ><path d="M2 17V8c0-1.1.9-2 2-2h7a2 2 0 0 1 2 2v2h4a3 3 0 0 1 3 3v4"/><path d="M2 17h20M5 17v2M19 17v2"/></svg>`,
};
function getChipSvg(key){return svgIcons[key]||svgIcons.days;}
document.getElementById('cdsInfoStrip').innerHTML=chips.map(c=>`
<div class="cds-infostrip-item">
<div class="cds-infostrip-icon">${getChipSvg(c.svgKey||'days')}</div>
<div class="cds-infostrip-val">${c.val}</div>
<div class="cds-infostrip-lbl">${c.lbl}</div>
</div>`).join('');
const allNodes=[
{dot:'origin',name:origin||'مبدأ',sub:'مبدأ'},
...stops.map(s=>({dot:'stop',name:s,sub:'توقف'})),
{dot:'origin',name:origin||'مبدأ',sub:'بازگشت'},
];
let trackHTML='';
allNodes.forEach((n,i)=>{
if(i>0)trackHTML+='<div class="cds-rm-conn"></div>';
trackHTML+=`<div class="cds-rm-node">
<div class="cds-rm-dot ${n.dot}"></div>
<div class="cds-rm-city">${n.name}</div>
<div class="cds-rm-sub">${n.sub}</div>
</div>`;
});
document.getElementById('cdsRouteTrack').innerHTML=trackHTML;
// Build trip type section — only show raw sub text from data
const subText=data.sub||'';
document.getElementById('cdsTripType').innerHTML=subText
?`<div class="cds-tt-sub-box">${subText}</div>`
:'';
document.getElementById('cdsSheet').classList.add('open');
document.getElementById('cdsOverlay').classList.add('open');
document.getElementById('cdsScroll').scrollTop=0;
}
function closeSheet(){
document.getElementById('cdsSheet').classList.remove('open');
document.getElementById('cdsOverlay').classList.remove('open');
}
function toggleCdsAddon(el,price){
el.classList.toggle('checked');
cdsAddons=(document.getElementById('cdsAddonSim').classList.contains('checked')?350000:0)
+(document.getElementById('cdsAddonIns').classList.contains('checked')?150000:0);
updateCdsPrice();
}
function toggleAddon(){}
function updateCdsPrice(){
document.getElementById('cdsPrice').textContent=cdsBase.toLocaleString('fa-IR');
document.getElementById('cdsTotalPrice').textContent=(cdsBase+cdsAddons).toLocaleString('fa-IR')+' ت';
}
function toggleAddon(){}
function confirmTrip(){
closeSheet();
const hotels=[];
if(window._cdsData){
const d=window._cdsData;
if(d.hotels&&d.hotels.length)d.hotels.forEach(h=>hotels.push(h));
else if(d.hotel&&d.hotel.name)hotels.push({city:'کربلا',...d.hotel});
}
openPilgrimSheet({
tripTitle:window._cdsData?.title||'سفر زیارتی',
hotels,
totalPrice:cdsBase+cdsAddons,
addons:[
document.getElementById('cdsAddonSim').classList.contains('checked')?'سیم‌کارت عراقی':null,
document.getElementById('cdsAddonIns').classList.contains('checked')?'بیمه مسافرتی':null,
].filter(Boolean)
});
}
function openModal(i){
if(!variants||!variants[i])return;
const cv=variants[i];
const td=fs.karbala+fs.najaf+1;
const days=buildItinerary();
const gradRaw=cv.heroGrad||'135deg,#0F4D3A,#CFA13A';
const gradParts=gradRaw.split(',');
const gradColors=gradParts.slice(1).join(',');
openSheet({
tag:'✦ سفر انفرادی',
title:`${td.toLocaleString('fa-IR')}روز | ${ml[fs.mode]}از ${fs.origin}`,
grad:gradColors,
price:cv.price,
origin:fs.origin,
transport:fs.mode,
stops:['کربلا','نجف'],
hotel:{name:cv.hotel.name,stars:cv.hotel.stars,dist:cv.hotel.dist},
hotels:[
{city:'کربلا',name:cv.hotel.name,stars:cv.hotel.stars,dist:cv.hotel.dist},
{city:'نجف',name:'هتل الصادق',stars:'۳★',dist:'۳۰۰ متر'},
...(fs.kazsamarra==='stay'?[{city:'کاظمین/سامرا',name:fs.hotelName.kazsamarra||'هتل کاظمین/سامرا',stars:'★★★★',dist:'۱۵۰ متر'}]:[]),
],
chips:[
{svgKey:'days',lbl:'مدت سفر',val:td.toLocaleString('fa-IR')+' روز'},
{svgKey:'sleep',lbl:'کربلا',val:fs.karbala.toLocaleString('fa-IR')+' شب'},
{svgKey:'sleep',lbl:'نجف',val:fs.najaf.toLocaleString('fa-IR')+' شب'},
{svgKey:fs.mode==='land'?'land':'air',lbl:'نوع سفر',val:ml[fs.mode]},
],
days
});
}
function openCaravanSheet(ci){
const c=caravans[ci];
const fa2n=s=>parseInt(s.replace(/[۰-۹]/g,d=>'۰۱۲۳۴۵۶۷۸۹'.indexOf(d)).replace(/[^0-9]/g,''))||0;
const price=fa2n(c.price);
const dayCount=fa2n((c.title.match(/^[\d۰-۹]+/)||['7'])[0])||7;
const origin=(c.badges.find(b=>b.startsWith('از'))||'از تهران').replace('از ','');
const isAir=c.title.includes('هوایی');
const subParts=c.sub.split('·').map(s=>s.trim());
const hotelRaw=subParts[0]||'';
const starMatch=hotelRaw.match(/([۱-۵\d])★/);
const hotel={
name:hotelRaw.replace(/[۱-۵\d]★/,'').replace('هتل','هتل').trim()||hotelRaw,
stars:starMatch ? '★'.repeat(parseInt(starMatch[1].replace(/[۰-۹]/g,d=>'۰۱۲۳۴۵۶۷۸۹'.indexOf(d))))||starMatch[0]:'',
dist:subParts.find(p=>p.includes('متر'))||''
};
const departure=(c.meta.match(/اعزام\s+(.+?)\s*·/)||[])[1]||'—';
const capacity=(c.meta.match(/ظرفیت:\s*(.+)/)||[])[1]||'—';
const itinerary=[
`حرکت از ${origin}— ${isAir?'پرواز مستقیم به کربلا':'حرکت با اتوبوس VIP از مرز مهران'}`,
'اقامت در کربلا — زیارت حرم مطهر امام حسین(ع)و حضرت ابوالفضل(ع)',
'ادامه اقامت در کربلا — زیارت و اوقات فراغت',
'بازدید از کاظمین — زیارت حرم امام کاظم و امام جواد(ع)',
'انتقال به نجف اشرف — زیارت حرم امام علی(ع)',
'ادامه اقامت در نجف — بازدید از وادی‌السلام',
'بازگشت به وطن',
].slice(0,dayCount);
openSheet({
tag:'🚌 کاروان گروهی',
title:c.title,
grad:c.grad,
price,
origin,
transport:isAir?'air':'land',
stops:c.badges.filter(b=>!b.startsWith('از')),
hotel,
hotels:[
{city:'کربلا',name:hotel.name||'هتل کربلا',stars:hotel.stars,dist:hotel.dist},
{city:'نجف',name:'هتل الصادق',stars:'۳★',dist:'۳۰۰ متر'},
{city:'کاظمین',name:'هتل الحسنین',stars:'۳★',dist:'۱۵۰ متر'},
],
chips:[
{svgKey:'days',lbl:'مدت سفر',val:c.title.split('|')[0].trim()},
{svgKey:'date',lbl:'تاریخ اعزام',val:departure},
{svgKey:'capacity',lbl:'ظرفیت',val:capacity},
{svgKey:isAir?'air':'land',lbl:'نوع سفر',val:isAir?'هوایی':'زمینی'},
],
days:itinerary,
sub:c.sub||'',
});
}
function setCity(city){
document.getElementById('origin-select').value=city;
fs.origin=city;
document.getElementById('s1-confirm-text').textContent=city+' انتخاب شد';
const c=document.getElementById('s1-confirm');
c.style.animation='none';requestAnimationFrame(()=>{c.style.animation='conf-in .28s cubic-bezier(.2,.8,.2,1)both';});
}
document.getElementById('city-grid').addEventListener('click',function(e){
const btn=e.target.closest('.city-card');if(!btn)return;
document.querySelectorAll('.city-card').forEach(b=>b.classList.remove('active'));
btn.classList.add('active');
document.querySelectorAll('.cdd-item').forEach(b=>b.classList.remove('selected'));
document.getElementById('cdd-val').textContent='انتخاب کنید';
setCity(btn.dataset.city);
});
(function(){
const trigger=document.getElementById('cdd-trigger');
const menu=document.getElementById('cdd-menu');
trigger.addEventListener('click',function(){
const open=menu.hidden;menu.hidden=!open;
trigger.setAttribute('aria-expanded',String(open));
});
menu.addEventListener('click',function(e){
const item=e.target.closest('.cdd-item');if(!item)return;
document.querySelectorAll('.cdd-item').forEach(b=>b.classList.remove('selected'));
item.classList.add('selected');
document.getElementById('cdd-val').textContent=item.dataset.city;
document.querySelectorAll('.city-card').forEach(b=>b.classList.remove('active'));
menu.hidden=true;trigger.setAttribute('aria-expanded','false');
setCity(item.dataset.city);
});
document.addEventListener('click',function(e){
if(!document.getElementById('cdd').contains(e.target)){menu.hidden=true;trigger.setAttribute('aria-expanded','false');}
});
})();
(function(){const w=document.getElementById('word-rotate'),words=w.children;let i=0;setInterval(()=>{words[i].classList.remove('active');i=(i+1)%words.length;words[i].classList.add('active');},2200);})();
(function(){
const stage=document.getElementById('hscStage');
if(!stage)return;
let on=false;
function assemble(){on=true;stage.classList.add('assembled');}
function scatter(){on=false;stage.classList.remove('assembled');}
function cycle(){scatter();setTimeout(assemble,3000);setTimeout(cycle,8200);}
setTimeout(cycle,800);
})();
(function(){
const slides=document.querySelectorAll('.adslide');
const dots=document.querySelectorAll('.ads-dot');
let cur=0,timer;
function go(n){
const prev=cur;
slides[prev].classList.remove('active');slides[prev].classList.add('exit');
dots[prev].classList.remove('active');
setTimeout(()=>slides[prev].classList.remove('exit'),560);
cur=n;
slides[cur].classList.add('active');dots[cur].classList.add('active');
}
function next(){go((cur+1)%slides.length);}
function reset(){clearInterval(timer);timer=setInterval(next,4200);}
dots.forEach(d=>d.addEventListener('click',()=>{go(+d.dataset.dot);reset();}));
reset();
})();
function toggleAbout(){
  const drawer = document.getElementById('about-drawer');
  const overlay = document.getElementById('about-overlay');
  const open = drawer.classList.toggle('open');
  overlay.classList.toggle('open', open);
}

const chatData={
open:false,
msgs:[],
botReplies:{
'بهترین هتل‌های کربلا':'هتل بیت‌العباس(۵★)با ۸۰ متر فاصله تا حرم، هتل کوثر(۴★)با ۲۰۰ متر، و هتل المصطفی(۳★)با ۴۵۰ متر از گزینه‌های پرطرفدار کربلا هستند. بودجه‌ات چقدره؟',
'قیمت سفر هوایی':'سفر هوایی کربلا+نجف(۷ روز)از تهران معمولاً بین ۱۳ تا ۲۵ میلیون تومان متغیره. تاریخ سفرت مهم‌ترین عامله. می‌تونم قیمت دقیق برات بیارم.',
'مدارک لازم برای ویزا':'برای ویزای عراق جهت زیارت نیاز به پاسپورت معتبر(حداقل ۶ ماه)، کارت ملی، عکس ۴×۳ و فرم درخواست دارید. ویزا معمولاً در فرودگاه صادر می‌شه.',
'کاروان‌های تیر ماه':'در تیر ماه کاروان‌های ۲۰ تیر(از تهران)، ۲۵ تیر(از مشهد)و ۲۸ تیر(از اصفهان)داریم. ظرفیت محدوده — می‌خوای رزرو کنی؟',
'default':'ممنون از سؤالت!برای اطلاعات دقیق‌تر درباره سفرهای زیارتی آوان، می‌تونی با تیم پشتیبانی ما تماس بگیری یا از فرم سفرساز استفاده کنی. ✦'
}
};
function toggleChat(){
chatData.open=!chatData.open;
document.getElementById('chat-drawer').classList.toggle('open',chatData.open);
document.getElementById('chat-overlay').classList.toggle('open',chatData.open);
if(chatData.open&&!chatData.msgs.length){
setTimeout(()=>addBotMsg('سلام!👋 من دستیار هوشمند آوانم. چطور می‌تونم تو برنامه‌ریزی سفر زیارتیت کمکت کنم؟'),300);
}
}
function addMsg(text,role){
const now=new Date().toLocaleTimeString('fa-IR',{hour:'2-digit',minute:'2-digit'});
chatData.msgs.push({text,role,time:now});
renderMsgs();
}
function addBotMsg(text){
const el=document.createElement('div');
el.className='chat-typing';
el.innerHTML='<span></span><span></span><span></span>';
const c=document.getElementById('chat-msgs');
c.appendChild(el);c.scrollTop=c.scrollHeight;
setTimeout(()=>{el.remove();addMsg(text,'bot');},900);
}
function renderMsgs(){
const c=document.getElementById('chat-msgs');
c.innerHTML=chatData.msgs.map(m=>`<div class="chat-msg ${m.role}"><div class="chat-bubble">${m.text}</div><div class="chat-msg-time">${m.time}</div></div>`).join('');
c.scrollTop=c.scrollHeight;
}
function sendMsg(){
const inp=document.getElementById('chat-input');
const text=inp.value.trim();
if(!text)return;
inp.value='';
document.getElementById('chat-sugs').style.display='none';
addMsg(text,'user');
const reply=Object.keys(chatData.botReplies).find(k=>text.includes(k));
addBotMsg(chatData.botReplies[reply||'default']);
}
function sendSug(btn){
const text=btn.textContent;
document.getElementById('chat-sugs').style.display='none';
addMsg(text,'user');
addBotMsg(chatData.botReplies[text]||chatData.botReplies['default']);
}
document.getElementById('chat-input').addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendMsg();}});
const caravans=[
{grad:'#0F4D3A,#CFA13A',title:'۷ روز | هوایی از تهران',price:'۱۹,۵۰۰,۰۰۰',badges:['کربلا ۴ شب','نجف ۲ شب','از تهران'],meta:'🗓 اعزام ۲۰ تیر · ظرفیت:۴ نفر',sub:'هتل ۴★ · ۲۰۰ متر تا حرم'},
{grad:'#CFA13A,#0F4D3A',title:'۱۰ روز | زمینی(مهران)',price:'۱۴,۸۰۰,۰۰۰',badges:['کربلا ۵ شب','نجف ۳ شب','از مشهد'],meta:'🗓 اعزام ۲۵ تیر · ظرفیت:۹ نفر',sub:'هتل ۳★ · اتوبوس VIP'},
{grad:'#1F6F6B,#0F4D3A',title:'۵ روز | هوایی از اصفهان',price:'۲۲,۳۰۰,۰۰۰',badges:['کربلا ۳ شب','نجف ۱ شب','از اصفهان'],meta:'🗓 اعزام ۱ مرداد · ظرفیت:۲ نفر',sub:'هتل ۵★ · ۸۰ متر تا حرم'},
];
// ── Live home-page stats — same source as group caravan page ──
function updateHomeStats(){
  var fa2n=function(s){return parseInt(String(s).replace(/[۰-۹]/g,function(d){return '۰۱۲۳۴۵۶۷۸۹'.indexOf(d)}))||0;};
  var n2fa=function(n){return Number(n).toLocaleString('fa-IR');};
  var activeCaravans=caravans.length;
  var origins=new Set(caravans.map(function(c){var b=(c.badges||[]).find(function(b){return b.startsWith('از');});return b?b.replace('از ',''):'';}).filter(Boolean));
  var totalCap=caravans.reduce(function(sum,c){var m=(c.meta||'').match(/ظرفیت[:\s]*([۰-۹\d]+)/);return sum+(m?fa2n(m[1]):0);},0);
  var days=caravans.map(function(c){var m=(c.title||'').match(/^([۰-۹\d]+)/);return m?fa2n(m[1]):0;}).filter(function(d){return d>0;});
  var avgDays=days.length?Math.round(days.reduce(function(a,b){return a+b;},0)/days.length):0;
  var tsTotalEl=document.getElementById('tsTotal');
  if(tsTotalEl) tsTotalEl.textContent=n2fa(activeCaravans);
  var el=document.getElementById('tsLiveCaravans'); if(el) el.textContent=n2fa(activeCaravans);
  var el2=document.getElementById('tsLiveOrigins'); if(el2) el2.textContent=n2fa(origins.size);
  var el3=document.getElementById('tsLiveCap'); if(el3) el3.textContent=totalCap?n2fa(totalCap):'—';
  var el4=document.getElementById('tsLiveDays'); if(el4) el4.textContent=avgDays?n2fa(avgDays):'—';
}


const JALALI_MONTHS={
'فروردین':1,'اردیبهشت':2,'خرداد':3,'تیر':4,'مرداد':5,'شهریور':6,
'مهر':7,'آبان':8,'آذر':9,'دی':10,'بهمن':11,'اسفند':12
};
function getDepDate(meta){
const fa2n=s=>parseInt(String(s).replace(/[۰-۹]/g,d=>'۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))||0;
const m=meta.match(/اعزام\s+([۰-۹\d]+)\s+([\u0600-\u06FF]+)/);
if(!m||!JALALI_MONTHS[m[2]])return null;
return{d:fa2n(m[1]),m:JALALI_MONTHS[m[2]]-1};
}
function parseCaravanDate(meta){
const dep=getDepDate(meta);
return dep?dep.m*100+dep.d:9999*100+99;
}
function extractDateLabel(meta){
const m=meta.match(/اعزام\s+([۰-۹\d]+\s+[\u0600-\u06FF]+)/);
return m?m[1]:'';
}
function sortCaravansByDate(arr){
return [...arr].sort((a,b)=>parseCaravanDate(a.meta)-parseCaravanDate(b.meta));
}
const MINI_LIMIT=2;
const GROUP_PAGE_SIZE=10;
let groupPage=1;
let groupFullList=caravans;
function renderCaravans(el,mini,list){
const full=sortCaravansByDate(list||caravans);
if(!full.length){el.innerHTML='<p style="text-align:center;padding:24px;color:var(--is);font-size:13px;">کاروانی با این فیلتر پیدا نشد</p>';return;}
let src=full;
let pagHtml='';
if(mini){
src=full.slice(0,MINI_LIMIT);
}else{
groupFullList=full;
const totalPages=Math.max(1,Math.ceil(full.length/GROUP_PAGE_SIZE));
if(groupPage>totalPages)groupPage=totalPages;
if(groupPage<1)groupPage=1;
const start=(groupPage-1)*GROUP_PAGE_SIZE;
src=full.slice(start,start+GROUP_PAGE_SIZE);
pagHtml=renderGroupPagination(totalPages,groupPage);
}
const cardsHtml=src.map(c=>{
const ci=caravans.indexOf(c);
const fa2n=s=>parseInt(String(s).replace(/[۰-۹]/g,d=>'۰۱۲۳۴۵۶۷۸۹'.indexOf(d))||'0')||0;
const dayMatch=c.title.match(/^([۰-۹\d]+)/);
const dayCount=dayMatch?fa2n(dayMatch[1]):1;
const isTransit=dayCount===0;
const titleDisplay=isTransit
?c.title.replace(/^[۰-۹\d]+\s*روز\s*\|?\s*/,'').trim()
:c.title;
const transitBadge=isTransit?`<span class="badge badge-transit">عبوری</span>`:'';
const bdg=c.badges.map(b=>`<span class="badge">${b}</span>`).join('');
const dateLabel=extractDateLabel(c.meta);
const dateBadgeHtml=dateLabel?`<div class="cvc-date-badge"><svg viewBox="0 0 24 24" style="width:11px;height:11px;fill:none;stroke:currentColor;stroke-width:2.5;stroke-linecap:round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>${dateLabel}</div>`:'';
const capLabel=(c.meta.match(/ظرفیت:\s*(.+)/)||[])[1];
const capBadgeHtml=capLabel?`<div class="cvc-cap-badge"><svg viewBox="0 0 24 24" style="width:11px;height:11px;fill:none;stroke:currentColor;stroke-width:2.5;stroke-linecap:round"><circle cx="12" cy="8" r="3.2"/><path d="M5 20c0-3.9 3.1-7 7-7s7 3.1 7 7"/></svg>${capLabel}</div>`:'';
return mini
?`<div class="cvc-mini" onclick="openPanel('group')">
<div class="cvs" style="background:linear-gradient(${c.grad})"></div>
<div class="cvb">
<div class="cvt"><div class="cvtitle">${isTransit?`<span class="cvtitle-transit">عبوری</span> ${titleDisplay}`:titleDisplay}</div><div class="cvprice"><small>هر نفر از</small>${c.price}ت</div></div>
<div class="badges">${bdg}</div>
<div class="meta">${c.meta}</div>
</div>
</div>`
:`<article class="cvc" style="cursor:pointer" onclick="openCaravanSheet(${ci})">
<div class="cvs" style="background:linear-gradient(${c.grad})"></div>
<div class="cvb">
<div class="cvc-top-badges">${dateBadgeHtml}${capBadgeHtml}</div>
<div class="cvt"><div class="cvtitle">${isTransit?`<span class="cvtitle-transit">عبوری</span> ${titleDisplay}`:titleDisplay}</div><div class="cvprice"><small>هر نفر از</small>${c.price}ت</div></div>
<div class="badges">${transitBadge}${bdg}</div>
<div class="cvf"><span style="font-size:11px;color:var(--is);">${c.sub}</span><button class="btn btn-p btn-sm" onclick="event.stopPropagation();openCaravanSheet(${ci})">مشاهده و رزرو</button></div>
</div>
</article>`;
}).join('');
el.innerHTML=cardsHtml+pagHtml;
}
function renderGroupPagination(totalPages,page){
if(totalPages<=1)return '';
let btns='';
for(let i=1;i<=totalPages;i++){
btns+=`<button class="cgrid-page-btn${i===page?' active':''}" onclick="goToGroupPage(${i})">${i.toLocaleString('fa-IR')}</button>`;
}
return `<div class="cgrid-pagination">
<button class="cgrid-page-nav" onclick="goToGroupPage(${page-1})" ${page<=1?'disabled':''} aria-label="صفحه قبل">
<svg class="si" width="14" height="14" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg>
</button>
${btns}
<button class="cgrid-page-nav" onclick="goToGroupPage(${page+1})" ${page>=totalPages?'disabled':''} aria-label="صفحه بعد">
<svg class="si" width="14" height="14" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg>
</button>
</div>`;
}
function goToGroupPage(n){
const grid=document.getElementById('cgrid-group');
if(!grid)return;
const totalPages=Math.max(1,Math.ceil(groupFullList.length/GROUP_PAGE_SIZE));
if(n<1||n>totalPages)return;
groupPage=n;
renderCaravans(grid,false,groupFullList);
grid.scrollIntoView({behavior:'smooth',block:'start'});
}
(function(){
const el=document.getElementById('cstBar');
if(!el)return;
function calcStats(){
const fa2n=s=>parseInt(String(s).replace(/[۰-۹]/g,d=>'۰۱۲۳۴۵۶۷۸۹'.indexOf(d))||'0')||0;
const activeCaravans=caravans.length;
const origins=new Set(caravans.map(c=>(c.badges.find(b=>b.startsWith('از'))||'').replace('از ','')).filter(Boolean));
const totalCap=caravans.reduce((sum,c)=>{
const m=c.meta.match(/ظرفیت[:\s]*([۰-۹\d]+)/);
return sum+(m?fa2n(m[1]):0);
},0);
const days=caravans.map(c=>{const m=c.title.match(/^([۰-۹\d]+)/);return m?fa2n(m[1]):0;}).filter(d=>d>0);
const avgDays=days.length?Math.round(days.reduce((a,b)=>a+b,0)/days.length):0;
return [
{num:activeCaravans.toLocaleString('fa-IR'),lbl:'کاروان فعال'},
{num:origins.size.toLocaleString('fa-IR'),lbl:'شهر مبدأ'},
{num:totalCap?totalCap.toLocaleString('fa-IR'):'—',lbl:'نفر ظرفیت'},
{num:avgDays?avgDays.toLocaleString('fa-IR'):'—',lbl:'روز میانگین'},
];
}
function renderStats(){
el.innerHTML=calcStats().map((s,i)=>`<div class="cst-item" style="animation-delay:${i*.08}s">
<div class="cst-num">${s.num}</div>
<div class="cst-lbl">${s.lbl}</div>
</div>`).join('');
}
renderStats();
window._refreshCstBar=renderStats;
})();
// ── Hotels & Airlines Quick-Facts Banner (Home) — Count-up ──
(function(){
const banner=document.getElementById('qabBanner');
if(!banner)return;
const nums=banner.querySelectorAll('.qab-stat-num');
const toFa=n=>n.toLocaleString('fa-IR');
function animateNum(el){
  const target=parseInt(el.dataset.target,10)||0;
  const duration=1100;
  const t0=performance.now();
  function tick(now){
    const p=Math.min((now-t0)/duration,1);
    const eased=1-Math.pow(1-p,3); // easeOutCubic
    el.textContent=toFa(Math.round(eased*target));
    if(p<1)requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}
function runOnce(){
  nums.forEach(animateNum);
}
// ── Typewriter: rotates short, interactive lines through the lead text ──
const leadTextEl=document.getElementById('qabLeadText');
const qabPhrases=[
  'این امکانات رو برات فراهم کرده‌ایم',
  'بدون واسطه، مستقیم با شما',
  'بهترین قیمت رو تضمین می‌کنیم',
  'نزدیک‌ترین هتل‌ها به حرم',
];
function startTypewriter(){
  if(!leadTextEl||leadTextEl.dataset.started)return;
  leadTextEl.dataset.started='1';
  let phraseIdx=0,charIdx=0,typing=true;
  const TYPE_SPEED=55,DELETE_SPEED=28,HOLD_FULL=1900,HOLD_EMPTY=350;
  function step(){
    const current=qabPhrases[phraseIdx];
    if(typing){
      charIdx++;
      leadTextEl.textContent=current.slice(0,charIdx);
      if(charIdx>=current.length){
        typing=false;
        setTimeout(step,HOLD_FULL);
        return;
      }
      setTimeout(step,TYPE_SPEED);
    }else{
      charIdx--;
      leadTextEl.textContent=current.slice(0,Math.max(charIdx,0));
      if(charIdx<=0){
        typing=true;
        phraseIdx=(phraseIdx+1)%qabPhrases.length;
        setTimeout(step,HOLD_EMPTY);
        return;
      }
      setTimeout(step,DELETE_SPEED);
    }
  }
  step();
}
if('IntersectionObserver' in window){
  const io=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        runOnce();
        startTypewriter();
        io.disconnect();
      }
    });
  },{threshold:.35});
  io.observe(banner);
}else{
  runOnce();
  startTypewriter();
}
})();

(function(){
const jalaliMonths=['فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور','مهر','آبان','آذر','دی','بهمن','اسفند'];
const dpm=[31,31,31,31,31,31,30,30,30,30,30,29];
const firstDays=[5,1,4,0,3,5,1,4,0,2,5,1];
let curMonth=3;
let selStart=null,selEnd=null;
let filterCity='all',filterMode='all';
const daysEl=document.getElementById('gcalDays');
const labelEl=document.getElementById('gcalMonthLabel');
const rangeTextEl=document.getElementById('gcalRangeText');
const clearBtn=document.getElementById('gcalClear');
function toFa(n){return n.toLocaleString('fa-IR');}
function renderCal(dir){
if(daysEl&&dir){
daysEl.classList.remove('slide-left','slide-right');
void daysEl.offsetWidth;
daysEl.classList.add(dir==='next'?'slide-left':'slide-right');
}
if(labelEl)labelEl.textContent=jalaliMonths[curMonth]+' ۱۴۰۵';
const total=dpm[curMonth];
const firstDay=firstDays[curMonth];
const deps=caravans.map(c=>getDepDate(c.meta)).filter(x=>x&&x.m===curMonth);
const depDays=deps.map(x=>x.d);
let html='';
for(let i=0;i<firstDay;i++)html+=`<div class="gcal-day gcal-day--empty"></div>`;
for(let d=1;d<=total;d++){
const hasDep=depDays.includes(d);
const isSel=selStart&&selStart.m===curMonth&&selStart.d===d;
const isEnd=selEnd&&selEnd.m===curMonth&&selEnd.d===d;
const inRng=selStart&&selEnd&&(
(curMonth===selStart.m&&curMonth===selEnd.m&&d>selStart.d&&d<selEnd.d)||
(curMonth>selStart.m&&curMonth<selEnd.m)||
(curMonth===selStart.m&&selEnd.m>selStart.m&&d>selStart.d)||
(curMonth===selEnd.m&&selStart.m<selEnd.m&&d<selEnd.d)
);
let cls='gcal-day';
if(hasDep)cls+=' gcal-day--has';
if(isSel)cls+=' gcal-day--selected gcal-day--range-start';
else if(isEnd)cls+=' gcal-day--selected gcal-day--range-end';
else if(inRng)cls+=' gcal-day--in-range';
html+=`<div class="${cls}" data-d="${d}" data-m="${curMonth}">
<span class="gcal-day-num">${toFa(d)}</span>
${hasDep?'<div class="gcal-day-dot gcal-dep-pulse"></div>':''}
</div>`;
}
if(daysEl)daysEl.innerHTML=html;
updateRangeText();
bindDayClicks();
}
function updateRangeText(){
if(!selStart){
rangeTextEl.textContent='روز اعزام را انتخاب کنید';
rangeTextEl.classList.remove('active');
if(clearBtn)clearBtn.style.display='none';
}else{
const s=jalaliMonths[selStart.m]+' '+toFa(selStart.d);
rangeTextEl.textContent='اعزام:'+s+(selEnd?' · بازگشت:'+jalaliMonths[selEnd.m]+' '+toFa(selEnd.d):'');
rangeTextEl.classList.add('active');
if(clearBtn)clearBtn.style.display='';
}
filterCaravans();
}
function bindDayClicks(){
daysEl.querySelectorAll('.gcal-day:not(.gcal-day--empty)').forEach(el=>{
el.addEventListener('click',()=>{
const d=+el.dataset.d,m=+el.dataset.m;
if(!selStart||selEnd){
selStart={d,m};selEnd=null;
renderCal();
showRangePopup(d,m);
}else{
const after=m>selStart.m||(m===selStart.m&&d>selStart.d);
if(after){selEnd={d,m};}
else{selStart={d,m};selEnd=null;}
renderCal();
}
});
});
}
function showRangePopup(d,m){
const popup=document.getElementById('rangePopup');
const sub=document.getElementById('rangePopupSub');
const optsEl=document.getElementById('rangePopupOpts');
const mn=jalaliMonths[m];
sub.textContent=`اعزام از ${mn}${toFa(d)}— تا چه بازه‌ای کاروان نشون بدم؟`;
const opts=[
{days:3,lbl:'۳ روز بعد'},
{days:7,lbl:'یک هفته'},
{days:14,lbl:'دو هفته'},
{days:30,lbl:'یک ماه'},
];
const endOf=days=>{
const nd=d+days,maxD=dpm[m];
return nd<=maxD?{d:nd,m}:{d:nd-maxD,m:m<11?m+1:0};
};
optsEl.innerHTML=opts.map(o=>{
const end=endOf(o.days);
return `
<button class="gcal-range-opt" data-days="${o.days}">
<strong>${o.lbl}</strong>
<span>تا ${toFa(end.d)}${jalaliMonths[end.m]}</span>
</button>`;
}).join('');
optsEl.querySelectorAll('.gcal-range-opt').forEach(btn=>{
btn.addEventListener('click',()=>{
selEnd=endOf(+btn.dataset.days);
popup.classList.remove('open');
renderCal();
});
});
document.getElementById('rangePopupSkip').onclick=()=>popup.classList.remove('open');
popup.onclick=e=>{if(e.target===popup)popup.classList.remove('open');};
popup.classList.add('open');
}
function filterCaravans(){
const grid=document.getElementById('cgrid-group');
if(!grid)return;
let list=caravans.filter(c=>{
if(filterCity!=='all'&&!c.badges.some(b=>b.includes(filterCity)))return false;
if(filterMode==='air'&&!c.title.includes('هوایی'))return false;
if(filterMode==='land'&&!c.title.includes('زمینی'))return false;
if(selStart){
const dep=getDepDate(c.meta);
if(!dep)return false;
const afterStart=dep.m>selStart.m||(dep.m===selStart.m&&dep.d>=selStart.d);
const beforeEnd=!selEnd||(dep.m<selEnd.m||(dep.m===selEnd.m&&dep.d<=selEnd.d));
if(!afterStart||!beforeEnd)return false;
}
return true;
});
groupPage=1;
renderCaravans(grid,false,list);
}
document.getElementById('gcalPrev')?.addEventListener('click',()=>{if(curMonth>0){curMonth--;renderCal('prev');}});
document.getElementById('gcalNext')?.addEventListener('click',()=>{if(curMonth<11){curMonth++;renderCal('next');}});
function getOriginCities(){
const set=new Set();
caravans.forEach(c=>{
c.badges.forEach(b=>{
const m=b.match(/^از\s+(.+)$/);
if(m)set.add(m[1].trim());
});
});
return Array.from(set);
}
function buildCityMenu(){
const menu=document.getElementById('gcalCityMenu');
const labelEl2=document.getElementById('gcalCityLabel');
if(!menu)return;
const items=[{val:'all',lbl:'همه شهرها'},...getOriginCities().map(c=>({val:c,lbl:'از '+c}))];
if(!items.some(i=>i.val===filterCity))filterCity='all';
menu.innerHTML=items.map(i=>`<button type="button" class="gcal-city-opt${i.val===filterCity?' active':''}" data-city="${i.val}" role="option" aria-selected="${i.val===filterCity}">
<span>${i.lbl}</span>
${i.val===filterCity?'<svg class="si" width="14" height="14" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>':''}
</button>`).join('');
const active=items.find(i=>i.val===filterCity);
if(labelEl2&&active)labelEl2.textContent=active.lbl;
}
function closeCityMenu(){
document.getElementById('gcalCityMenu')?.classList.remove('open');
document.getElementById('gcalCityBtn')?.setAttribute('aria-expanded','false');
}
const cityBtn=document.getElementById('gcalCityBtn');
const cityMenu=document.getElementById('gcalCityMenu');
buildCityMenu();
cityBtn?.addEventListener('click',e=>{
e.stopPropagation();
const isOpen=cityMenu?.classList.contains('open');
if(isOpen){closeCityMenu();}
else{cityMenu?.classList.add('open');cityBtn.setAttribute('aria-expanded','true');}
});
cityMenu?.addEventListener('click',e=>{
const opt=e.target.closest('.gcal-city-opt');
if(!opt)return;
filterCity=opt.dataset.city;
buildCityMenu();
closeCityMenu();
filterCaravans();
});
document.addEventListener('click',e=>{
if(!cityMenu||!cityMenu.classList.contains('open'))return;
if(!cityMenu.contains(e.target)&&e.target!==cityBtn&&!cityBtn?.contains(e.target))closeCityMenu();
});
window._refreshGcalCityMenu=buildCityMenu;
window._refreshGcal=()=>renderCal();
document.querySelectorAll('.gcal-mode-btn').forEach(btn=>{
btn.addEventListener('click',()=>{
document.querySelectorAll('.gcal-mode-btn').forEach(b=>b.classList.remove('active'));
btn.classList.add('active');
filterMode=btn.dataset.mode;
filterCaravans();
});
});
clearBtn?.addEventListener('click',()=>{selStart=null;selEnd=null;renderCal();});
renderCal();
})();
renderCaravans(document.getElementById('cvt-list'),true);
(function(){
const months=[
{lbl:'فر',name:'فروردین',score:92,type:'best',tip:'قیمت مناسب\nآب‌وهوای عالی',best:true},
{lbl:'ار',name:'اردیبهشت',score:88,type:'best',tip:'کمترین ازدحام\nبهترین قیمت'},
{lbl:'خر',name:'خرداد',score:58,type:'mid',tip:'گرم‌تر می‌شه\nقیمت متوسط'},
{lbl:'تی',name:'تیر',score:32,type:'hot',tip:'گرمای شدید\nازدحام زیاد'},
{lbl:'مر',name:'مرداد',score:28,type:'hot',tip:'پیک فصل\nقیمت بالا'},
{lbl:'شه',name:'شهریور',score:40,type:'mid',tip:'کمی خنک‌تر\nقیمت متوسط'},
{lbl:'مه',name:'مهر',score:78,type:'good',tip:'آب‌وهوای خوب\nقیمت مناسب'},
{lbl:'آب',name:'آبان',score:84,type:'best',tip:'فصل اربعین\nتجربه خاص'},
{lbl:'آذ',name:'آذر',score:70,type:'good',tip:'هوای دلپذیر\nکمتر شلوغ'},
{lbl:'دی',name:'دی',score:55,type:'mid',tip:'سرد و بارانی\nقیمت پایین'},
{lbl:'به',name:'بهمن',score:60,type:'mid',tip:'آب‌وهوای معتدل\nقیمت خوب'},
{lbl:'اس',name:'اسفند',score:74,type:'good',tip:'قبل از نوروز\nقیمت مناسب'},
];
const colors={
best:'linear-gradient(180deg,#CFA13A 0%,#E8CB8A 100%)',
good:'linear-gradient(180deg,#1a6b51 0%,#3FA66B 100%)',
mid:'linear-gradient(180deg,#5B8A70 0%,#8BB89E 100%)',
hot:'linear-gradient(180deg,#c94040 0%,#e07070 100%)',
};
const maxH=62;
const maxScore=92;
const container=document.getElementById('btwMonths');
if(!container)return;
months.forEach((m,i)=>{
const barH=Math.round((m.score/maxScore)*maxH);
const el=document.createElement('div');
el.className='btw-month'+(m.type==='best'?' btw-best':'');
el.innerHTML=`
${m.best?'<div class="btw-best-badge">✦ بهترین</div>':''}
<div class="btw-tip">${m.tip.replace('\n','<br>')}</div>
<div class="btw-bar" style="height:${barH}px;background:${colors[m.type]};transition-delay:${i*0.055}s;"></div>
<div class="btw-month-lbl">${m.lbl}</div>
`;
container.appendChild(el);
});
const bars=container.querySelectorAll('.btw-bar');
const observer=new IntersectionObserver(entries=>{
if(entries[0].isIntersecting){
bars.forEach(b=>b.classList.add('animated'));
observer.disconnect();
}
},{threshold:.3});
observer.observe(container);
})();
const modeIcons={air:'✈',land:'🚌',mixed:'✦'};
const basePrice={air:16,land:11,mixed:13};
function flipEl(el,val){if(el.textContent===val)return;el.classList.remove('lpv-flip');void el.offsetWidth;el.textContent=val;el.classList.add('lpv-flip');}
function updatePreview(){
const days=fs.karbala+fs.najaf+(fs.kazsamarra==='stay'?fs.kazsamarraNights:0)+1;
const priceRaw=Math.round((basePrice[fs.mode]+(fs.karbala+fs.najaf)*1.2)*1000);
const priceMil=Math.round(priceRaw/1000);
const priceLabel=priceMil.toLocaleString('fa-IR')+' میلیون';
flipEl(document.getElementById('lp-origin'),fs.origin);
flipEl(document.getElementById('lp-karbala'),fs.karbala.toLocaleString('fa-IR')+' شب');
flipEl(document.getElementById('lp-najaf'),fs.najaf.toLocaleString('fa-IR')+' شب');
flipEl(document.getElementById('lp-days'),days.toLocaleString('fa-IR'));
flipEl(document.getElementById('lp-mode-icon'),modeIcons[fs.mode]);
flipEl(document.getElementById('lp-mode'),ml[fs.mode]);
flipEl(document.getElementById('lp-price'),'~'+priceLabel);
}
const _origSetCity=setCity;
window.setCity=function(c){_origSetCity(c);fs.origin=c;updatePreview();}
document.querySelectorAll('.stepper').forEach(st=>{
st.querySelectorAll('button').forEach(b=>b.addEventListener('click',updatePreview));
});
document.querySelectorAll('.mc').forEach(c=>c.addEventListener('click',updatePreview));
updatePreview();


/* ══════════════════════════════════════════════════════
   Hotel Iraq Panel — data & logic
══════════════════════════════════════════════════════ */
/* ── Grade labels & photo palettes ── */
const HI_GRADE = {
  luxury: { label:'✦ لوکس', color:'#CFA13A', bg:'rgba(207,161,58,.12)', border:'rgba(207,161,58,.3)' },
  mid:    { label:'⬥ متوسط', color:'#4A90D9', bg:'rgba(74,144,217,.10)', border:'rgba(74,144,217,.25)' },
  eco:    { label:'◇ اقتصادی', color:'#5AB87A', bg:'rgba(90,184,122,.10)', border:'rgba(90,184,122,.25)' },
};

/* photo color palettes per city (SVG placeholder colours) */
const HI_PHOTO_PALETTES = {
  najaf:    [['#1a4a2e','#2d7a4f'],['#3a2a0a','#c9963a'],['#1a2a4a','#2d4a7a'],['#2a1a3a','#5a3a8a']],
  karbala:  [['#3a1a1a','#8a3a3a'],['#1a3a2a','#3a8a5a'],['#1a1a3a','#3a3a8a'],['#3a2a1a','#8a6a3a']],
  kazimiya: [['#1a3a3a','#3a8a8a'],['#2a1a3a','#6a3a8a'],['#1a2a1a','#4a7a4a'],['#3a3a1a','#8a8a3a']],
};

const HI_HOTELS = {
  najaf: [
    { name:'هتل الصادق', grade:'luxury', dist:'۸۰ متر تا حرم', m:80, rating:4.9, price:'۳/۲۰۰/۰۰۰', features:['صبحانه بوفه','وای‌فای','پارکینگ','نزدیک‌ترین به حرم','سرویس ۲۴ساعته'] },
    { name:'هتل فجر النجف', grade:'luxury', dist:'۱۵۰ متر تا حرم', m:150, rating:4.7, price:'۲/۸۰۰/۰۰۰', features:['صبحانه','استخر','سالن غذا','لابی VIP'] },
    { name:'هتل المرجان', grade:'mid', dist:'۲۵۰ متر تا حرم', m:250, rating:4.4, price:'۱/۹۰۰/۰۰۰', features:['وای‌فای','صبحانه','لابی ۲۴ساعته','رستوران'] },
    { name:'هتل قدس نجف', grade:'mid', dist:'۳۵۰ متر تا حرم', m:350, rating:4.2, price:'۱/۵۰۰/۰۰۰', features:['وای‌فای','پارکینگ','رستوران','اتاق‌های تمیز'] },
    { name:'هتل الولاء', grade:'eco', dist:'۵۰۰ متر تا حرم', m:500, rating:4.0, price:'۹۵۰/۰۰۰', features:['وای‌فای','سرویس اتاق','نزدیک بازار'] },
    { name:'هتل مهر نجف', grade:'eco', dist:'۶۵۰ متر تا حرم', m:650, rating:3.9, price:'۷۵۰/۰۰۰', features:['وای‌فای','پارکینگ','قیمت مناسب'] },
  ],
  karbala: [
    { name:'هتل عباس', grade:'luxury', dist:'۶۰ متر تا حرم', m:60, rating:4.9, price:'۳/۵۰۰/۰۰۰', features:['صبحانه','وای‌فای','نزدیک‌ترین','دید حرم از اتاق'] },
    { name:'هتل الحسینی', grade:'luxury', dist:'۱۲۰ متر تا حرم', m:120, rating:4.8, price:'۲/۹۰۰/۰۰۰', features:['صبحانه','استخر','رستوران لوکس','لابی VIP'] },
    { name:'هتل الرشید کربلا', grade:'mid', dist:'۲۸۰ متر تا حرم', m:280, rating:4.3, price:'۲/۱۰۰/۰۰۰', features:['وای‌فای','صبحانه','لابی','پارکینگ'] },
    { name:'هتل مشیر', grade:'mid', dist:'۴۰۰ متر تا حرم', m:400, rating:4.1, price:'۱/۶۵۰/۰۰۰', features:['وای‌فای','پارکینگ','رستوران','امکانات خوب'] },
    { name:'هتل الغدیر', grade:'eco', dist:'۵۵۰ متر تا حرم', m:550, rating:3.9, price:'۱/۰۵۰/۰۰۰', features:['وای‌فای','سرویس اتاق','قیمت مناسب'] },
    { name:'هتل نور کربلا', grade:'eco', dist:'۷۰۰ متر تا حرم', m:700, rating:3.8, price:'۸۲۰/۰۰۰', features:['وای‌فای','پارکینگ','اقتصادی'] },
  ],
  kazimiya: [
    { name:'هتل الکاظم', grade:'luxury', dist:'۱۰۰ متر تا حرم', m:100, rating:4.8, price:'۲/۶۰۰/۰۰۰', features:['صبحانه','وای‌فای','رستوران','سرویس ویژه'] },
    { name:'هتل الرشید کاظمین', grade:'mid', dist:'۲۲۰ متر تا حرم', m:220, rating:4.3, price:'۱/۸۰۰/۰۰۰', features:['وای‌فای','صبحانه','لابی','امکانات کامل'] },
    { name:'هتل الحرمین', grade:'eco', dist:'۴۵۰ متر تا حرم', m:450, rating:4.0, price:'۸۸۰/۰۰۰', features:['وای‌فای','پارکینگ','مناسب خانواده'] },
  ],
};

/* سقف نوار نور هر شهر — برای نگاشت متراژ به درصد طول نوار استفاده می‌شود */
const HI_CITY_MAXM = { najaf:700, karbala:750, kazimiya:480 };

/* زیرنویس هیرو به‌ازای هر شهر */
const HI_CITY_SUB = {
  najaf:    'نزدیک‌ترین هتل‌ها به حرم مولاامیرالمؤمنین(ع)، با تضمین قیمت',
  karbala:  'اقامت در قدم‌های نزدیک حرم سیدالشهدا(ع) و حضرت ابوالفضل(ع)',
  kazimiya: 'هتل‌های منتخب در فاصله‌ی پیاده تا حرم کاظمین(ع)',
};

/* نوع‌های اتاق بر اساس تعداد تخت — نرخ پایه‌ی هر هتل، نرخ «دوتخته» است.
   اتاق یک‌تخته در هتل‌های زیارتی ارائه نمی‌شود. */
const HI_ROOM_TYPES = [
  { key:'double', beds:2, label:'دوتخته', capacity:2, mult:1 },
  { key:'triple',  beds:3, label:'سه‌تخته', capacity:3, mult:1.25 },
  { key:'quad',    beds:4, label:'چهارتخته', capacity:4, mult:1.45 },
];

let hiState = { city:'najaf', grade:'all', hotel:null, rooms:1, roomType:'double' };

/* نماد تک‌رنگ تخت — استفاده‌شده در انتخاب‌گر نوع اتاق */
const HI_BED_SVG = `<svg viewBox="0 0 32 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 21v-7.5A2.5 2.5 0 0 1 4.5 11H27.5A2.5 2.5 0 0 1 30 13.5V21"/><path d="M2 21h28M2 17h28"/><rect x="4.5" y="6" width="7" height="6" rx="1.4"/></svg>`;

function hiRenderRoomtypeGrid() {
  const grid = document.getElementById('hiRoomtypeGrid');
  if(!grid || !hiState.hotel) return;
  const baseStr = hiState.hotel.price.replace(/[٬,/]/g,'');
  const base = parseInt(baseStr.replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d))) || 0;
  grid.innerHTML = HI_ROOM_TYPES.map(rt => {
    const price = Math.round(base * rt.mult);
    const beds = Array.from({length:rt.beds}).map(()=>HI_BED_SVG).join('');
    const active = hiState.roomType === rt.key;
    return `<div class="hi-roomtype-card${active?' active':''}" onclick="hiSelectRoomtype('${rt.key}')">
      <div class="hi-roomtype-check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M5 13l4 4L19 7"/></svg></div>
      <div class="hi-roomtype-beds">${beds}</div>
      <span class="hi-roomtype-name">${rt.label}</span>
      <span class="hi-roomtype-price">${hiFormatToman(price)}</span>
    </div>`;
  }).join('');
  hiUpdateRoomtypeCap();
}

function hiSelectRoomtype(key) {
  hiState.roomType = key;
  hiRenderRoomtypeGrid();
  hiUpdateSheetTotal();
}

function hiUpdateRoomtypeCap() {
  const cap = document.getElementById('hiRoomtypeCap');
  if(!cap) return;
  const rt = HI_ROOM_TYPES.find(r=>r.key===hiState.roomType) || HI_ROOM_TYPES[0];
  const total = rt.capacity * hiState.rooms;
  cap.textContent = `ظرفیت کل: ${toFarsiNum(total)} نفر`;
}

/* ── Jalali calendar for hotel sheet ── */
const HI_J_MONTHS = ['فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور','مهر','آبان','آذر','دی','بهمن','اسفند'];
const HI_J_DPM    = [31,31,31,31,31,31,30,30,30,30,30,29];
const HI_J_FDAYS  = [5,1,4,0,3,5,1,4,0,2,5,1]; // first weekday of each 1404 month (Sat=0)
let hiCal = { month:0, target:'checkin', checkin:null, checkout:null };

function hiOpenCal(target) {
  hiCal.target = target;
  // start from current picked month or month 0 (Farvardin 1405)
  if(target==='checkout' && hiCal.checkin) hiCal.month = hiCal.checkin.m;
  document.getElementById('hiCalWrap').style.display = 'block';
  hiRenderHiCal();
}

function hiRenderHiCal() {
  const m = hiCal.month;
  const labelEl = document.getElementById('hiCalMonth');
  if(labelEl) labelEl.textContent = HI_J_MONTHS[m] + ' ۱۴۰۵';
  const total = HI_J_DPM[m];
  const first = HI_J_FDAYS[m];
  let html = '';
  for(let i=0;i<first;i++) html += '<div class="hi-cal-day hi-cal-empty"></div>';
  const ci = hiCal.checkin, co = hiCal.checkout;
  for(let d=1;d<=total;d++) {
    const isSel = (ci&&ci.m===m&&ci.d===d)||(co&&co.m===m&&co.d===d);
    const inRange = ci&&co&&((m===ci.m&&m===co.m&&d>ci.d&&d<co.d)||(m>ci.m&&m<co.m)||(m===ci.m&&co.m>ci.m&&d>ci.d)||(m===co.m&&ci.m<co.m&&d<co.d));
    let cls = 'hi-cal-day';
    if(isSel) cls += ' hi-cal-sel';
    if(inRange) cls += ' hi-cal-range';
    html += `<div class="${cls}" onclick="hiCalPick(${m},${d})">${d.toLocaleString('fa-IR')}</div>`;
  }
  const el = document.getElementById('hiCalDays');
  if(el) el.innerHTML = html;
}

function hiCalPick(m, d) {
  if(hiCal.target==='checkin') {
    hiCal.checkin = {m,d};
    hiCal.checkout = null;
    const v = d.toLocaleString('fa-IR')+' '+HI_J_MONTHS[m]+'ماه ۱۴۰۵';
    const inp = document.getElementById('hiCheckin');
    if(inp) inp.value = v;
    document.getElementById('hiCheckout').value = '';
    // auto switch to checkout
    hiCal.target = 'checkout';
  } else {
    if(hiCal.checkin && (m<hiCal.checkin.m||(m===hiCal.checkin.m&&d<=hiCal.checkin.d))) {
      showToast('تاریخ خروج باید بعد از ورود باشد'); return;
    }
    hiCal.checkout = {m,d};
    const v = d.toLocaleString('fa-IR')+' '+HI_J_MONTHS[m]+'ماه ۱۴۰۵';
    const inp = document.getElementById('hiCheckout');
    if(inp) inp.value = v;
    document.getElementById('hiCalWrap').style.display = 'none';
  }
  hiRenderHiCal();
  hiUpdateSheetTotal();
}

function hiCalPrev() {
  hiCal.month = Math.max(0, hiCal.month - 1);
  hiRenderHiCal();
}
function hiCalNext() {
  hiCal.month = Math.min(11, hiCal.month + 1);
  hiRenderHiCal();
}

/* تبدیل متراژ به درصد طول نوار نور (نزدیک‌تر = درصد کمتر = نوار پرتر از سمت شروع) */
function hiDistPercent(m, city) {
  const max = HI_CITY_MAXM[city] || 700;
  const pct = Math.max(8, Math.min(100, Math.round((m / max) * 100)));
  return pct;
}

function hiRenderStats() {
  const el = document.getElementById('hiStatsStrip');
  if(!el) return;
  const list = HI_HOTELS[hiState.city] || [];
  if(!list.length) { el.innerHTML = ''; return; }
  const count = list.length;
  const minM = Math.min(...list.map(h=>h.m));
  const avgRating = (list.reduce((s,h)=>s+h.rating,0) / count).toFixed(1);
  el.innerHTML = `
    <div class="hi-stat">
      <span class="hi-stat-num">${toFarsiNum(count)}</span>
      <span class="hi-stat-lbl">هتل منتخب</span>
    </div>
    <div class="hi-stat">
      <span class="hi-stat-num">${toFarsiNum(minM)}<small>متر</small></span>
      <span class="hi-stat-lbl">نزدیک‌ترین تا حرم</span>
    </div>
    <div class="hi-stat">
      <span class="hi-stat-num">${avgRating.toString().replace(/\d/g,d=>'۰۱۲۳۴۵۶۷۸۹'[d])}<small>/۵</small></span>
      <span class="hi-stat-lbl">میانگین رضایت</span>
    </div>
  `;
}

/* ساخت کاور تصویری SVG برای هر هتل — illustration مونوکروم با گرادیان رنگی شهر،
   نمای ساختمان هتل + گنبد دوردست + روشنایی پنجره‌ها، چشم‌نواز و سبک یکپارچه با هویت آوان */
function hiCardCoverSVG(h, idx, city) {
  const palettes = HI_PHOTO_PALETTES[city] || HI_PHOTO_PALETTES.najaf;
  const p = palettes[idx % palettes.length];
  const gid = `hcc${city}${idx}`;
  // ردیف پنجره‌های روشن با چشمک‌زنی تصادفی-ثابت برای حس زندگی شبانه
  let windows = '';
  for(let row=0; row<3; row++){
    for(let col=0; col<6; col++){
      const x = 34 + col*14;
      const y = 96 + row*16;
      const lit = (row+col*2+idx) % 3 !== 0;
      const delay = ((row*6+col)%5)*0.6;
      windows += `<rect x="${x}" y="${y}" width="8" height="10" rx="1.2"
        fill="${lit ? 'rgba(255,224,150,.95)' : 'rgba(255,255,255,.12)'}"
        ${lit ? `class="hi-cover-win" style="animation-delay:${delay}s"` : ''}/>`;
    }
  }
  return `
  <svg viewBox="0 0 200 150" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="${gid}-sky" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="${p[0]}"/>
        <stop offset="100%" stop-color="${p[1]}"/>
      </linearGradient>
    </defs>
    <rect width="200" height="150" fill="url(#${gid}-sky)"/>
    <!-- ماه -->
    <circle cx="168" cy="28" r="10" fill="rgba(255,247,220,.9)"/>
    <!-- گنبد دوردست -->
    <g opacity=".5" fill="rgba(255,255,255,.5)">
      <path d="M30 92c0-9 6-16 14-16s14 7 14 16z"/>
      <rect x="42" y="68" width="4" height="10"/>
      <circle cx="44" cy="66" r="1.6"/>
    </g>
    <!-- نمای اصلی هتل -->
    <rect x="20" y="86" width="160" height="64" fill="rgba(15,20,30,.42)"/>
    <rect x="20" y="86" width="160" height="6" fill="rgba(255,255,255,.18)"/>
    ${windows}
    <!-- سایه‌ی پایین برای کنتراست متن -->
    <rect x="0" y="110" width="200" height="40" fill="rgba(8,14,22,.55)"/>
  </svg>`;
}

function hiRenderGrid() {
  const grid = document.getElementById('hiGrid');
  if(!grid) return;
  let list = (HI_HOTELS[hiState.city] || []).filter(h =>
    hiState.grade === 'all' || h.grade === hiState.grade
  );
  if(!list.length) {
    grid.innerHTML = `<div class="hi-empty">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><path d="M3 21h18M5 21V7l7-4 7 4v14"/><rect x="9" y="14" width="6" height="7" rx="1"/></svg>
      <span>هتلی با این درجه‌بندی یافت نشد</span>
    </div>`;
    return;
  }
  grid.innerHTML = list.map((h,i) => {
    const g = HI_GRADE[h.grade] || HI_GRADE.mid;
    const pct = hiDistPercent(h.m, hiState.city);
    const rankBadge = i === 0
      ? `<div class="hi-card-rank"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.6 6.6L21 9l-5 4.6L17.4 21 12 17.3 6.6 21 8 13.6 3 9l6.4-.4z"/></svg>نزدیک‌ترین به حرم</div>`
      : '';
    return `<div class="hi-card" style="animation-delay:${i*70}ms" onclick="hiOpenSheet(${i})">
      <div class="hi-card-cover">
        ${hiCardCoverSVG(h, i, hiState.city)}
        <div class="hi-card-cover-shade"></div>
        ${rankBadge}
        <div class="hi-card-grade-badge" style="color:#FFF8EE;background:rgba(20,16,8,.45);border:1px solid rgba(255,255,255,.35)">${g.label}</div>
        <div class="hi-card-cover-text">
          <div class="hi-card-name">${h.name}</div>
          <div class="hi-card-distbar-wrap">
            <div class="hi-card-distbar-lbl">
              <span>${h.dist}</span>
              <span>⭐ ${h.rating.toString().replace(/\d/g,d=>'۰۱۲۳۴۵۶۷۸۹'[d])}</span>
            </div>
            <div class="hi-card-distbar">
              <div class="hi-card-distbar-fill" style="width:${100-pct}%"></div>
              <div class="hi-card-distbar-dot" style="right:${100-pct}%"></div>
            </div>
          </div>
        </div>
      </div>
      <div class="hi-card-body">
        <div class="hi-card-features">${h.features.map(f=>`<span class="hi-card-feat">${f}</span>`).join('')}</div>
        <div class="hi-card-price-wrap">
          <span class="hi-card-price-lbl">هر نفر، هر شب از</span>
          <span class="hi-card-price">${hiFormatToman(hiPerPersonPrice(h.price))}</span>
          <span class="hi-card-price-unit">تومان</span>
        </div>
      </div>
    </div>`;
  }).join('');
  hiState._filtered = list;
}

/* قیمت پایه‌ی هر هتل، نرخ یک اتاق دوتخته در شب است؛
   برای نمایش روی کارت لیست، به ازای هر نفر (تقسیم بر ۲) محاسبه و گرد می‌شود */
function hiPerPersonPrice(priceStr) {
  const clean = priceStr.replace(/[٬,/]/g,'');
  const base = parseInt(clean.replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d)));
  if(isNaN(base)) return 0;
  return Math.round((base/2) / 1000) * 1000;
}

function hiSelectCity(btn, city) {
  document.querySelectorAll('.hi-tab').forEach(b => { b.classList.remove('active'); b.setAttribute('aria-selected','false'); });
  btn.classList.add('active');
  btn.setAttribute('aria-selected','true');
  hiState.city = city;
  const hero = document.getElementById('hiHero');
  if(hero) hero.setAttribute('data-city', city);
  const sub = document.getElementById('hiHeroSub');
  if(sub) {
    sub.style.opacity = '0';
    setTimeout(()=>{ sub.textContent = HI_CITY_SUB[city] || ''; sub.style.opacity = '1'; }, 160);
  }
  hiRenderStats();
  hiRenderGrid();
}

function hiFilterGrade(btn, grade) {
  document.querySelectorAll('.hi-filter').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  hiState.grade = grade;
  hiRenderGrid();
}

function hiOpenSheet(idx) {
  const h = (hiState._filtered || HI_HOTELS[hiState.city])[idx];
  if(!h) return;
  hiState.hotel = h;
  hiState._hotelIdx = idx;
  hiState.roomType = 'double';
  hiState.rooms = 1;
  const roomsEl = document.getElementById('hiRoomsVal');
  if(roomsEl) roomsEl.textContent = toFarsiNum(1);
  const g = HI_GRADE[h.grade] || HI_GRADE.mid;
  const head = document.getElementById('hiSheetHead');
  if(head) head.innerHTML = `
    <div class="hi-sheet-hotel-name">${h.name}</div>
    <div class="hi-sheet-hotel-meta" style="color:${g.color}">${g.label} &nbsp;·&nbsp; ${h.dist} &nbsp;·&nbsp; ⭐ ${h.rating.toString().replace(/\d/g,d=>'۰۱۲۳۴۵۶۷۸۹'[d])}</div>
    <button class="hi-photo-btn" onclick="hiOpenGallery()">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="3" width="18" height="14" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
      مشاهده عکس‌های هتل
    </button>
  `;
  document.getElementById('hiCalWrap').style.display = 'none';
  hiRenderRoomtypeGrid();
  hiUpdateSheetTotal();
  document.getElementById('hiSheetOverlay').classList.add('open');
  document.getElementById('hiSheet').classList.add('open');
}

function hiOpenGallery() {
  const h = hiState.hotel;
  if(!h) return;
  const palettes = HI_PHOTO_PALETTES[hiState.city] || HI_PHOTO_PALETTES.najaf;
  const labels = ['نمای بیرونی','لابی هتل','اتاق دبل','رستوران'];
  const titleEl = document.getElementById('hiGalleryTitle');
  if(titleEl) titleEl.textContent = 'عکس‌های ' + h.name;
  const slider = document.getElementById('hiGallerySlider');
  if(slider) slider.innerHTML = palettes.map((p,i) => `
    <div class="hi-gallery-slide">
      <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
        <defs><linearGradient id="hg${i}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${p[0]}"/>
          <stop offset="100%" stop-color="${p[1]}"/>
        </linearGradient></defs>
        <rect width="200" height="130" fill="url(#hg${i})"/>
        <rect x="15" y="15" width="70" height="45" rx="6" fill="rgba(255,255,255,.1)"/>
        <rect x="95" y="15" width="90" height="20" rx="4" fill="rgba(255,255,255,.08)"/>
        <rect x="95" y="42" width="60" height="18" rx="4" fill="rgba(255,255,255,.06)"/>
        <rect x="15" y="70" width="170" height="12" rx="3" fill="rgba(255,255,255,.07)"/>
        <rect x="15" y="90" width="120" height="10" rx="3" fill="rgba(255,255,255,.05)"/>
        <text x="100" y="116" text-anchor="middle" fill="rgba(255,255,255,.6)" font-size="10" font-family="Vazirmatn,sans-serif">${labels[i]}</text>
      </svg>
    </div>
  `).join('');
  const dotsEl = document.getElementById('hiGalleryDots');
  if(dotsEl) dotsEl.innerHTML = palettes.map((_,i) => `<span class="hi-gallery-dot${i===0?' active':''}" data-idx="${i}"></span>`).join('');
  if(slider) {
    slider.scrollLeft = 0;
    slider.onscroll = () => {
      const idx = Math.round(slider.scrollLeft / slider.clientWidth);
      dotsEl?.querySelectorAll('.hi-gallery-dot').forEach((d,i)=>d.classList.toggle('active', i===idx));
    };
  }
  document.getElementById('hiGalleryOverlay').classList.add('open');
  document.getElementById('hiGallery').classList.add('open');
}

function hiCloseGallery() {
  document.getElementById('hiGalleryOverlay').classList.remove('open');
  document.getElementById('hiGallery').classList.remove('open');
}

function hiCloseSheet() {
  document.getElementById('hiSheetOverlay').classList.remove('open');
  document.getElementById('hiSheet').classList.remove('open');
  document.getElementById('hiCalWrap').style.display = 'none';
  document.getElementById('hiReviewView').style.display = 'none';
  document.getElementById('hiGateView').style.display = 'none';
  document.getElementById('hiSheetBody').style.display = 'block';
  document.getElementById('hiSheetFoot').style.display = 'flex';
}

function hiCounter(type, delta) {
  if(type==='rooms') {
    hiState.rooms = Math.max(1, Math.min(10, hiState.rooms + delta));
    const el = document.getElementById('hiRoomsVal');
    if(el) el.textContent = toFarsiNum(hiState.rooms);
    hiUpdateRoomtypeCap();
  }
  hiUpdateSheetTotal();
}

/* فرمت عدد به تومان با جداکننده / و ارقام فارسی، مثل ۳/۳۰۰/۰۰۰ */
function hiFormatToman(n) {
  const s = Math.round(n).toString();
  const withSep = s.replace(/\B(?=(\d{3})+(?!\d))/g, '/');
  return withSep.replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[d]);
}

function hiUpdateSheetTotal() {
  const el = document.getElementById('hiSheetTotal');
  if(!el || !hiState.hotel) return;
  const baseStr = hiState.hotel.price.replace(/[٬,/]/g,'');
  const base = parseInt(baseStr.replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d)));
  if(isNaN(base)) { el.textContent = '—'; return; }
  const rt = HI_ROOM_TYPES.find(r=>r.key===hiState.roomType) || HI_ROOM_TYPES[0];
  const perRoomPrice = Math.round(base * rt.mult);
  // calc nights if both dates selected
  let nights = 1;
  if(hiCal.checkin && hiCal.checkout) {
    const ci=hiCal.checkin, co=hiCal.checkout;
    const dpm=HI_J_DPM;
    let nd=0;
    if(co.m===ci.m) nd=co.d-ci.d;
    else { nd=dpm[ci.m]-ci.d; for(let m=ci.m+1;m<co.m;m++) nd+=dpm[m]; nd+=co.d; }
    if(nd>0) nights=nd;
  }
  const total = perRoomPrice * hiState.rooms * nights;
  hiState._lastTotal = total;
  hiState._lastNights = nights;
  const nightsLabel = nights>1 ? nights.toLocaleString('fa-IR')+' شب · ' : '';
  el.textContent = nightsLabel + hiFormatToman(total) + ' تومان';
}

function hiSubmitReserve() {
  const name = document.getElementById('hiName')?.value?.trim();
  const phone = document.getElementById('hiPhone')?.value?.trim();
  if(!name) { showToast('نام سرپرست را وارد کنید'); return; }
  if(!phone || phone.length < 10) { showToast('شماره موبایل معتبر وارد کنید'); return; }
  if(!hiCal.checkin || !hiCal.checkout) { showToast('تاریخ ورود و خروج را انتخاب کنید'); return; }

  const rt = HI_ROOM_TYPES.find(r=>r.key===hiState.roomType) || HI_ROOM_TYPES[0];
  hiState._booking = {
    name, phone,
    hotelName: hiState.hotel?.name || '—',
    city: hiState.city,
    checkin: document.getElementById('hiCheckin')?.value || '—',
    checkout: document.getElementById('hiCheckout')?.value || '—',
    rooms: hiState.rooms,
    roomTypeLabel: rt.label,
    guests: rt.capacity * hiState.rooms,
    nights: hiState._lastNights || 1,
    total: hiState._lastTotal || 0,
  };
  hiShowReview();
}

const HI_CITY_FA = { najaf:'نجف اشرف', karbala:'کربلای معلی', kazimiya:'کاظمین' };

function hiShowReview() {
  const b = hiState._booking;
  document.getElementById('hiSheetBody').style.display = 'none';
  document.getElementById('hiSheetFoot').style.display = 'none';
  document.getElementById('hiGateView').style.display = 'none';
  const view = document.getElementById('hiReviewView');
  view.style.display = 'flex';
  document.getElementById('hiReviewBody').innerHTML = `
    <div>🏨 هتل:<b>${b.hotelName}</b>(${HI_CITY_FA[b.city] || b.city})</div>
    <div>📅 ورود:<b>${b.checkin}</b></div>
    <div>📅 خروج:<b>${b.checkout}</b>(${b.nights.toLocaleString('fa-IR')} شب)</div>
    <div>🛏 اتاق:<b>${b.rooms.toLocaleString('fa-IR')} ${b.roomTypeLabel}</b> &nbsp;|&nbsp; 👥 ظرفیت:<b>${b.guests.toLocaleString('fa-IR')} نفر</b></div>
    <div>👤 سرپرست:<b>${b.name}</b> &nbsp;|&nbsp; 📱 <b>${b.phone}</b></div>
    <div style="margin-top:6px;">💰 جمع کل:<b style="color:var(--hi-c)">${hiFormatToman(b.total)} تومان</b></div>
  `;
}

function hiBackToForm() {
  document.getElementById('hiReviewView').style.display = 'none';
  document.getElementById('hiSheetBody').style.display = 'block';
  document.getElementById('hiSheetFoot').style.display = 'flex';
}

function hiGoToGate() {
  const b = hiState._booking;
  document.getElementById('hiReviewView').style.display = 'none';
  const gate = document.getElementById('hiGateView');
  gate.style.display = 'flex';
  document.getElementById('hiGateAmount').textContent = hiFormatToman(b.total);
  document.getElementById('hiGateSummary').textContent = `${b.hotelName} — ${HI_CITY_FA[b.city] || b.city} — ${b.nights.toLocaleString('fa-IR')} شب`;
}

function hiBackToReview() {
  document.getElementById('hiGateView').style.display = 'none';
  hiShowReview();
}

async function hiSendToTelegram() {
  const b = hiState._booking;
  let msg = `✦*رزرو جدید هتل عراق*\n\n`;
  msg += `🏨 هتل:${b.hotelName}(${HI_CITY_FA[b.city] || b.city})\n`;
  msg += `📅 ورود:${b.checkin}\n`;
  msg += `📅 خروج:${b.checkout}(${b.nights} شب)\n`;
  msg += `🛏 اتاق:${b.rooms} ${b.roomTypeLabel} | 👥 ظرفیت:${b.guests}\n`;
  msg += `👤 سرپرست:${b.name}\n`;
  msg += `📱 موبایل:${b.phone}\n`;
  msg += `💰 مبلغ:${hiFormatToman(b.total)} تومان\n`;
  const payload = { chat_id: TG_CHAT, text: msg, parse_mode: 'Markdown' };
  await fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
  });
}

async function hiHandlePayment() {
  const btn = document.getElementById('hiGatePay');
  const sending = document.getElementById('hiSending');
  const b = hiState._booking;
  if (!b) return;

  btn.disabled = true; sending.classList.add('show');

  // ۱) ثبت و ارسال اطلاعات رزرو به ربات تلگرام
  try { await hiSendToTelegram(); } catch (e) { console.warn('TG error', e); }

  // ۲) ساخت تراکنش در درگاه زرین‌پال و انتقال کاربر به صفحه پرداخت
  try {
    const description = `رزرو هتل ${b.hotelName} — ${HI_CITY_FA[b.city] || b.city} — ${b.nights} شب`;
    const authority = await zpRequestPayment({
      amount: b.total,
      description,
      mobile: b.phone,
    });
    // ذخیره موقت اطلاعات تراکنش برای تأیید پس از بازگشت از زرین‌پال
    sessionStorage.setItem('hi_pending_payment', JSON.stringify({
      amount: b.total,
      hotelName: b.hotelName,
    }));
    window.location.href = ZP_STARTPAY_URL + authority;
    return; // کاربر منتقل می‌شود؛ ادامه‌ی کد لازم نیست
  } catch (e) {
    console.warn('ZarinPal error', e);
    btn.disabled = false; sending.classList.remove('show');
    showToast('اتصال به درگاه پرداخت برقرار نشد. لطفاً دوباره تلاش کنید');
  }
}

/* بررسی بازگشت کاربر از درگاه زرین‌پال (پارامترهای Authority و Status در آدرس) */
async function hiCheckPaymentReturn() {
  const params = new URLSearchParams(window.location.search);
  const authority = params.get('Authority');
  const status = params.get('Status');
  if (!authority) return;

  // پاک کردن پارامترهای پرداخت از نوار آدرس
  const cleanUrl = window.location.origin + window.location.pathname;
  window.history.replaceState(null, '', cleanUrl);

  const pendingRaw = sessionStorage.getItem('hi_pending_payment');
  if (!pendingRaw) return;
  sessionStorage.removeItem('hi_pending_payment');
  const pending = JSON.parse(pendingRaw);

  if (status !== 'OK') {
    showToast('پرداخت لغو شد یا ناموفق بود');
    return;
  }
  try {
    const result = await zpVerifyPayment({ amount: pending.amount, authority });
    const code = result?.data?.code;
    if (code === 100 || code === 101) {
      const refId = result.data.ref_id;
      showToast(`✦ پرداخت با موفقیت تأیید شد! کد پیگیری: ${refId}`);
    } else {
      showToast('تأیید پرداخت ناموفق بود. لطفاً با پشتیبانی تماس بگیرید');
    }
  } catch (e) {
    console.warn('ZarinPal verify error', e);
    showToast('خطا در تأیید پرداخت. لطفاً با پشتیبانی تماس بگیرید');
  }
}
document.addEventListener('DOMContentLoaded', hiCheckPaymentReturn);

// Auto-render when hotel-iraq panel opens + home stats
document.addEventListener('DOMContentLoaded', () => {
  // home stats — DOM is ready now
  updateHomeStats();

  const orig = window.openPanel;
  window.openPanel = function(name) {
    orig(name);
    if(name === 'hotel-iraq') {
      setTimeout(() => { hiState._filtered = null; hiRenderStats(); hiRenderGrid(); }, 50);
    }
    // refresh home stats whenever user returns to home
    if(name === 'home') {
      setTimeout(updateHomeStats, 80);
    }
  };
});

/* ══════════════════════════════════════════════════
   Flight Panel — پرواز نجف
══════════════════════════════════════════════════ */
(function(){

const toFa = n => String(n).replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[d]);

/* ── Jalali helpers (minimal) ── */
const jDaysInMonth = (jy,jm) => jm <= 6 ? 31 : jm <= 11 ? 30 : ((jy-474)%2820+474+38)*682 % 2816 < 682 ? 30 : 29;
function gregorianToJalali(gy,gm,gd){
  const g_d_no = 365*gy + Math.floor((gy+3)/4) - Math.floor((gy+99)/100) + Math.floor((gy+399)/400);
  let j_d_no = g_d_no - 79 - [0,31,59+Math.floor((gy%4===0&&gy%100!==0||gy%400===0)?1:0),90,120,151,181,212,243,273,304,334][gm-1] - gd + 1;
  // simplified conversion
  const months=[31,31,31,31,31,31,30,30,30,30,30,29];
  let jy=1348; let rem=j_d_no;
  while(rem>365){const days=(jy-474)%2820;const ld=(days+474+38)*682%2816<682?366:365;if(rem>ld){rem-=ld;jy++;}else break;}
  let jm=1;
  for(let m=0;m<12;m++){const md=jDaysInMonth(jy,m+1);if(rem<=md){jm=m+1;break;}rem-=md;}
  return [jy,jm,rem];
}
function jalaliToGregorian(jy,jm,jd){
  const ep=jy-474; const cy=474+ep%2820;
  const jdn=jd+(jm<=6?31*(jm-1):30*(jm-1)+6)+Math.floor((cy*682-110)/2816)+Math.floor(cy/4)*1461+cy*365+38+1948319.5;
  const jd2=Math.floor(jdn+.5);
  let depoch=jd2-Math.floor((Math.floor((jd2-1867216.25)/36524.25)+1)*3/4)-1401;
  const b=depoch+1524; const bc=Math.floor((b-122.1)/365.25); const d3=Math.floor(365.25*bc); const e=Math.floor((b-d3)/30.6001);
  const gd=b-d3-Math.floor(30.6001*e);
  const gm=e<14?e-1:e-13;
  const gy=gm>2?bc-4716:bc-4715;
  return [gy,gm,gd];
}
function todayJalali(){
  const n=new Date(); return gregorianToJalali(n.getFullYear(),n.getMonth()+1,n.getDate());
}

const jMonths=['فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور','مهر','آبان','آذر','دی','بهمن','اسفند'];

/* ── Airline data ── */
const airlines = [
  {id:'caspian', name:'کاسپین', theme:'fl-airline--caspian', code:'IV'},
  {id:'varesh',  name:'وارش',   theme:'fl-airline--varesh',  code:'VR'},
  {id:'qeshm',   name:'قشم ایر', theme:'fl-airline--qeshm',  code:'QB'},
  {id:'zagros',  name:'زاگرس',  theme:'fl-airline--zagros',  code:'ZV'},
  {id:'flykish', name:'فلای کیش',theme:'fl-airline--flykish', code:'FK'},
  {id:'iranair', name:'ایران ایر',theme:'fl-airline--iranair', code:'IR'},
];

/* Flight times per origin */
const flightTimes = {
  تهران:   ['06:10','08:45','11:20','14:00','16:35','20:10'],
  مشهد:    ['07:30','10:15','13:50','17:20','21:00'],
  اصفهان:  ['09:00','12:40','16:10','19:45'],
};

const durationMap = {تهران:'۱:۴۵',مشهد:'۲:۳۰',اصفهان:'۱:۵۵'};

/* Base prices per airline (in millions toman) – we'll add noise per day */
const basePrices = {caspian:3.8,varesh:4.2,qeshm:4.5,zagros:5.0,flykish:5.3,iranair:5.8};

/* Deterministic pseudo-random using date+airline as seed */
function seededRandom(seed){let s=seed;s=Math.sin(s)*10000;return s-Math.floor(s);}

function generateFlights(origin, jy, jm, jd){
  const times = flightTimes[origin] || flightTimes['تهران'];
  const dateSeed = jy*10000+jm*100+jd;
  // Pick which airlines fly today (4-6 of them)
  const airlinePool = [...airlines].sort(()=>seededRandom(dateSeed+airlines.indexOf(_=>{}))-0.5);
  // shuffle deterministically
  const shuffled = airlines.map((a,i)=>({...a,r:seededRandom(dateSeed+i*37)})).sort((a,b)=>a.r-b.r);
  const count = 3 + Math.floor(seededRandom(dateSeed+99)*3); // 3-5 airlines
  const todayAirlines = shuffled.slice(0,count);

  // Generate flights: multiple per airline potentially
  const flights = [];
  todayAirlines.forEach((al,ai) => {
    const numFlights = ai === 0 ? 2 : 1; // busiest airline gets 2 flights
    for(let f=0;f<numFlights;f++){
      const timeIdx = (ai*2+f*3) % times.length;
      const depTime = times[timeIdx];
      const priceBase = basePrices[al.id];
      const variation = seededRandom(dateSeed+ai*13+f*7) * 0.8;
      const price = +(priceBase + variation - 0.2).toFixed(1);
      // Arrival time
      const [dh,dm] = depTime.split(':').map(Number);
      const dur = {تهران:105,مشهد:150,اصفهان:115}[origin]||105;
      const arr = new Date(0,0,0,dh,dm+dur);
      const arrTime = `${String(arr.getHours()).padStart(2,'0')}:${String(arr.getMinutes()).padStart(2,'0')}`;
      flights.push({
        airline: al, flightNum: `${al.code}${100+ai*10+f}`,
        dep: depTime, arr: arrTime,
        duration: durationMap[origin]||'۱:۴۵',
        price, pax: 'هر نفر'
      });
    }
  });
  // Sort cheapest first
  flights.sort((a,b)=>a.price-b.price);
  return flights;
}

/* ── State ── */
let flOrigin = 'تهران';
let flOriginCode = 'THR';
const FL_YEAR = 1405;
const FL_MONTH = 4; /* تیر */
const FL_DAYS_IN_MONTH = 31;
const FL_DOW = ['دوشنبه','سه‌شنبه','چهارشنبه','پنجشنبه','جمعه','شنبه','یکشنبه']; /* 1 تیر ۱۴۰۵ = دوشنبه */
let flSelD = null; /* selected day number within Tir */
let flSelFlight = null;
let flPassengers = []; /* {firstName,lastName,passport,done} */
let flInfant = 0;
let flEditingIdx = null;

/* Cheapest price for a given day (deterministic) — reuses generateFlights */
function flCheapestPriceForDay(d){
  const flights = generateFlights(flOrigin, FL_YEAR, FL_MONTH, d);
  if(!flights.length) return null;
  return flights[0].price;
}

/* ── Day-strip render ── */
function flRenderCal(){
  const lbl=document.getElementById('fl-cal-month-lbl');
  const strip=document.getElementById('fl-daystrip');
  if(!lbl||!strip) return;
  lbl.textContent=`${jMonths[FL_MONTH-1]} ${toFa(FL_YEAR)}`;

  const [ty,tm,td]=todayJalali();

  let html='';
  for(let d=1; d<=FL_DAYS_IN_MONTH; d++){
    const dow = FL_DOW[(d-1)%7];
    const isPast = (FL_YEAR<ty)||(FL_YEAR===ty&&FL_MONTH<tm)||(FL_YEAR===ty&&FL_MONTH===tm&&d<td);
    const isToday = FL_YEAR===ty&&FL_MONTH===tm&&d===td;
    const isSel = flSelD===d;
    const price = isPast ? null : flCheapestPriceForDay(d);

    let cls='fl-daycard';
    if(isToday) cls+=' fl-daycard--today';
    if(isSel) cls+=' fl-daycard--selected';

    const priceHtml = price!=null
      ? `<span class="fl-dc-price">${toFa(price.toFixed(1))} م</span>`
      : `<span class="fl-dc-noflight">—</span>`;

    html+=`<button class="${cls}" data-day="${d}" onclick="flSelectDay(${d})" aria-label="${dow} ${toFa(d)} ${jMonths[FL_MONTH-1]}">
      <span class="fl-dc-dow">${dow}</span>
      <span class="fl-dc-date">${toFa(d)} تیر</span>
      ${priceHtml}
    </button>`;
  }
  strip.innerHTML=html;

  /* Auto-scroll selected (or today) into view */
  requestAnimationFrame(()=>{
    const target = strip.querySelector('.fl-daycard--selected') || strip.querySelector('.fl-daycard--today');
    if(target) target.scrollIntoView({inline:'center', block:'nearest', behavior:'auto'});
  });
}

window.flSelectDay=function(d){
  flSelD=d;
  flRenderCal();
  const lbl=document.getElementById('fl-date-label-text');
  const dow = FL_DOW[(d-1)%7];
  if(lbl) lbl.textContent=`${dow} ${toFa(d)} تیر ${toFa(FL_YEAR)}`;
  flRenderList();
};

function flRenderList(){
  const list=document.getElementById('fl-list');
  const empty=document.getElementById('fl-empty');
  if(!list) return;
  if(!flSelD){list.innerHTML='<div class="fl-empty" id="fl-empty"><svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" opacity=".2"><path d="M22 2L3 12l7 2 2 7 3-5"/></svg><span>تاریخ پرواز را از تقویم بالا انتخاب کن</span></div>';return;}

  const flights=generateFlights(flOrigin,FL_YEAR,FL_MONTH,flSelD);
  if(!flights.length){
    list.innerHTML='<div class="fl-empty"><svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" opacity=".2"><path d="M22 2L3 12l7 2 2 7 3-5"/></svg><span>پروازی برای این روز یافت نشد</span></div>';
    return;
  }

  list.innerHTML=flights.map((f,i)=>{
    const cheapest=i===0?'fl-card--cheapest':'';
    const priceStr=toFa(f.price.toFixed(1));
    return `<div class="fl-card ${cheapest}" style="--fi:${i}" onclick="flOpenSheet(${i},${JSON.stringify(f).replace(/"/g,'&quot;')})">
      <div class="fl-card-top">
        <div class="fl-card-airline-row">
          <div class="fl-airline-logo ${f.airline.theme}">${f.airline.code}</div>
          <div class="fl-airline-info">
            <span class="fl-airline-name">${f.airline.name}</span>
            <span class="fl-airline-num">پرواز ${toFa(f.flightNum)}</span>
          </div>
        </div>
        <div class="fl-card-price-wrap">
          <span class="fl-card-price">${priceStr} م</span>
          <span class="fl-card-price-unit">تومان / هر نفر</span>
        </div>
      </div>
      <div class="fl-card-mid">
        <div class="fl-card-time">
          <span class="fl-time-val">${f.dep}</span>
          <span class="fl-time-city">${flOrigin}</span>
        </div>
        <div class="fl-card-route-vis">
          <span class="fl-card-dur">${f.duration}</span>
          <div class="fl-card-route-line">
            <div class="fl-card-route-line-bar"></div>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M22 2L3 12l7 2 2 7 3-5"/></svg>
            <div class="fl-card-route-line-bar"></div>
          </div>
          <span class="fl-card-direct">مستقیم</span>
        </div>
        <div class="fl-card-time" style="align-items:flex-end">
          <span class="fl-time-val">${f.arr}</span>
          <span class="fl-time-city">نجف</span>
        </div>
      </div>
      <div class="fl-card-bottom">
        <div class="fl-card-tags">
          <span class="fl-card-tag">۱ چمدان ۲۰ کیلو</span>
          <span class="fl-card-tag">بدون توقف</span>
        </div>
        <button class="fl-card-cta" onclick="event.stopPropagation();flOpenSheetIdx(${i})">
          رزرو
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </button>
      </div>
    </div>`;
  }).join('');

  // store for sheet
  window._flFlights=flights;
}

window.flOpenSheetIdx=function(i){
  if(window._flFlights) flOpenSheet(i, window._flFlights[i]);
};

window.flOpenSheet=function(i, f){
  if(typeof f==='string') f=JSON.parse(f);
  flSelFlight=f;
  const info=document.getElementById('fl-sheet-flight-info');
  if(info){
    info.innerHTML=`<div class="fl-sheet-flight-name">${f.airline.name} — پرواز ${toFa(f.flightNum)}</div>
      <div class="fl-sheet-flight-meta">${f.dep} از ${flOrigin} ← ${f.arr} نجف &nbsp;·&nbsp; ${f.duration} ساعت</div>
      <div class="fl-sheet-flight-price-row">
        <span class="fl-sheet-flight-price">${toFa(f.price.toFixed(1))} م</span>
        <span class="fl-sheet-flight-price-lbl">تومان هر نفر</span>
      </div>`;
  }
  flResetSheetViews();
  if(flPassengers.length===0) flAddPassenger();
  flRenderPassengers();
  flUpdateSheetTotal();
  document.getElementById('fl-sheet').classList.add('active');
  document.getElementById('fl-sheet-overlay').classList.add('active');
};
window.flCloseSheet=function(){
  document.getElementById('fl-sheet').classList.remove('active');
  document.getElementById('fl-sheet-overlay').classList.remove('active');
  flResetSheetViews();
  flPassengers=[];
  flInfant=0;
  const iv=document.getElementById('fl-infant-val');
  if(iv) iv.textContent=toFa(0);
  const ph=document.getElementById('fl-phone');
  if(ph) ph.value='';
};

window.flCounter=function(type,delta){
  if(type==='infant'){
    flInfant=Math.max(0,Math.min(6,flInfant+delta));
    const iv=document.getElementById('fl-infant-val');
    if(iv) iv.textContent=toFa(flInfant);
  }
  flUpdateSheetTotal();
};

function flUpdateSheetTotal(){
  if(!flSelFlight) return;
  const paxCount=Math.max(flPassengers.filter(p=>p&&p.done).length,1);
  const total=(flSelFlight.price*paxCount+flSelFlight.price*0.1*flInfant);
  flState_lastTotal = total;
  flState_lastPax = paxCount;
  const el=document.getElementById('fl-sheet-total');
  if(el) el.textContent=`${toFa(total.toFixed(1))} میلیون تومان`;
}
let flState_lastTotal=0, flState_lastPax=1;

/* ── Passenger accordion (Latin names + passport) ── */
function flLatinOnly(v){ return v.replace(/[^a-zA-Z\s]/g,''); }

window.flAddPassenger=function(){
  // collapse any open card first
  flPassengers.forEach(p=>{ if(p) p._open=false; });
  flPassengers.push({firstName:'',lastName:'',passport:'',done:false,_open:true});
  flEditingIdx=flPassengers.length-1;
  flRenderPassengers();
};

window.flToggleExpand=function(idx){
  flPassengers.forEach((p,i)=>{ if(p) p._open=(i===idx)?!p._open:false; });
  flRenderPassengers();
};

window.flSavePassenger=function(idx){
  const fn=document.getElementById(`fl-pax-fn-${idx}`)?.value.trim();
  const ln=document.getElementById(`fl-pax-ln-${idx}`)?.value.trim();
  const pp=document.getElementById(`fl-pax-pp-${idx}`)?.value.trim();
  const errs=[];
  if(!fn||!/^[a-zA-Z\s]+$/.test(fn)) errs.push(`fl-pax-fn-${idx}`);
  if(!ln||!/^[a-zA-Z\s]+$/.test(ln)) errs.push(`fl-pax-ln-${idx}`);
  if(!pp||pp.length<5) errs.push(`fl-pax-pp-${idx}`);
  if(errs.length){
    errs.forEach(id=>document.getElementById(id)?.classList.add('err'));
    showToast('نام، نام خانوادگی(لاتین)و شماره گذرنامه را صحیح وارد کنید');
    return;
  }
  flPassengers[idx]={firstName:fn,lastName:ln,passport:pp,done:true,_open:false};
  flUpdateSheetTotal();
  flRenderPassengers();
  showToast('✦ اطلاعات مسافر ذخیره شد');
};

window.flRemovePassenger=function(idx){
  flPassengers.splice(idx,1);
  if(!flPassengers.length) flAddPassenger();
  flUpdateSheetTotal();
  flRenderPassengers();
};

function flRenderPassengers(){
  const list=document.getElementById('fl-passenger-list');
  if(!list) return;
  list.innerHTML=flPassengers.map((p,idx)=>{
    if(!p) return '';
    const label=p.done?`${p.firstName} ${p.lastName}`:`مسافر ${toFa(idx+1)}`;
    const openCls=p._open?' active':'';
    const doneCls=p.done?' done':'';
    return `<div class="pi-zaer${openCls}${doneCls}" id="fl-pax-${idx}">
      <div class="pi-zaer-head" onclick="flToggleExpand(${idx})">
        <div class="pi-zaer-num">${toFa(idx+1)}</div>
        <div class="pi-zaer-name-lbl">${label}</div>
        <div class="pi-zaer-tick">${p.done?'✓':''}</div>
      </div>
      <div class="pi-zaer-body">
        <div class="pi-fields">
          <div class="pi-field">
            <label>نام(لاتین)</label>
            <input type="text" id="fl-pax-fn-${idx}" placeholder="Ali" dir="ltr" value="${p.firstName||''}" oninput="this.value=flLatinOnly2(this.value);this.classList.remove('err')">
          </div>
          <div class="pi-field">
            <label>نام خانوادگی(لاتین)</label>
            <input type="text" id="fl-pax-ln-${idx}" placeholder="Ahmadi" dir="ltr" value="${p.lastName||''}" oninput="this.value=flLatinOnly2(this.value);this.classList.remove('err')">
          </div>
          <div class="pi-field">
            <label>شماره گذرنامه</label>
            <input type="text" id="fl-pax-pp-${idx}" placeholder="A12345678" dir="ltr" value="${p.passport||''}" oninput="this.classList.remove('err')">
          </div>
        </div>
        <div style="display:flex;gap:8px;">
          <button class="pi-save-zaer" style="flex:1" onclick="flSavePassenger(${idx})">
            <svg class="s22" viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/></svg>
            ذخیره
          </button>
          ${flPassengers.length>1?`<button class="pi-gate-back" style="flex:0 0 auto;padding:0 14px;" onclick="flRemovePassenger(${idx})">حذف</button>`:''}
        </div>
      </div>
    </div>`;
  }).join('');
}
window.flLatinOnly2=flLatinOnly;

function flResetSheetViews(){
  document.getElementById('fl-review-view').style.display='none';
  document.getElementById('fl-gate-view').style.display='none';
  document.getElementById('fl-sheet-body').style.display='block';
  document.getElementById('fl-sheet-foot').style.display='flex';
}

window.flSubmitReserve=function(){
  const phone=document.getElementById('fl-phone')?.value?.trim();
  if(!phone||phone.length<10){showToast('شماره موبایل معتبر وارد کنید');return;}
  const done=flPassengers.filter(p=>p&&p.done);
  if(!done.length){showToast('لطفاً اطلاعات حداقل یک مسافر را ذخیره کنید');return;}
  if(!flSelFlight||!flSelD){showToast('پرواز و تاریخ را انتخاب کنید');return;}

  flState_booking={
    phone, passengers:done, infant:flInfant,
    airline:flSelFlight.airline.name,
    flightNum:flSelFlight.flightNum,
    origin:flOrigin, dest:'نجف',
    dep:flSelFlight.dep, arr:flSelFlight.arr,
    date:`${toFa(flSelD)} تیر ۱۴۰۵`,
    total:flState_lastTotal, paxCount:done.length
  };
  flShowReview();
};
let flState_booking=null;

function flShowReview(){
  const b=flState_booking;
  document.getElementById('fl-sheet-body').style.display='none';
  document.getElementById('fl-sheet-foot').style.display='none';
  document.getElementById('fl-gate-view').style.display='none';
  document.getElementById('fl-review-view').style.display='flex';
  const paxList=b.passengers.map((p,i)=>`${toFa(i+1)}. ${p.firstName} ${p.lastName} — ${p.passport}`).join('<br>');
  document.getElementById('fl-review-body').innerHTML=`
    <div>✈️ ایرلاین:<b>${b.airline}</b>(پرواز ${toFa(b.flightNum)})</div>
    <div>🛫 مسیر:<b>${b.origin} ← نجف</b></div>
    <div>📅 تاریخ:<b>${b.date}</b> &nbsp;|&nbsp; ⏰ ساعت:<b>${b.dep} - ${b.arr}</b></div>
    <div>👥 تعداد مسافر:<b>${toFa(b.paxCount)}</b> نفر${b.infant?` &nbsp;|&nbsp; 👶 نوزاد:<b>${toFa(b.infant)}</b>`:''}</div>
    <div style="margin-top:6px;">${paxList}</div>
    <div>📱 موبایل تماس:<b>${b.phone}</b></div>
    <div style="margin-top:6px;">💰 جمع کل:<b style="color:var(--g)">${toFa(b.total.toFixed(1))} میلیون تومان</b></div>
  `;
}

window.flBackToForm=function(){
  document.getElementById('fl-review-view').style.display='none';
  document.getElementById('fl-sheet-body').style.display='block';
  document.getElementById('fl-sheet-foot').style.display='flex';
};

window.flGoToGate=function(){
  const b=flState_booking;
  document.getElementById('fl-review-view').style.display='none';
  document.getElementById('fl-gate-view').style.display='flex';
  document.getElementById('fl-gate-amount').textContent=toFa(b.total.toFixed(1))+' میلیون';
  document.getElementById('fl-gate-summary').textContent=`${b.airline} — ${b.origin} به نجف — ${toFa(b.paxCount)} نفر`;
};

window.flBackToReview=function(){
  document.getElementById('fl-gate-view').style.display='none';
  flShowReview();
};

async function flSendToTelegram(){
  const b=flState_booking;
  let msg=`✦*رزرو جدید پرواز نجف*\n\n`;
  msg+=`✈️ ایرلاین:${b.airline}(پرواز ${b.flightNum})\n`;
  msg+=`🛫 مسیر:${b.origin} ← نجف\n`;
  msg+=`📅 تاریخ:${b.date} | ⏰ ${b.dep}-${b.arr}\n`;
  msg+=`👥 تعداد:${b.paxCount} نفر${b.infant?` | 👶 نوزاد:${b.infant}`:''}\n`;
  msg+=`📱 موبایل:${b.phone}\n`;
  msg+=`\n👤*مسافران:*\n`;
  b.passengers.forEach((p,i)=>{ msg+=`${i+1}. ${p.firstName} ${p.lastName} | Passport:${p.passport}\n`; });
  msg+=`\n💰 مبلغ:${b.total.toFixed(1)} میلیون تومان\n`;
  const payload={chat_id:TG_CHAT,text:msg,parse_mode:'Markdown'};
  await fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
}

window.flHandlePayment=async function(){
  const btn=document.getElementById('fl-gate-pay');
  const sending=document.getElementById('fl-sending');
  btn.disabled=true; sending.classList.add('show');
  try{ await flSendToTelegram(); }catch(e){ console.warn('TG error',e); }
  btn.disabled=false; sending.classList.remove('show');
  flCloseSheet();
  showToast('✦ رزرو شما ثبت شد!کارشناس آوان به زودی تماس می‌گیرد');
};

window.flSelectOrigin=function(btn){
  document.querySelectorAll('.fl-orig-tab').forEach(t=>t.classList.remove('active'));
  btn.classList.add('active');
  flOrigin=btn.dataset.origin;
  flOriginCode=btn.dataset.code;
  const oc=document.getElementById('fl-origin-code');
  const on=document.getElementById('fl-origin-name');
  if(oc) oc.textContent=flOriginCode;
  if(on) on.textContent=flOrigin;
  flSelD=null;
  const lbl=document.getElementById('fl-date-label-text');
  if(lbl) lbl.textContent='یک روز را انتخاب کن';
  flRenderCal();
  flRenderList();
};

/* ── Generate twinkling stars in hero background ── */
function flInitStars(){
  const wrap=document.getElementById('fl-hero-stars');
  if(!wrap || wrap.dataset.done) return;
  wrap.dataset.done='1';
  let html='';
  for(let i=0;i<22;i++){
    const top=(Math.random()*90+3).toFixed(1);
    const left=(Math.random()*94+2).toFixed(1);
    const delay=(Math.random()*2.6).toFixed(2);
    const dur=(2+Math.random()*1.8).toFixed(2);
    const size=(Math.random()<0.25)?1.5+Math.random()*1.2 : 1+Math.random()*0.8;
    html+=`<span class="fl-star" style="top:${top}%;left:${left}%;width:${size}px;height:${size}px;animation-delay:${delay}s;animation-duration:${dur}s;"></span>`;
  }
  wrap.innerHTML=html;
}

/* ── Init when flight panel opens ── */
const origOpen=window.openPanel;
window.openPanel=function(id){
  if(id==='flight'){
    // Don't preselect a date
    flSelD=null;
    setTimeout(()=>{flRenderCal();flRenderList();flInitStars();},80);
  }
  if(origOpen) origOpen(id);
};

})();

/* ════════════════════════════════════════════════════════
   خرید گروهی زنده — کارت کشویی بالای سفر انفرادی (gbx-)
   هرچی کاروان پرتر بشه قیمت برای همه پایین‌تر میاد و تفاوت
   به کیف‌پول کسایی که زودتر خریدن برمی‌گرده.
════════════════════════════════════════════════════════ */
(function(){
  const GBX_TIER_MAX=[9,19,29,Infinity]; // people thresholds for tiers 0..3
  const GBX_CARAVANS=[
    {key:'thr15', city:'تهران',   date:'۱۵ تیر',   people:12, prices:[21.0,18.5,16.5,15.0]},
    {key:'mhd22', city:'مشهد',    date:'۲۲ تیر',   people:7,  prices:[23.0,20.5,18.5,17.0]},
    {key:'ifn1',  city:'اصفهان',  date:'۱ مرداد',  people:24, prices:[19.0,17.0,16.0,14.5]},
    {key:'thr8',  city:'تهران',   date:'۸ مرداد',  people:8,  prices:[20.0,17.5,15.5,14.0]},
    {key:'qm20',  city:'قم',      date:'۲۰ مرداد', people:31, prices:[17.0,15.5,14.8,14.0]}
  ];
  let gbxActiveKey=GBX_CARAVANS[0].key;

  function gbxTierIndex(people){
    for(let i=0;i<GBX_TIER_MAX.length;i++){ if(people<=GBX_TIER_MAX[i]) return i; }
    return GBX_TIER_MAX.length-1;
  }
  function gbxFmtPrice(p){ return toFarsiNum(String(p)); }
  function gbxFillPercent(people){
    const bp=[{p:1,pct:0},{p:10,pct:33},{p:20,pct:66},{p:30,pct:100}];
    const cl=Math.max(1,Math.min(30,people));
    for(let i=0;i<bp.length-1;i++){
      const a=bp[i], b=bp[i+1];
      if(cl>=a.p && cl<=b.p){
        const ratio=(cl-a.p)/(b.p-a.p);
        return a.pct + ratio*(b.pct-a.pct);
      }
    }
    return 100;
  }
  function gbxRenderChips(){
    const wrap=document.getElementById('gbxChips');
    if(!wrap) return;
    wrap.innerHTML = GBX_CARAVANS.map(c=>
      `<button type="button" class="gbx-chip${c.key===gbxActiveKey?' active':''}" data-key="${c.key}">${c.city}<small>${c.date}</small></button>`
    ).join('');
    wrap.querySelectorAll('.gbx-chip').forEach(btn=>{
      btn.addEventListener('click',()=>gbxSelect(btn.dataset.key));
    });
  }
  function gbxSelect(key){
    gbxActiveKey=key;
    document.querySelectorAll('#gbxChips .gbx-chip').forEach(b=>{
      b.classList.toggle('active', b.dataset.key===key);
    });
    gbxRenderDetails();
  }
  function gbxRenderDetails(){
    const c=GBX_CARAVANS.find(x=>x.key===gbxActiveKey);
    if(!c) return;
    const tIdx=gbxTierIndex(c.people);
    const price=c.prices[tIdx];

    const priceNow=document.getElementById('gbxPriceNow');
    if(priceNow) priceNow.innerHTML=`${gbxFmtPrice(price)} <small>میلیون تومان</small>`;

    const peopleEl=document.getElementById('gbxPeopleCount');
    if(peopleEl) peopleEl.textContent=toFarsiNum(c.people);

    const fill=document.getElementById('gbxTrackFill');
    if(fill) fill.style.width=gbxFillPercent(c.people)+'%';

    document.querySelectorAll('.gbx-tier-marker').forEach(m=>{
      const t=+m.dataset.t;
      m.classList.toggle('done', t<tIdx);
      m.classList.toggle('active', t===tIdx);
    });
    document.querySelectorAll('.gbx-tier-label').forEach(l=>{
      const t=+l.dataset.t;
      l.classList.toggle('done', t<tIdx);
      l.classList.toggle('active', t===tIdx);
    });
    for(let i=0;i<4;i++){
      const el=document.getElementById('gbxT'+i);
      if(el) el.textContent=gbxFmtPrice(c.prices[i])+'M';
    }

    const note=document.getElementById('gbxNextNote');
    if(note){
      if(tIdx<3){
        const needed=GBX_TIER_MAX[tIdx]+1-c.people;
        const nextPrice=c.prices[tIdx+1];
        note.innerHTML=`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" style="flex-shrink:0;"><path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z"/></svg> با ورود ${toFarsiNum(needed)} زائر دیگه، قیمت برای همه به ${gbxFmtPrice(nextPrice)} میلیون می‌رسه`;
      } else {
        note.innerHTML=`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" style="flex-shrink:0;"><path d="M9 12l2 2 4-4M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0z"/></svg> این کاروان به ارزون‌ترین پلکان رسیده ✦ هر زائری که بیاری، جاش رو با همین قیمت نگه می‌داریم`;
      }
    }

    const dropEl=document.getElementById('gbxPriceDrop');
    if(dropEl) dropEl.style.display = tIdx<3 ? 'flex' : 'none';

    const inviteEl=document.getElementById('gbxInviteLink');
    if(inviteEl) inviteEl.textContent=`avankarvan.ir/g/${c.key}`;
    const copyBtn=document.getElementById('gbxInviteCopy');
    if(copyBtn){
      copyBtn.classList.remove('copied');
      copyBtn.innerHTML=`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> کپی`;
    }
  }
  window.gbxSelect=gbxSelect;
  window.gbxToggle=function(){
    const wrap=document.getElementById('gbxWrap');
    const btn=document.getElementById('gbxToggle');
    if(!wrap) return;
    const open=wrap.classList.toggle('open');
    if(btn) btn.setAttribute('aria-expanded', open?'true':'false');
  };

  window.gbxCopyInvite=function(){
    const c=GBX_CARAVANS.find(x=>x.key===gbxActiveKey);
    if(!c) return;
    const url=`https://avankarvan.ir/g/${c.key}`;
    const btn=document.getElementById('gbxInviteCopy');
    const done=()=>{
      if(!btn) return;
      btn.classList.add('copied');
      btn.innerHTML=`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg> کپی شد`;
      setTimeout(()=>{
        if(!btn) return;
        btn.classList.remove('copied');
        btn.innerHTML=`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> کپی`;
      },1800);
    };
    if(navigator.clipboard && navigator.clipboard.writeText){
      navigator.clipboard.writeText(url).then(done).catch(done);
    } else {
      const ta=document.createElement('textarea');
      ta.value=url; ta.style.position='fixed'; ta.style.opacity='0';
      document.body.appendChild(ta); ta.select();
      try{ document.execCommand('copy'); }catch(e){}
      document.body.removeChild(ta);
      done();
    }
  };

  window.gbxShareInvite=function(){
    const c=GBX_CARAVANS.find(x=>x.key===gbxActiveKey);
    if(!c) return;
    const url=`https://avankarvan.ir/g/${c.key}`;
    const text=`بیا با هم تو کاروان ${c.city} (${c.date}) ثبت‌نام کنیم؛ هرچی بیشتر باشیم قیمت ارزون‌تر می‌شه ✦`;
    if(navigator.share){
      navigator.share({title:'دعوت به کاروان گروهی', text, url}).catch(()=>{});
    } else {
      gbxCopyInvite();
    }
  };

  function gbxOpenRegister(){
    const c=GBX_CARAVANS.find(x=>x.key===gbxActiveKey);
    if(!c) return;
    const tIdx=gbxTierIndex(c.people);
    const price=c.prices[tIdx];
    openSheet({
      tag:'🚌 قیمت گروهی زنده',
      title:`کاروان ${c.city} — اعزام ${c.date}`,
      grad:'#0F4D3A,#CFA13A',
      price,
      origin:c.city,
      transport:'land',
      stops:['کربلا','نجف'],
      hotels:[
        {city:'کربلا',name:'هتل کربلا',stars:'۳★',dist:'۳۰۰ متر'},
        {city:'نجف',name:'هتل الصادق',stars:'۳★',dist:'۳۰۰ متر'},
      ],
      chips:[
        {svgKey:'date',lbl:'تاریخ اعزام',val:c.date},
        {svgKey:'capacity',lbl:'ثبت‌نام شده',val:toFarsiNum(c.people)+' نفر'},
        {svgKey:'land',lbl:'نوع سفر',val:'زمینی'},
      ],
      days:[],
      sub:`قیمت پلکانی گروهی — هرچی این کاروان پرتر بشه، قیمت برای همه پایین‌تر میاد.`,
    });
  }
  window.gbxOpenRegister=gbxOpenRegister;

  document.addEventListener('DOMContentLoaded', function(){
    gbxRenderChips();
    gbxRenderDetails();
  });
})();
