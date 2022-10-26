<script setup lang="ts">
import { useAutoAnimate } from "@formkit/auto-animate/vue";
import { ClipboardIcon, PlayIcon } from "@heroicons/vue/24/outline";
import { v4 as uuid } from "uuid";
import { Peer } from "~~/peer";
import type { PeerInstance } from "~~/peer";
import type { RealtimeChannel } from "@supabase/realtime-js";

const id = uuid();
const peers = new Map<string, PeerInstance>();
const channels = new Map<string, RealtimeChannel>();

const supabase = useSupabaseClient();
const location = useBrowserLocation();
const [container] = useAutoAnimate();
const clipboard = reactive(useClipboard({ copiedDuring: 1000 }));
const { stream, enabled, start } = useDisplayMedia({
  video: true,
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    sampleRate: 44100,
  },
});

const url = computed(() => `${location.value.origin}/watch/${id}`);

whenever(stream, (s) => {
  supabase
    .channel(id)
    .subscribe()
    .on("presence", { event: "join" }, ({ newPresences }) => {
      newPresences.forEach((p) => {
        const channel = supabase.channel(p.id).subscribe();
        const peer = new Peer({ initiator: true, stream: s });

        peer.on("signal", async (data) => {
          await channel.send({ type: "broadcast", event: "offer", data });
        });

        channel.on("broadcast", { event: "answer" }, ({ data }) => {
          peer.signal(data);
        });

        peers.set(p.id, peer);
        channels.set(p.id, channel);
      });
    })
    .on("presence", { event: "leave" }, ({ leftPresences }) => {
      leftPresences.forEach((p) => {
        peers.get(p.id)?.destroy();
        channels.get(p.id)?.unsubscribe();
      });
    });
});

onUnmounted(() => {
  supabase.removeAllChannels();
  Array.from(peers.values()).forEach((p) => {
    p.destroy();
  });
});
</script>

<template>
  <div ref="container" class="flex h-full items-center justify-center p-10">
    <button v-if="!enabled" class="btn-lg btn" @click="start()">
      <PlayIcon class="h-10 w-10" />
    </button>

    <div v-else class="input-group justify-center">
      <span class="leading-loose">{{ url }}</span>
      <div
        :data-tip="clipboard.copied ? 'Copied to clipboard' : 'Copy'"
        class="tooltip"
      >
        <button class="btn-square btn" @click="clipboard.copy(url)">
          <ClipboardIcon class="h-6 w-6" />
        </button>
      </div>
    </div>
  </div>
</template>
