// Diagnostic: two werift peers in one process, trickle ICE, full state logging.
const { RTCPeerConnection, RTCSessionDescription, RTCIceCandidate } = require('werift');

(async () => {
  const a = new RTCPeerConnection();
  const b = new RTCPeerConnection();
  for (const [n, pc] of [['A', a], ['B', b]]) {
    pc.iceConnectionStateChange.subscribe((s) => console.log(`[${n}] iceConnectionState=${s}`));
    pc.connectionStateChange.subscribe((s) => console.log(`[${n}] connectionState=${s}`));
    pc.onIceCandidate.subscribe(async (c) => {
      console.log(`[${n}] candidate:`, c ? String(c.candidate).slice(0, 60) : '(end)');
      if (!c) return;
      const other = pc === a ? b : a;
      try { await other.addIceCandidate(new RTCIceCandidate(c.candidate, c.sdpMLineIndex)); }
      catch (e) { console.log(`[${n}] addIceCandidate err:`, e.message); }
    });
  }
  const dcA = a.createDataChannel('t');
  dcA.addEventListener('open', () => { console.log('[A] dc open, sending ping'); dcA.send('ping'); });
  b.onDataChannel.subscribe((dcB) => {
    console.log('[B] onDataChannel');
    dcB.addEventListener('open', () => console.log('[B] dc open'));
    dcB.onMessage.subscribe((m) => { console.log('[B] got:', m.data); process.exit(0); });
  });

  await a.setLocalDescription(await a.createOffer());
  await b.setRemoteDescription(new RTCSessionDescription(a.localDescription.sdp, a.localDescription.type));
  await b.setLocalDescription(await b.createAnswer());
  await a.setRemoteDescription(new RTCSessionDescription(b.localDescription.sdp, b.localDescription.type));
  console.log('SDP exchanged');
  setTimeout(() => { console.log('TIMEOUT — states:', a.iceConnectionState, b.iceConnectionState); process.exit(2); }, 25000).unref();
})().catch((e) => { console.error('FATAL', e); process.exit(1); });
