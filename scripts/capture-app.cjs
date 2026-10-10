#!/usr/bin/env node
/** Real AgriClimate browser capture. No source edits, response mocks, injected product UI, or NASA sync.
 * Only browser styling: hide nextjs-portal (Next's development badge).
 * Runs genuine UI POST/PATCH flows and restores only the demo records, preserving concurrent changes.
 */
const { chromium } = require('/home/tahsin/.npm/_npx/9833c18b2d85bc59/node_modules/playwright');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execFileSync } = require('child_process');
const ROOT = process.cwd();
const OUT = path.join(ROOT, 'videos/agriclimate-field-operations/assets/captures');
const EVID = path.join(ROOT, 'evidence');
const BASE = 'http://localhost:3457';
const RUN = new Date().toISOString().replace(/[:.]/g, '-');
const BACKUP = path.join(EVID, 'capture-backup-' + RUN);
const api = [], actions = [], errors = [], recordings = [], shots = [], screenshots = [];
const originals = new Map(), createdIds = new Set(), responseTasks = [];
const reason = 'Film demo: request a shared solar pump for Chilmari South seedbeds during the evening irrigation rotation.';
const note = 'Film demo approved: shared solar pump allocated for the next evening rotation. Coordinate setup with the field office.';
let browser, desktop, mobile, narrow;
for (const d of [OUT, EVID, BACKUP]) fs.mkdirSync(d, {recursive:true});
for (const f of fs.readdirSync(path.join(ROOT, 'data/live'))) {
  const p=path.join(ROOT,'data/live',f);
  if (!fs.statSync(p).isFile()) continue;
  const bytes=fs.readFileSync(p); originals.set(f,bytes); fs.writeFileSync(path.join(BACKUP,f),bytes);
}
const json = (p,v) => fs.writeFileSync(p, JSON.stringify(v,null,2)+'\n');
const sha = b => crypto.createHash('sha256').update(b).digest('hex');
const now = r => +((Date.now()-r.started)/1000).toFixed(3);
const visible = l => l.filter({visible:true}).first();
const hold = async (p,n=1800) => p.waitForTimeout(n);
function log(r,label,extra={}) { const a={recording:r.id,sourceSeconds:now(r),label,...extra}; actions.push(a); console.log(JSON.stringify(a)); }
async function click(r,l,label,wait=1000) {
  l=visible(l); await l.scrollIntoViewIfNeeded(); const b=await l.boundingBox();
  const isMapLabel=await l.evaluate(e=>e.classList.contains('maplibregl-marker')&&e.textContent.trim()!=='!');
  const position=b&&isMapLabel?{x:b.width-6,y:b.height/2}:undefined;
  if(b) {await r.page.mouse.move(b.x+(position?.x??b.width/2),b.y+b.height/2,{steps:20}); await hold(r.page,220);}
  log(r,label); await l.click({timeout:15000,...(position?{position}:{})}); await hold(r.page,wait);
}
async function still(r,name,description) {
  const p=path.join(OUT,name+'.png'); await r.page.screenshot({path:p});
  screenshots.push({file:path.relative(ROOT,p),width:r.size.width,height:r.size.height,recording:r.id,sourceSeconds:now(r),description});
}
async function closeDialogs(r) { if(await r.page.getByRole('dialog').count()) {await r.page.keyboard.press('Escape'); await hold(r.page,700);} }
async function scene(r,name,description,fn) {
  await closeDialogs(r); const s={id:name,description,recording:r.id,start:now(r),end:null,status:'capturing',events:[]}; shots.push(s);
  log(r,'BEGIN '+name); try {await fn(); s.status='captured';} catch(e) {s.status='partial';s.error=e.message;errors.push({scene:name,error:e.message});console.error(name,e.message);await still(r,name+'-blocker','Capture blocker: '+e.message).catch(()=>{});}
  await hold(r.page,800);s.end=now(r); log(r,'END '+name); json(path.join(EVID,'capture-progress.json'),{shots,screenshots,errors,actions});
}
async function createRecording(id,size,hash,state) {
  const context=await browser.newContext({viewport:size,screen:size,deviceScaleFactor:1,locale:'en-US',recordVideo:{dir:OUT,size},...(state?{storageState:state}:{})});
  const r={id,size,context,started:Date.now(),page:null,raw:null};recordings.push(r);
  context.on('response',response=>{
    if(!response.url().startsWith(BASE+'/api/'))return;
    const task=(async()=>{let body;try{body=await response.json();}catch{body=await response.text().catch(()=>null);}
      const req=response.request();let requestBody=null;try{requestBody=req.postDataJSON()}catch{requestBody=req.postData()}
      const record={recording:id,sourceSeconds:now(r),url:response.url(),method:req.method(),status:response.status(),request:requestBody,response:body};api.push(record);
      if(req.method()==='POST') {const generated=body?.request?.id||body?.alert?.id;if(generated)createdIds.add(generated);}
      json(path.join(EVID,'capture-api.json'),api);
    })(); responseTasks.push(task);
  });
  r.page=await context.newPage();r.page.setDefaultTimeout(18000);
  r.page.on('pageerror',e=>errors.push({recording:id,type:'pageerror',error:e.message}));
  await r.page.goto(BASE+hash,{waitUntil:'domcontentloaded',timeout:120000});
  await r.page.getByRole('group',{name:'Application Mode Switcher'}).waitFor();
  await r.page.addStyleTag({content:'nextjs-portal { display: none !important; }'});
  await hold(r.page,6500);
  return r;
}
async function theme(r,want) {const l=r.page.getByRole('button',{name:'Switch to '+want+' theme',exact:true});if(await l.count())await click(r,l,'Theme '+want);}
async function language(r,lang) {await click(r,r.page.getByRole('button',{name:'Switch language to '+lang,exact:true}),'Language '+lang);await r.page.evaluate(()=>window.scrollTo(0,window.scrollY));}
async function officer(r) {await click(r,r.page.getByRole('group',{name:'Application Mode Switcher'}).getByRole('button').nth(1),'Switch to officer',1600); const elevate=r.page.getByRole('button',{name:'Switch as Officer (Demo)',exact:true});if(await elevate.count()) await click(r,elevate,'Use app demo role switch',2000);}
async function farmer(r) {await click(r,r.page.getByRole('group',{name:'Application Mode Switcher'}).getByRole('button').nth(0),'Switch to farmer',2000);}
async function overview(r) {const b=r.page.getByRole('button',{name:'Back to District Overview',exact:true});if(await visible(b).isVisible().catch(()=>false))await click(r,b,'District overview',1200);await click(r,r.page.getByRole('button',{name:'Reset map view',exact:true}),'Reset map to district bounds',2800);}
async function block(r,name) {const label=r.page.locator('.maplibregl-marker').filter({hasText:new RegExp('^'+name+'$')});await click(r,label,'Select '+name,3000);}
async function layer(r,name) {await click(r,r.page.locator('[role="button"]').filter({has:r.page.getByText(name,{exact:true})}),'Layer '+name,2200);}
async function scroll(r,y,label) {log(r,label);await r.page.evaluate(y=>window.scrollTo({top:y,left:0,behavior:'smooth'}),y);await hold(r.page,2000);}
async function dialogScroll(r,y) {await visible(r.page.getByRole('dialog')).evaluate((e,y)=>e.scrollTo({top:y,behavior:'smooth'}),y);await hold(r.page,1800);}
async function restore() {
  const restoration=[];
  for(const [file,original] of originals) {
    const dest=path.join(ROOT,'data/live',file);let current=fs.readFileSync(dest);let outcome='unchanged';
    if(['dispatched-alerts.json','pump-requests.json'].includes(file)) {
      const existing=JSON.parse(current),before=JSON.parse(original);
      const cleaned=existing.filter(x=>!createdIds.has(x.id));
      if(JSON.stringify(cleaned)===JSON.stringify(before)) {fs.writeFileSync(dest,original);outcome='original restored byte-for-byte';}
      else if(existing.length!==cleaned.length) {fs.writeFileSync(dest,JSON.stringify(cleaned,null,2));outcome='demo records removed; unrelated concurrent changes preserved';}
      else if(sha(current)!==sha(original)) outcome='unrelated concurrent changes preserved';
    } else if(sha(current)!==sha(original)) outcome='untouched by capture; external change preserved';
    restoration.push({file:'data/live/'+file,backup:path.relative(ROOT,path.join(BACKUP,file)),originalSha256:sha(original),finalSha256:sha(fs.readFileSync(dest)),outcome});
  }
  json(path.join(EVID,'capture-restoration.json'),{createdIds:[...createdIds],restoration});return restoration;
}
(async()=>{
  try {
    browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--enable-unsafe-swiftshader']});
    desktop=await createRecording('desktop',{width:1920,height:1080},'/#officer?block=blk_kurigram_01');
    await theme(desktop,'dark');await overview(desktop);
    await scene(desktop,'01-dark-officer-map','Real dark-mode district map, existing cache, all twelve block polygons.',async()=>{await hold(desktop.page,4500);await still(desktop,'01-dark-officer-map','Dark-mode Kurigram officer map at district bounds.');await hold(desktop.page,4000);});
    await scene(desktop,'02-mode-switch','Continuous real officer → farmer → officer mode switch.',async()=>{await farmer(desktop);await hold(desktop.page,3000);await still(desktop,'02-farmer-desktop','Same app in farmer mode.');await officer(desktop);await overview(desktop);await hold(desktop.page,2000);});
    await scene(desktop,'03-chilmari-officer','Desktop 1920×1080 selects Chilmari South and displays actual telemetry.',async()=>{await theme(desktop,'light');await overview(desktop);{const b=await visible(desktop.page.locator('.maplibregl-marker').filter({hasText:/^Chilmari South$/})).boundingBox();if(b)await desktop.page.mouse.move(b.x+b.width-15,b.y-18,{steps:25});}await hold(desktop.page,1800);await block(desktop,'Chilmari South');await still(desktop,'03-chilmari-officer','Selected Chilmari South: NDVI 0.42, CWSI 0.72, root-zone 26.2% as rendered.');await hold(desktop.page,4000);});
    await scene(desktop,'04-seven-layers-basemap','All seven real layer selectors, changing legend and map, then satellite basemap.',async()=>{await overview(desktop);const list=['NDVI Anomaly','Soil Moisture','Flood Risk (FSS)','Water Stress','7d Precip','Pump Priority','Fire / Heat'];for(let i=0;i<list.length;i++){await layer(desktop,list[i]);await still(desktop,'04-layer-'+String(i+1).padStart(2,'0'),list[i]+' real map layer.');}await click(desktop,desktop.page.getByRole('button',{name:'Change OpenStreetMap basemap style',exact:true}),'Open basemap switcher');await click(desktop,desktop.page.getByRole('button',{name:/OSM Satellite High-Res World Imagery/}),'Choose satellite basemap',6500);await still(desktop,'04-satellite-basemap','Actual satellite raster basemap with Fire / Heat layer.');await hold(desktop.page,2500);});
    await scene(desktop,'05-cached-fire-overlay','Existing cached VIIRS fire alert (5.5 MW FRP); not a fresh sync or new detection.',async()=>{
      await overview(desktop);await layer(desktop,'Fire / Heat');await click(desktop,desktop.page.getByRole('button').filter({has:desktop.page.getByText('Bhurungamari Border',{exact:true})}),'Select Bhurungamari from roster',3000);
      const map=visible(desktop.page.locator('[aria-label="Interactive Agricultural Map"]'));
      const alerts=map.locator('.maplibregl-marker').filter({hasText:'!'});
      let chosen=null;const vp=desktop.size;
      for(const a of await alerts.all()){const b=await a.boundingBox();if(b&&b.x>340&&b.x<1560&&b.y>60&&b.y<vp.height-30)chosen=a;}
      if(!chosen)throw Error('No visible fire beacon after selecting Bhurungamari.');
      await click(desktop,chosen,'Open cached fire alert beacon',2000);
      await still(desktop,'05-fire-composer','Real cached fire alert opened; actual app also opens advisory composer.');
      await closeDialogs(desktop);await hold(desktop.page,2000);await still(desktop,'05-fire-tactical-overlay','Real tactical overlay for cached fire event; check timestamp in source data.');await hold(desktop.page,3500);
    });
    await scene(desktop,'06-rowmari-broadcast','Select Rowmari Char, fill actual advisory, send through real local dispatch API.',async()=>{
      await overview(desktop);await layer(desktop,'Flood Risk (FSS)');await block(desktop,'Rowmari Char');
      await click(desktop,desktop.page.getByRole('button',{name:'Dispatch Advisory to Block Farmers',exact:true}),'Open prefilled Rowmari composer');
      const d=desktop.page.getByRole('dialog');await d.locator('select').nth(1).selectOption('high');
      await d.locator('input[type="text"]').fill('');await d.locator('input[type="text"]').pressSequentially('Flash Flood Warning: move harvested crops to high ground',{delay:36});
      await d.locator('textarea').pressSequentially('Film demo advisory: move harvested crops to high ground and clear field drainage. Follow local DAE guidance.',{delay:22});
      await hold(desktop.page,2200);await still(desktop,'06-rowmari-composer','Real form: Rowmari target, high severity, SMS and app push selected; demo guidance.');
      const response=desktop.page.waitForResponse(r=>r.url().endsWith('/api/alerts/dispatch')&&r.request().method()==='POST');
      await click(desktop,d.getByRole('button',{name:'Send Broadcast',exact:true}),'Send real advisory broadcast',1500);const result=await response;if(result.status()!==200)throw Error('Dispatch returned '+result.status());
      await still(desktop,'06-broadcast-confirmed','Actual dispatch success UI; API prototype persists advisory locally, no telecom delivery verified.');await hold(desktop.page,3500);
    });
    await closeDialogs(desktop);await farmer(desktop);await language(desktop,'Bengali');
    mobile=await createRecording('mobile',{width:390,height:844},'/#home?block=blk_kurigram_11',await desktop.context.storageState());
    await scene(mobile,'07-farmer-bengali-alert','Real Bengali farmer alert and language switch; newly dispatched alert accessed through alert list.',async()=>{
      await hold(mobile.page,2500);await still(mobile,'07-farmer-home-bengali','Bengali farmer home with officer-dispatched Rowmari bulletin.');
      const nav=mobile.page.getByRole('navigation',{name:'Farmer Navigation Bar'});await click(mobile,nav.getByRole('tab').nth(3),'Open farmer advisories',1600);
      const bn=mobile.page.getByText('উপজেলা কৃষি কার্যালয়ের জরুরি পরামর্শ বুলেটিন',{exact:true});await visible(bn).scrollIntoViewIfNeeded();await hold(mobile.page,1600);await still(mobile,'07-new-alert-bengali','New advisory uses the actual generic Bengali headline fallback; field guidance remains English.');await hold(mobile.page,3000);
      await language(mobile,'English');await mobile.page.getByText('Flash Flood Warning: move harvested crops to high ground',{exact:true}).first().scrollIntoViewIfNeeded();await hold(mobile.page,1500);await still(mobile,'07-new-alert-english','Same stored advisory rendered in English.');await hold(mobile.page,3000);
    });
    await scene(mobile,'08-mobile-decisions-telemetry','Chilmari mobile daily decision cards, actual telemetry modal from its real button.',async()=>{
      await language(mobile,'English');await click(mobile,mobile.page.getByRole('navigation',{name:'Farmer Navigation Bar'}).getByRole('tab').nth(0),'Go to farmer home');
      await mobile.page.getByRole('combobox',{name:'Select farm block'}).selectOption('blk_kurigram_01');await scroll(mobile,0,'Scroll to Chilmari overview');await still(mobile,'08-mobile-home','Chilmari mobile home.');
      await mobile.page.getByText('Irrigation Needed Today',{exact:true}).scrollIntoViewIfNeeded();await hold(mobile.page,2000);await still(mobile,'08-soil-pump-card','Actual soil strata and solar-pump instruments occupy one card, not two independently arriving cards.');
      await mobile.page.getByText('7-Day Forecast & Radar',{exact:true}).scrollIntoViewIfNeeded();await hold(mobile.page,2500);await still(mobile,'08-weather-card','Real weather horizon strip.');
      await mobile.page.getByText('Satellite Health & Nutrients',{exact:true}).scrollIntoViewIfNeeded();await hold(mobile.page,2500);await still(mobile,'08-crop-growth-card','Real crop growth and health card.');
      await scroll(mobile,0,'Return to telemetry button');await click(mobile,mobile.page.getByRole('button',{name:/Telemetry \(5\)/}),'Open telemetry detail',1600);await still(mobile,'08-telemetry-modal','Actual five-product telemetry detail.');await hold(mobile.page,3000);await dialogScroll(mobile,500);await still(mobile,'08-telemetry-modal-lower','Telemetry detail lower section.');
    });
    await scene(mobile,'09-crop-recommendations','Real top-ranked crop recommendation with scores and explanations.',async()=>{
      await scroll(mobile,0,'Top farmer navigation');await click(mobile,mobile.page.getByRole('button',{name:/What to plant/}),'Open crop recommendations',1800);await still(mobile,'09-crop-modal','Real recommendation ranking and top expanded crop.');await hold(mobile.page,3000);await dialogScroll(mobile,360);await still(mobile,'09-crop-modal-scores','Actual crop suitability sub-scores, explanation and risk note.');await hold(mobile.page,4000);
    });
    await scene(mobile,'10a-pump-request-submit','Real high-urgency Chilmari request submitted by UI, no personal name.',async()=>{
      await scroll(mobile,0,'Top farmer navigation');await click(mobile,mobile.page.getByRole('button',{name:'Pump',exact:true}),'Open pump request');const d=mobile.page.getByRole('dialog');await d.locator('textarea').pressSequentially(reason,{delay:28});await hold(mobile.page,1400);await still(mobile,'10a-pump-form','Demo request form, high urgency.');
      const response=mobile.page.waitForResponse(r=>r.url().endsWith('/api/pump-requests')&&r.request().method()==='POST');await click(mobile,d.getByRole('button',{name:'Submit Solar Pump Request',exact:true}),'Submit real pump request',1200);const result=await response;if(result.status()!==201)throw Error('Pump submission returned '+result.status());const body=await result.json();createdIds.add(body.request.id);log(mobile,'Pump API created request',{id:body.request.id,deficitSeverity:body.request.deficitSeverity});await still(mobile,'10a-pump-submitted','Actual API success, pending request stored.');await dialogScroll(mobile,1000);await still(mobile,'10a-pump-pending','Pending request visible in history.');await hold(mobile.page,3000);
    });
    await language(desktop,'English');await officer(desktop);await hold(desktop.page,1500);
    await scene(desktop,'10b-officer-pump-approval','Officer queue opens the demo request, writes note, approves through real PATCH.',async()=>{
      const p=desktop.page.getByText('"'+reason+'"',{exact:true});await visible(p).scrollIntoViewIfNeeded();await hold(desktop.page,1800);await still(desktop,'10b-officer-pending-queue','Actual queue entry for film demo; CWSI 72%.');
      await click(desktop,visible(p).locator('..').getByRole('button',{name:'Review',exact:true}),'Review demo pump request');const d=desktop.page.getByRole('dialog');await d.locator('textarea').pressSequentially(note,{delay:27});await hold(desktop.page,1500);await still(desktop,'10b-officer-review-note','Real review modal and officer note.');
      const response=desktop.page.waitForResponse(r=>r.url().includes('/api/pump-requests/')&&r.request().method()==='PATCH');await click(desktop,d.getByRole('button',{name:'Approve & Allocate Pump',exact:true}),'Approve demo pump request',1500);const result=await response;if(result.status()!==200)throw Error('Approval returned '+result.status());await visible(desktop.page.getByText('Note: '+note,{exact:true})).scrollIntoViewIfNeeded();await hold(desktop.page,1600);await still(desktop,'10b-officer-approved','Real approved queue entry with note.');await hold(desktop.page,3000);
    });
    await scene(mobile,'10c-farmer-pump-approved','Farmer remount fetches the actual approved request and officer note.',async()=>{
      await mobile.page.reload({waitUntil:'domcontentloaded'});await mobile.page.addStyleTag({content:'nextjs-portal {display:none!important}'});await hold(mobile.page,4500);await click(mobile,mobile.page.getByRole('button',{name:'Pump',exact:true}),'Open updated farmer pump history');await dialogScroll(mobile,1200);await mobile.page.getByText(note,{exact:true}).scrollIntoViewIfNeeded();await hold(mobile.page,2000);await still(mobile,'10c-farmer-approved','Approved status and same officer note after real API refetch.');await hold(mobile.page,4500);
    });
    await scene(mobile,'11-irrigation-modal','Real irrigation protocol and allocation hours/sequence.',async()=>{
      await scroll(mobile,0,'Top farmer navigation');await click(mobile,mobile.page.getByRole('button',{name:'Pumping',exact:true}),'Open irrigation advisory',2000);await still(mobile,'11-irrigation-modal','Real irrigation modal, fixed guidance plus computed allocation.');await hold(mobile.page,2800);await dialogScroll(mobile,460);await still(mobile,'11-irrigation-allocation','Actual allocated hours and sequence priority.');await hold(mobile.page,3000);
      const response=await mobile.context.request.get(BASE+'/api/irrigation?districtId=kurigram');api.push({recording:'mobile',sourceSeconds:now(mobile),url:BASE+'/api/irrigation?districtId=kurigram',method:'GET',status:response.status(),request:null,response:await response.json()});
    });
    narrow=await createRecording('mobile-320',{width:320,height:740},'/#home?block=blk_kurigram_01',await mobile.context.storageState());
    await scene(narrow,'14-mobile-320-offline-voice','Genuine 320px viewport, network offline event on already-loaded app, honest voice preview.',async()=>{
      await still(narrow,'14-mobile-320','Unmodified 320px app: actual header overflow remains visible, bottom nav fits.');await hold(narrow.page,2500);log(narrow,'Browser network set offline (not an offline reload)');await narrow.context.setOffline(true);await hold(narrow.page,2200);await still(narrow,'14-mobile-320-offline','Actual OfflineBanner after browser network disabled; loaded UI retained.');await hold(narrow.page,2000);await click(narrow,narrow.page.getByRole('button',{name:'Voice Query & Audio Advisory',exact:true}),'Open actual planned voice dialog',1800);await still(narrow,'14-voice-preview','Actual voice feature preview, explicitly planned for production; dialog does not call API.');await hold(narrow.page,4000);await narrow.context.setOffline(false);
    });
    await scene(desktop,'15-app-overview','Actual app overview across officer district and farmer desktop modes.',async()=>{
      await overview(desktop);await layer(desktop,'NDVI Anomaly');await click(desktop,desktop.page.getByRole('button',{name:'Change OpenStreetMap basemap style',exact:true}),'Open basemap menu');await click(desktop,desktop.page.getByRole('button',{name:/OpenStreetMap Standard OSM Cartography/}),'Return to standard cartography',4000);await still(desktop,'15-officer-overview','Full real district cockpit.');await hold(desktop.page,3000);await farmer(desktop);await desktop.page.getByRole('combobox',{name:'Select farm block'}).selectOption('blk_kurigram_01');await scroll(desktop,0,'Show farmer overview');await still(desktop,'15-farmer-overview','Real desktop farmer overview.');await hold(desktop.page,4000);
    });
  } catch(e) {errors.push({fatal:true,error:e.stack});console.error(e);} finally {
    for(const r of recordings) {try{r.raw=await r.page.video().path();await r.context.setOffline(false);await r.context.close();const renamed=path.join(OUT,'capture-'+r.id+'-raw.webm');fs.renameSync(r.raw,renamed);r.raw=renamed;}catch(e){errors.push({recording:r.id,closeError:e.message});}}
    await Promise.allSettled(responseTasks);if(browser)await browser.close();
    const restoration=await restore();
    json(path.join(EVID,'capture-api.json'),api);json(path.join(EVID,'capture-actions.json'),actions);
    const manifest={createdAt:new Date().toISOString(),baseUrl:BASE,framework:'Real Next.js app captured by Playwright Chromium; software WebGL renders genuine MapLibre map.',styleChanges:['nextjs-portal { display: none !important; } — hides only Next.js development badge.'],noResponseMocks:true,nasaSyncTriggered:false,notes:[
      'Desktop recordings are 1920x1080; mobile is 390x844; narrow mobile is 320x740. App layout is not restyled.',
      'Any personal-looking topbar name and old request notes are pre-existing app fixtures, not newly supplied personal data.',
      'Cached fire alert is 5.5 MW FRP, issued 2026-09-30 and expires 2026-10-01; captured as existing cache, not newly detected fire.',
      'New composer Bengali headline is a generic fallback, not a translation of the typed English headline. No invented bilingual translation.',
      'Dispatch endpoint stores local JSON. Success message does not establish actual telecom SMS/push delivery.',
      'Farmer approval is shown after reload/refetch; no push or automatic latency claim.',
      'DailyDecisionsGrid has three cards; soil and solar instruments share the water card. Telemetry opens from the Telemetry (5) button, not the soil card.',
      '320px header has existing horizontal overflow. Offline capture is a loaded-page offline event, not a successful cold offline reload.',
      'Voice dialog is a real production-preview stub; clicking it does not call the 501 API.',
      'Source time ranges use recording wall clock and may differ from frame PTS by approximately one second; converted scene files are ready for editorial review.'
    ],recordings:recordings.map(r=>({id:r.id,file:r.raw&&path.relative(ROOT,r.raw),width:r.size.width,height:r.size.height})),clips:shots,screenshots,errors,restoration};
    json(path.join(EVID,'captures.json'),manifest);
    console.log('Capture complete, data restored. Run node scripts/capture-convert.cjs for MP4 scene assets.');
  }
})().catch(e=>{console.error(e);process.exitCode=1});
