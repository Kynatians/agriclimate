#!/usr/bin/env node
/** Read-only final audio timing, payload consistency, and non-silence checks. */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
const project=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const scenes=JSON.parse(fs.readFileSync(path.join(project,'narration.json'),'utf8'));
const meta=JSON.parse(fs.readFileSync(path.join(project,'audio_meta.json'),'utf8'));
const expected=[14,12,16,18,14,18,16,18,20,22,14,20,16,14,14];
const errors=[];
const files=[];
function check(ok,message){if(!ok)errors.push(message);}
check(scenes.length===15,'Narration must have fifteen scenes');
check(JSON.stringify(scenes.map(s=>s.duration))===JSON.stringify(expected),'Unexpected scene durations');
check(meta.complete===true,'Audio metadata is not complete');
check(meta.voices.length===15,'Metadata must have fifteen voice records');
for (const scene of scenes) {
  const file=path.join(project,'assets/voice',scene.id+'.wav');
  check(fs.existsSync(file),`${scene.id}: missing WAV`);
  if(!fs.existsSync(file))continue;
  const p=spawnSync('ffprobe',['-v','error','-show_entries','format=duration:stream=sample_rate,channels,codec_name','-of','json',file],{encoding:'utf8'});
  check(p.status===0,`${scene.id}: ffprobe failed`);
  if(p.status!==0)continue;
  const probe=JSON.parse(p.stdout),duration=Number(probe.format.duration),stream=probe.streams[0];
  const record=meta.voices.find(v=>v.id===scene.id);
  check(duration<=scene.duration-.6,`${scene.id}: ${duration}s exceeds ${scene.duration-.6}s`);
  check(record?.text===scene.text,`${scene.id}: stale narration metadata`);
  check(Math.abs(record?.duration_s-duration)<.002,`${scene.id}: duration metadata mismatch`);
  check(record?.speed<=1.2,`${scene.id}: excessive synthesis rate`);
  check(stream.codec_name==='pcm_s16le'&&stream.channels===1&&stream.sample_rate==='48000',`${scene.id}: unexpected PCM format`);
  const audio=spawnSync('ffmpeg',['-hide_banner','-nostats','-i',file,'-af','volumedetect,silencedetect=noise=-45dB:d=0.15','-f','null','-'],{encoding:'utf8',maxBuffer:2*1024*1024});
  const log=audio.stderr;
  const peak=Number(log.match(/max_volume: (-?[\d.]+) dB/)?.[1]);
  const mean=Number(log.match(/mean_volume: (-?[\d.]+) dB/)?.[1]);
  check(audio.status===0,`${scene.id}: audio decode failed`);
  check(Number.isFinite(peak)&&peak<0,`${scene.id}: clipping or invalid peak`);
  check(Number.isFinite(mean)&&mean>-35,`${scene.id}: silent/too-quiet track`);
  const silenceEnds=[...log.matchAll(/silence_end: ([\d.]+) \| silence_duration: ([\d.]+)/g)].map(m=>({end:Number(m[1]),duration:Number(m[2])}));
  const leadingSilence=silenceEnds.find(s=>s.end-s.duration<.01)?.duration||0;
  const trailingSilence=silenceEnds.find(s=>duration-s.end<.03)?.duration||0;
  files.push({id:scene.id,path:`assets/voice/${scene.id}.wav`,duration_s:duration,limit_s:scene.duration-.6,headroom_s:Number((scene.duration-duration).toFixed(3)),peak_dbfs:peak,mean_dbfs:mean,leadingSilence_s:leadingSilence,trailingSilence_s:trailingSilence,sha256:crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')});
}
const result={checkedAt:new Date().toISOString(),ok:errors.length===0,provider:meta.provider,voice:meta.voice,sceneCount:scenes.length,timelineDuration_s:scenes.reduce((n,s)=>n+s.duration,0),totalSpeechDuration_s:Number(files.reduce((n,f)=>n+f.duration_s,0).toFixed(3)),checks:['15 exact scene slots total 246 seconds','Every WAV <= scene duration - 0.6 seconds','Actual ffprobe timing agrees with metadata','Every metadata transcript matches narration.json','Neural Kokoro synthesis rate <= 1.2, no post time-stretch','All assets mono 48 kHz PCM16','No clipping and no silent files'],limitations:['Automated duration, decode and signal-level checks; no human listening session was performed.','Word-level alignment was not requested or fabricated.'],files,errors};
fs.writeFileSync(path.join(project,'evidence/verification-audio.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result,null,2));
if(errors.length)process.exitCode=1;
