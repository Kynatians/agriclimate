from pathlib import Path
from PIL import Image,ImageDraw
import json,subprocess,hashlib,tempfile
P=Path(__file__).resolve().parent;video=P.parent/'agriclimate-28s-silent-final.mp4'
probe=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_streams','-show_format','-of','json',str(video)]))
(P/'final-probe.json').write_text(json.dumps(probe,indent=2))
streams=probe['streams']; vs=[s for s in streams if s['codec_type']=='video']; aud=[s for s in streams if s['codec_type']=='audio']
assert len(vs)==1 and not aud, 'Export must contain video only; no audio stream.'
assert (vs[0]['width'],vs[0]['height'])==(1920,1080)
assert vs[0]['r_frame_rate']=='30/1' and int(vs[0]['nb_frames'])==840
assert abs(float(probe['format']['duration'])-28)<.001
subprocess.run(['ffmpeg','-v','error','-i',str(video),'-f','null','-'],check=True)
times=[.3,1.7,4.6,7.6,11.3,15.6,19.8,22.6,27.2]
sheet=Image.new('RGB',(1440,900),'#142319');draw=ImageDraw.Draw(sheet)
with tempfile.TemporaryDirectory(prefix='agriclimate-final-qc-') as tmp:
 for i,t in enumerate(times):
  f=Path(tmp)/f'{i}.png'
  subprocess.run(['ffmpeg','-v','error','-y','-ss',str(t),'-i',str(video),'-frames:v','1',str(f)],check=True)
  im=Image.open(f).convert('RGB');im.thumbnail((480,270));x=(i%3)*480;y=(i//3)*300
  draw.text((x+12,y+9),f'ACTUAL MP4 / {t:.1f}s',fill='#d8f78b');sheet.paste(im,(x,y+30))
  if t==1.7:Image.open(f).save(P.parent/'agriclimate-28s-silent-poster.png')
sheet.save(P.parent/'agriclimate-28s-silent-contact-sheet.jpg',quality=93)
report={'file':video.name,'durationSeconds':28,'resolution':[1920,1080],'fps':30,'frames':840,'audioStreams':0,'fullyDecoded':True,'bytes':video.stat().st_size,'sha256':hashlib.sha256(video.read_bytes()).hexdigest(),'inspectedFrameTimes':times,'contactSheet':'../agriclimate-28s-silent-contact-sheet.jpg'}
(P/'delivery-verification.json').write_text(json.dumps(report,indent=2));print(json.dumps(report,indent=2))
