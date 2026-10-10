#!/usr/bin/env node
// Convert original Playwright browser recordings to editorial scene MP4s. No picture alteration.
const fs=require('fs');const path=require('path');const {execFileSync}=require('child_process');
const root=process.cwd();const file=path.join(root,'evidence/captures.json');const m=JSON.parse(fs.readFileSync(file));
const actions=JSON.parse(fs.readFileSync(path.join(root,'evidence/capture-actions.json')));
const probe=p=>JSON.parse(execFileSync('ffprobe',['-v','error','-select_streams','v:0','-show_entries','stream=width,height,codec_name,r_frame_rate:format=duration','-of','json',p],{encoding:'utf8'}));
for(const r of m.recordings){if(!r.file)continue;const p=probe(path.join(root,r.file));r.durationSeconds=+p.format.duration;r.codec=p.streams[0].codec_name;r.frameRate=p.streams[0].r_frame_rate;}
for(const c of m.clips){const r=m.recordings.find(r=>r.id===c.recording);if(!r?.file||c.end==null)continue;if(c.file&&c.sourceFile===r.file&&fs.existsSync(path.join(root,c.file)))continue;
const start=Math.max(0,c.start-0.25),duration=Math.min(c.end-start,r.durationSeconds-start);if(duration<=0)continue;
c.file=path.join('videos/agriclimate-field-operations/assets/captures',c.id+'.mp4');
console.log('Converting',c.id,start.toFixed(3),duration.toFixed(3));
execFileSync('ffmpeg',['-hide_banner','-loglevel','error','-y','-ss',start.toFixed(3),'-i',path.join(root,r.file),'-t',duration.toFixed(3),'-an','-c:v','libx264','-preset','fast','-crf','18','-pix_fmt','yuv420p','-movflags','+faststart','-threads','2',path.join(root,c.file)],{stdio:'inherit'});
const p=probe(path.join(root,c.file));c.width=p.streams[0].width;c.height=p.streams[0].height;c.durationSeconds=+p.format.duration;c.sourceFile=r.file;c.sourceTimeRange={startSeconds:start,endSeconds:start+c.durationSeconds};
c.usefulRanges=actions.filter(a=>a.recording===c.recording&&a.sourceSeconds>=c.start&&a.sourceSeconds<=c.end&&!a.label.startsWith('END ')).map((a,i,list)=>({startSeconds:Math.max(0,+(a.sourceSeconds-start).toFixed(3)),endSeconds:Math.min(c.durationSeconds,+((list[i+1]?.sourceSeconds??c.end)-start).toFixed(3)),description:a.label}));
fs.writeFileSync(file,JSON.stringify(m,null,2)+'\n');}
m.files=[...m.clips.filter(c=>c.file).map(c=>({file:c.file,width:c.width,height:c.height,durationSeconds:c.durationSeconds,kind:'scene-video',status:c.status,description:c.description,usefulRanges:c.usefulRanges})),...m.screenshots.map(s=>({...s,kind:'screenshot',durationSeconds:null})),...m.recordings.map(r=>({...r,kind:'raw-recording'}))];
m.conversion={codec:'H.264',crf:18,pixelFormat:'yuv420p',audio:'none (browser-only UI capture)',pictureAlterations:'none; full-frame trims only',completedAt:new Date().toISOString()};
fs.writeFileSync(file,JSON.stringify(m,null,2)+'\n');console.log('MP4 conversion complete:',m.clips.filter(c=>c.file).length,'clips.');
