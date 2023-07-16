<template>
  <v-app>
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script>
import { onBeforeMount } from "vue";
import { getAuth } from "firebase/auth";
import { useRoute, useRouter } from "vue2-helpers/vue-router";

export default {
  name: "App",
  setup() {
    const auth = getAuth();
    const route = useRoute();
    const router = useRouter();

    onBeforeMount(() => {
      auth.onAuthStateChanged((user) => {
        if (!user) {
          router.replace("/login");
        } else if (route.path == "/login" || route.path == "/register") {
          router.replace("/");
        }
      });
    });
  },
  data: () => ({
    //
  }),
};
</script>
