const {chromium}=require('/home/tahsin/.npm/_npx/9833c18b2d85bc59/node_modules/playwright');
const fs=require('fs');
(async()=>{
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--enable-unsafe-swiftshader']});
const page=await browser.newPage({viewport:{width:1920,height:1080},deviceScaleFactor:1});
await page.goto('http://localhost:3457/#officer?block=blk_kurigram_01',{waitUntil:'domcontentloaded',timeout:120000});
await page.waitForTimeout(10000);
await page.addStyleTag({content:'nextjs-portal { display:none !important; }'});
console.log((await page.locator('body').innerText()).slice(0,22000));
console.log('CANVASES',await page.locator('canvas').count());
console.log('BUTTONS',await page.getByRole('button').evaluateAll(es=>es.map(e=>({text:e.innerText,aria:e.getAttribute('aria-label'),title:e.getAttribute('title')}))));
console.log('MAP HTML',(await page.locator('[aria-label="Interactive Agricultural Map"]').first().innerHTML()).slice(0,6000));
await page.screenshot({path:'videos/agriclimate-field-operations/assets/captures/inspect-officer.png'});
await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
