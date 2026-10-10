from pathlib import Path
from PIL import Image
import json,shutil,subprocess
P=Path(__file__).resolve().parent; OLD=P.parent; R=OLD.parents[1]
A=P/'assets';(A/'fonts').mkdir(parents=True,exist_ok=True)
for f in (OLD/'assets/fonts').iterdir():shutil.copy2(f,A/'fonts'/f.name)
shutil.copy2(OLD/'assets/gsap.min.js',A/'gsap.min.js')
ledger=[]
def img(name,source,crop=None):
 im=Image.open(OLD/'assets/captures'/source).convert('RGB')
 if crop:im=im.crop(crop)
 im.save(A/(name+'.jpg'),quality=95)
 ledger.append({'asset':name+'.jpg','source':'../assets/captures/'+source,'crop':crop,'treatment':'none'})
img('officer','03-chilmari-officer.png',(0,56,1920,1080))
img('farmer','07-farmer-home-bengali.png')
img('alert-bn','07-new-alert-bengali.png')
img('alert-en','07-new-alert-english.png')
img('composer','06-rowmari-composer.png',(650,230,1270,850))
img('soil','08-desktop-daily-cards.png',(192,353,688,867))
img('weather','08-desktop-daily-cards.png',(712,353,1208,867))
img('growth','08-desktop-daily-cards.png',(1232,353,1728,867))
img('crop','09-crop-modal.png')
img('crop-detail','09-desktop-crop-detail.png',(480,200,1440,950))
img('request','10a-pump-form.png')
img('review','10b-officer-review-note.png',(610,190,1310,890))
img('approved','10c-farmer-approved.png')
img('irrigation','11-irrigation-modal.png')
img('fire','05-fire-tactical-overlay.png',(340,56,1560,1080))
# Short source windows only, no audio. UI capture untouched other than editorial trim/retime.
def vid(name,source,start,duration,outduration,crop=None):
 vf=[f'trim=duration={duration}',f'setpts=(PTS-STARTPTS)*{outduration/duration}', 'fps=30']
 if crop:vf.append('crop='+crop)
 subprocess.run(['ffmpeg','-y','-hide_banner','-loglevel','error','-ss',str(start),'-i',str(OLD/'assets/edits'/source),'-an','-vf',','.join(vf),'-t',str(outduration),'-c:v','libx264','-g','30','-keyint_min','30','-crf','17','-preset','fast','-threads','2','-pix_fmt','yuv420p','-movflags','+faststart',str(A/(name+'.mp4'))],check=True)
 ledger.append({'asset':name+'.mp4','source':'../assets/edits/'+source,'start':start,'sourceDuration':duration,'duration':outduration,'muted':True})
vid('map-live','scene-03.mp4',7,4,3,'1920:1024:0:56')
vid('layers','scene-04.mp4',0,18,3)
vid('compose-live','scene-06.mp4',5,6,4,'620:620:650:230')
vid('request-live','scene-10.mp4',.5,3.7,4,'344:744:418:0')
(A/'provenance.json').write_text(json.dumps(ledger,indent=2))
(P/'hyperframes.json').write_text(json.dumps({'$schema':'https://hyperframes.heygen.com/schema/hyperframes.json','authoringSkill':'general-video','media':{'autoProxy':True}},indent=2))
(P/'meta.json').write_text(json.dumps({'id':'agriclimate-silent-short','name':'AgriClimate — 28-second silent launch'},indent=2))
(P/'package.json').write_text(json.dumps({'private':True,'scripts':{'check':'npx hyperframes@0.8.114 check','dev':'npx hyperframes@0.8.114 preview','render':'npx hyperframes@0.8.114 render --quality delivery --workers 4 --output ../agriclimate-28s-silent-final.mp4'}},indent=2))
print('Prepared',len(ledger),'real media assets')
