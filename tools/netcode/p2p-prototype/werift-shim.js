// Node WebRTC shim: expose werift's pure-TS WebRTC as globals so PeerJS
// (which is browser-only upstream and checks for global RTCPeerConnection)
// can run in Node. Require this file BEFORE requiring 'peerjs'.
const werift = require('werift');

if (typeof globalThis.RTCPeerConnection === 'undefined') {
  globalThis.RTCPeerConnection = werift.RTCPeerConnection;
}
if (typeof globalThis.RTCSessionDescription === 'undefined') {
  globalThis.RTCSessionDescription = werift.RTCSessionDescription;
}
if (typeof globalThis.RTCIceCandidate === 'undefined') {
  globalThis.RTCIceCandidate = werift.RTCIceCandidate;
}
// PeerJS checks RTCDataChannel in some paths; werift's exists.
if (typeof globalThis.RTCDataChannel === 'undefined' && werift.RTCDataChannel) {
  globalThis.RTCDataChannel = werift.RTCDataChannel;
}
module.exports = werift;
