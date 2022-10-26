// @ts-ignore
import SimplePeerMin from "simple-peer/simplepeer.min.js";
import type { SimplePeer, SignalData, Instance } from "simple-peer";

export const Peer = SimplePeerMin as SimplePeer;

export { SignalData, Instance as PeerInstance };
