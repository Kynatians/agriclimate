#!/usr/bin/env node
const fs=require('fs'),path=require('path'),crypto=require('crypto'),{execFileSync}=require('child_process');
const root=process.cwd(),manifest=JSON.parse(fs.readFileSync('evidence/captures.json')),api=JSON.parse(fs.readFileSync('evidence/capture-api.json'));
const report={checkedAt:new Date().toISOString(),videos:[],screenshots:[],apiWrites:[],restoration:[],errors:[]};
for(const c of manifest.clips.filter(x=>x.file)){
 try{const p=JSON.parse(execFileSync('ffprobe',['-v','error','-show_entries','stream=codec_name,width,height:format=duration','-of','json',c.file],{encoding:'utf8'}));execFileSync('ffmpeg',['-v','error','-i',c.file,'-frames:v','1','-f','null','-'],{stdio:'pipe'});report.videos.push({file:c.file,width:p.streams[0].width,height:p.streams[0].height,durationSeconds:+p.format.duration,status:c.status,decoded:true});}catch(e){report.errors.push({file:c.file,error:e.message});}
}
for(const s of manifest.screenshots){try{const b=fs.readFileSync(s.file);if(b.toString('hex',0,8)!=='89504e470d0a1a0a')throw Error('Not PNG');report.screenshots.push({file:s.file,width:b.readUInt32BE(16),height:b.readUInt32BE(20),bytes:b.length});}catch(e){report.errors.push({file:s.file,error:e.message});}}
report.apiWrites=api.filter(x=>x.method!=='GET').map(x=>({method:x.method,url:x.url,status:x.status,id:x.response?.request?.id||x.response?.alert?.id,deficitSeverity:x.response?.request?.deficitSeverity,statusAfter:x.response?.request?.status}));
if(report.apiWrites.some(x=>x.url.includes('/sync/live-nasa')))report.errors.push('Unexpected NASA sync POST.');
report.restoration=manifest.restoration.map(r=>({...r,currentSha256:crypto.createHash('sha256').update(fs.readFileSync(r.file)).digest('hex')}));
report.completedScenes=manifest.clips.filter(x=>x.status==='captured').map(x=>x.id);report.incompleteScenes=manifest.clips.filter(x=>x.status!=='captured').map(x=>({id:x.id,error:x.error}));
report.totalVideoSeconds=+report.videos.reduce((n,x)=>n+x.durationSeconds,0).toFixed(3);report.ok=report.errors.length===0;
fs.writeFileSync('evidence/capture-verification.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({ok:report.ok,videos:report.videos.length,screenshots:report.screenshots.length,seconds:report.totalVideoSeconds,incompleteScenes:report.incompleteScenes,apiWrites:report.apiWrites},null,2));process.exitCode=report.ok?0:1;
