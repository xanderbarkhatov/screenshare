<script setup lang="ts">
import {
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
} from "@heroicons/vue/24/outline";
import { v4 as uuid } from "uuid";
import { createPeer } from "~~/peer";

const route = useRoute();
const supabase = useSupabaseClient();

const id = uuid();

supabase.channel(String(route.params.id)).subscribe().track({ id });

const peer = createPeer();

const channel = supabase.channel(id).subscribe();

channel.on("broadcast", { event: "offer" }, ({ data }) => {
  peer.signal(data);
});

peer.on("signal", async (data) => {
  await channel.send({ type: "broadcast", event: "answer", data });
});

const videoRef = ref<HTMLVideoElement>();

const { muted } = useMediaControls(videoRef);

const toggleSound = useToggle(muted);

const { isFullscreen, toggle: toggleFullscreen } = useFullscreen();

peer.on("stream", (s) => {
  if (!videoRef.value) return;
  videoRef.value.srcObject = s;
});

onUnmounted(() => {
  supabase.removeAllChannels();
  peer.destroy();
});
</script>

<template>
  <div class="flex h-full items-center justify-center bg-black">
    <div class="relative aspect-video max-h-screen w-full">
      <video ref="videoRef" class="h-full w-full" autoplay muted />

      <div
        class="group absolute inset-x-0 bottom-0 flex justify-center overflow-hidden pb-8"
      >
        <div
          class="flex translate-y-full items-center justify-center rounded-lg bg-base-100/40 opacity-0 transition-all group-hover:translate-y-0 group-hover:opacity-100"
        >
          <button class="p-4" @click="toggleSound()">
            <SpeakerXMarkIcon v-if="muted" class="h-6 w-6" />
            <SpeakerWaveIcon v-else class="h-6 w-6" />
          </button>
          <button class="p-4" @click="toggleFullscreen()">
            <ArrowsPointingInIcon v-if="isFullscreen" class="h-6 w-6" />
            <ArrowsPointingOutIcon v-else class="h-6 w-6" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
