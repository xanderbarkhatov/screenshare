// @ts-ignore
import SimplePeerMin from "simple-peer/simplepeer.min.js";
import type { SignalData, Instance, SimplePeer, Options } from "simple-peer";

type Peer = Instance;

const SimplePeer = SimplePeerMin as SimplePeer;

export { SignalData, Peer };

export function createPeer(options: Options = {}) {
  return new SimplePeer({
    ...options,
    config: {
      iceServers: [
        {
          urls: "stun:openrelay.metered.ca:80",
        },
        {
          urls: "turn:openrelay.metered.ca:80",
          username: "openrelayproject",
          credential: "openrelayproject",
        },
        {
          urls: "turn:openrelay.metered.ca:443",
          username: "openrelayproject",
          credential: "openrelayproject",
        },
        {
          urls: "turn:openrelay.metered.ca:443?transport=tcp",
          username: "openrelayproject",
          credential: "openrelayproject",
        },
      ],
    },
  }) as Peer;
}
