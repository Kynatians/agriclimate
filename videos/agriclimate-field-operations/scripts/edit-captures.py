"""Editorial trims of the real browser recordings. Never draw replacement UI.
Preserves raw clips and records every derived source window in edit-decision-list.json.
"""
from pathlib import Path
import subprocess,json
P=Path(__file__).resolve().parents[1]; R=P.parents[1]
manifest=json.loads((R/'evidence/captures.json').read_text())
clips={c['id']:c for c in manifest['clips']}
OUT=P/'assets/edits';OUT.mkdir(exist_ok=True)
EDL=[]; media={}

def probe(p):
 return float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',str(p)]))
def source(id):
 c=clips[id];return R/c['file']
def render(id,src,start,length,target,width=None,height=None,crop=None):
 output=OUT/(id+'.mp4')
 length=min(length,max(.1,probe(src)-start))
 # User's workflow is compressed; optical content is untouched, only source time edited.
 speed=max(1,length/target)
 vf=[]
 if crop:vf.append('crop='+crop)
 vf += [f'trim=duration={length:.6f}',f'setpts=(PTS-STARTPTS)/{speed:.8f}','fps=30']
 if width and height:vf += [f'scale={width}:{height}:force_original_aspect_ratio=decrease',f'pad={width}:{height}:(ow-iw)/2:(oh-ih)/2:color=0xedf2e9']
 vf += [f'tpad=stop_mode=clone:stop_duration={target}', 'format=yuv420p']
 cmd=['ffmpeg','-y','-hide_banner','-loglevel','error','-ss',str(start),'-i',str(src),'-t',str(target),'-an','-vf',','.join(vf),'-c:v','libx264','-preset','fast','-crf','18','-threads','2','-movflags','+faststart',str(output)]
 subprocess.run(cmd,check=True)
 EDL.append({'output':str(output.relative_to(P)),'source':str(src.relative_to(R)),'sourceStart':start,'sourceDuration':length,'targetDuration':target,'rate':speed,'crop':crop,'note':'Final source frame held only when source shorter than slot.'})
 return str(output.relative_to(P))
def full(scene,id,target,start=0,length=None):
 src=source(id);length=length or (probe(src)-start)
 path=render(f'scene-{scene:02}',src,start,length,target)
 media[f'{scene:02}']={'main':{'path':path}}
def concat(id,paths):
 f=OUT/(id+'-concat.txt');f.write_text('\n'.join("file '"+str(P/p)+"'" for p in paths))
 out=OUT/(id+'.mp4')
 subprocess.run(['ffmpeg','-y','-hide_banner','-loglevel','error','-f','concat','-safe','0','-i',str(f),'-c','copy','-movflags','+faststart',str(out)],check=True)
 return str(out.relative_to(P))
def segment(scene,id,windows,targetW=None,targetH=None):
 paths=[render(f's{scene:02}-part-{k:02}',source(id),s,l,t,targetW,targetH,crop) for k,(s,l,t,crop) in enumerate(windows)]
 media[f'{scene:02}']={'main':{'path':concat(f'scene-{scene:02}',paths)}}
# Capture ID fallbacks to later successful pickup, without using a failed take.
def choose(prefix):
 found=[c for c in manifest['clips'] if c['id'].startswith(prefix) and c.get('status')=='captured' and c.get('file')]
 if not found: raise RuntimeError('No successful capture: '+prefix)
 return found[-1]['id']
full(1,choose('01-'),14)
full(2,choose('02-'),12,length=7.3)
media['02']['phone']={'path':'assets/captures/07-farmer-home-bengali.png'}
full(3,choose('03-'),16)
layer_id=choose('04-'); layer=clips[layer_id]
layer_windows=[(max(0,r['startSeconds']-.12),2.0,2.0,None) for r in layer['usefulRanges'] if r['description'].startswith('Layer ')]
layer_windows.append((layer['durationSeconds']-4,4,4,None))
assert len(layer_windows)==8
segment(4,layer_id,layer_windows)
# Successful pickup includes the genuine cached fire beacon and tactical overlay.
full(5,'05-cached-fire-overlay',14,start=3.0)
full(6,choose('06-'),18,start=12.0)
full(7,choose('07-'),16)
full(8,choose('08-'),18)
full(9,'09-crop-recommendations',20,start=3.0)
# Round trip: source windows set after reviewing the capture action ledger.
loop=P/'loop-edit.json'
if loop.exists():
 paths=[]
 for k,row in enumerate(json.loads(loop.read_text())):
  paths.append(render(f's10-part-{k:02}',source(row['clip']),row['start'],row['length'],row['target'],1180,744,row.get('crop')))
 media['10']={'main':{'path':concat('scene-10',paths)}}
else:
 full(10,choose('10b-'),22)
full(11,'11-irrigation-modal',14,start=2.6)
full(14,choose('14-'),14)
# Actual mobile UI at the close (not a fabricated fresh installation).
media['15']={'main':{'path':'assets/captures/08-mobile-home.png'}}
(P/'scene-media.json').write_text(json.dumps(media,indent=2))
(P/'evidence/edit-decision-list.json').write_text(json.dumps(EDL,indent=2))
print('Edited clips ready:',len(media),'scene mappings')
