"""Original, deterministic instrumental bed. No sampled or licensed music.
80 BPM; Dm9 / Bbmaj7 / Fmaj7 / Cadd9. Soft additive keys and restrained pad.
"""
from pathlib import Path
import numpy as np
import wave
SR=48000
DURATION=246
out=Path(__file__).resolve().parents[1]/'assets/audio'
out.mkdir(parents=True,exist_ok=True)
audio=np.zeros((SR*DURATION,2),dtype=np.float32)

def hz(m): return 440*2**((m-69)/12)
def add(start,dur,notes,amp,pad=False,pan=0):
    n=min(int(dur*SR),len(audio)-int(start*SR))
    if n<=0:return
    t=np.arange(n,dtype=np.float32)/SR
    if pad: env=(1-np.exp(-t/1.1))*np.minimum(1,np.maximum(0,(dur-t)/1.8))*.6
    else: env=(1-np.exp(-t/.012))*np.exp(-t/1.3)*np.minimum(1,np.maximum(0,(dur-t)/.3))
    sig=np.zeros((n,2),dtype=np.float32)
    for j,m in enumerate(notes):
        f=hz(m)
        for ch in range(2):
            detune=1+(-1 if ch==0 else 1)*.0007
            phase=j*.39
            wavelet=np.sin(2*np.pi*f*detune*t+phase)+.23*np.sin(2*np.pi*f*2*t+phase)+.06*np.sin(2*np.pi*f*3*t)
            sig[:,ch]+=wavelet*env/len(notes)
    sig[:,0]*=(1-pan*.4); sig[:,1]*=(1+pan*.4)
    at=int(start*SR); audio[at:at+n]+=sig*amp
chords=[[50,57,60,64,69],[46,53,57,62,65],[41,53,57,60,64],[48,55,60,62,67]]
for bar in range(41):
    start=bar*6
    chord=chords[bar%4]
    add(start,8.8,chord,.055,pad=True)
    if bar>1:
        for beat,note in [(0,chord[2]+12),(2.25,chord[3]+12),(4.5,chord[4])]:
            add(start+beat,3.3,[note],.026,pan=(-.4 if beat==0 else .4))
# Tiny, delayed harmonics create width without voice-like mids.
for delay,level in [(.19,.12),(.37,.06)]:
    n=int(delay*SR); audio[n:]+=audio[:-n,::-1]*level
# Identity moments: dispatch handoff and final cadence only.
t=np.arange(len(audio))/SR
swells=1+.35*np.exp(-((t-89)/3.0)**2)+.65*np.exp(-((t-240)/4.0)**2)
env=np.minimum(1,t/2)*np.minimum(1,(DURATION-t)/3.5)
# Full moment of space after the farmer notification.
quiet=np.ones(len(audio)); quiet[(t>=92.15)&(t<93.0)]=.08
for lo,hi in [(91.9,92.15),(93,93.6)]:
    mask=(t>=lo)&(t<hi); quiet[mask]=np.linspace(1,.08,mask.sum()) if lo<92 else np.linspace(.08,1,mask.sum())
audio*= (swells*env*quiet)[:,None]
audio=np.clip(audio,-.9,.9)
with wave.open(str(out/'field-operations-bed.wav'),'wb') as f:
    f.setnchannels(2); f.setsampwidth(2); f.setframerate(SR); f.writeframes((audio*32767).astype('<i2').tobytes())
print(out/'field-operations-bed.wav')
