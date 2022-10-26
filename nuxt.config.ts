export default defineNuxtConfig({
  modules: ["@vueuse/nuxt", "@nuxtjs/tailwindcss", "@nuxtjs/supabase"],
  ssr: false,
  typescript: {
    strict: true,
  },
  supabase: {
    client: {
      realtime: {
        params: {
          eventsPerSecond: 10000,
        },
      },
    },
  },
});
