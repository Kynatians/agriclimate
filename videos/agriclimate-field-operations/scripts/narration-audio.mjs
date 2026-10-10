#!/usr/bin/env node
/** Generate the film's narration with local HyperFrames/Kokoro. No cloud calls. */
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const project = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const scenes = JSON.parse(fs.readFileSync(path.join(project, 'narration.json'), 'utf8'));
const python = process.env.HYPERFRAMES_PYTHON || '/tmp/agriclimate-kokoro-venv/bin/python';
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'agriclimate-narration-'));
const voice = 'af_heart';
const auth = fs.readFileSync(path.join(project, 'evidence/verification-auth.txt'), 'utf8').trim();
const request = {
  provider: 'kokoro',
  runtime: 'HyperFrames CLI 0.8.102 / kokoro-onnx 0.6.1',
  model: 'Kokoro-82M / kokoro-v1.0.onnx',
  voice,
  lang: 'en-us',
  speed: 1.12,
  localOnly: true,
  paidCallsAllowed: false,
  style: 'Warm, clear, informative English; restrained field-operations delivery.',
  timing: 'Each file must measure <= scene duration minus 0.6 seconds. Prefer script trimming to synthesis speeds above 1.2. No post-generation time stretching.',
  bgm: { mode: 'none' },
  lines: scenes.map(s => ({...s, output: `assets/voice/${s.id}.wav`})),
  authStatusVerbatim: auth,
};
fs.writeFileSync(path.join(project, 'audio_request.json'), JSON.stringify(request, null, 2) + '\n');
const meta = {
  generatedAt: new Date().toISOString(),
  provider: 'kokoro',
  engine: 'Local Kokoro-82M via HyperFrames CLI',
  voice,
  lang: 'en-us',
  paidCalls: 0,
  networkUse: 'Model/voice downloads during local setup only; synthesis runs on-device.',
  authStatusVerbatim: auth,
  voices: [],
  bgm: null,
  sfx: [],
  scene_duration_s: scenes.reduce((n,s) => n+s.duration, 0),
  total_duration_s: 0,
  timingMethod: 'Actual ffprobe WAV duration. No fabricated word timestamps; scene-level narration only.',
  suggestedSceneOffset_s: 0.3,
  pacingNote: 'Technical lines were tightened to actual neural synthesis timing rather than exceeding 1.2x. Some scenes are below the nominal 165–180 whitespace-word budget; numbers, compounds, and spoken initialisms make that count approximate.',
  processing: 'Kokoro synthesis; ffmpeg loudnorm I=-18 LUFS, TP=-2 dBTP, LRA=7; mono 48 kHz 16-bit PCM. No atempo or silence padding.',
  correctionNotes: scenes.map(({id, corrections}) => ({id, corrections})),
  anomalies: [],
};
function run(cmd, args, extra = {}) {
  const r = spawnSync(cmd, args, {encoding:'utf8', maxBuffer:16*1024*1024, ...extra});
  if(r.status !== 0) throw new Error(`${cmd} exited ${r.status}: ${r.stderr}\n${r.stdout}`);
  return r.stdout;
}
function probe(file) {
  return JSON.parse(run('ffprobe', ['-v','error','-show_entries','format=duration:stream=sample_rate,channels,codec_name','-of','json',file]));
}
function save() {
  meta.total_duration_s = Number(meta.voices.reduce((n,v)=>n+v.duration_s,0).toFixed(3));
  fs.writeFileSync(path.join(project, 'audio_meta.json'), JSON.stringify(meta,null,2)+'\n');
}
fs.mkdirSync(path.join(project,'assets/voice'), {recursive:true});
const selected = process.env.NARRATION_SCENES?.split(',');
if (selected && fs.existsSync(path.join(project, 'audio_meta.json'))) {
  const previous = JSON.parse(fs.readFileSync(path.join(project, 'audio_meta.json'),'utf8'));
  meta.voices = previous.voices.filter(v => !selected.includes(v.id));
}
try {
  for (const scene of scenes.filter(s => !selected || selected.includes(s.id))) {
    const spokenText = scene.text.replaceAll('Next.js','Next J S').replaceAll('AgriClimate','Agri Climate').replaceAll('MapLibre','Map Libre').replaceAll('VIIRS','veers').replaceAll('SMS','S M S').replaceAll('API','A P I').replaceAll('SVG','S V G').replaceAll('WebGL','Web G L');
    const raw = path.join(temp, `${scene.id}-raw.wav`);
    let speed = request.speed;
    let synthesis;
    const attempts = [];
    for (let attempt=0; attempt<3; attempt++) {
      console.log(`Generating ${scene.id}, ${voice}, speed ${speed}`);
      const result = run('hyperframes',['tts',spokenText,'--voice',voice,'--lang','en-us','--speed',String(speed),'--output',raw,'--json'],{env:{...process.env,HYPERFRAMES_PYTHON:python,OMP_NUM_THREADS:'2'}});
      synthesis = JSON.parse(result.trim().split('\n').at(-1));
      const duration = Number(probe(raw).format.duration);
      attempts.push({speed,duration_s:duration});
      if(duration <= scene.duration-0.65) break;
      const next = Math.ceil(speed * duration/(scene.duration-0.85)*100)/100;
      if (speed >= 1.2) break;
      speed=Math.min(1.2,next);
    }
    const dest = path.join(project,'assets/voice',`${scene.id}.wav`);
    run('ffmpeg',['-hide_banner','-loglevel','error','-y','-i',raw,'-af','loudnorm=I=-18:TP=-2:LRA=7','-ar','48000','-ac','1','-c:a','pcm_s16le',dest]);
    const p = probe(dest);
    const duration = Number(p.format.duration);
    if(duration > scene.duration-.6) {
      const message=`${scene.id} requires script tightening: ${duration}s at ${speed}; limit ${scene.duration-.6}s`;
      meta.anomalies.push(message);
      console.error(message);
    }
    meta.voices.push({
      id:scene.id,path:`assets/voice/${scene.id}.wav`,duration_s:duration,scene_duration_s:scene.duration,
      headroom_s:Number((scene.duration-duration).toFixed(3)),provider:'kokoro',voice,lang:'en-us',speed,
      text:scene.text,spokenText,wordCount:scene.text.split(/\s+/).length,
      measuredWordsPerMinute:Number((scene.text.split(/\s+/).length/duration*60).toFixed(1)),
      sampleRate:Number(p.streams[0].sample_rate),channels:p.streams[0].channels,codec:p.streams[0].codec_name,
      synthesisAttempts:attempts,synthesisResult:synthesis,corrections:scene.corrections,
    });
    save();
    console.log(`${duration <= scene.duration-.6 ? 'Validated' : 'Timing revision required for'} ${scene.id}: ${duration.toFixed(3)}s / ${scene.duration}s scene`);
  }
  meta.voices.sort((a,b) => a.id.localeCompare(b.id));
  meta.complete=meta.voices.length===scenes.length && meta.anomalies.length===0;
  if (!meta.complete) process.exitCode=1;
  save();
  console.log(`${meta.complete ? 'Complete' : 'Needs timing revisions'}: ${meta.voices.length} files; ${meta.total_duration_s}s speech in ${meta.scene_duration_s}s film.`);
} catch (error) {
  meta.complete=false;
  meta.anomalies.push(String(error));
  save();
  console.error(error);
  process.exitCode=1;
} finally {
  fs.rmSync(temp,{recursive:true,force:true});
}
