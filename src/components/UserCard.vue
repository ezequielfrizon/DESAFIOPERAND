<template>
  <v-card>
    <v-card-title class="custom__card-title-menu">
      <span class="text-h5">Usuário logado: {{ userName }}</span>
      <v-spacer></v-spacer>
      <user-menu></user-menu>
    </v-card-title>
  </v-card>
</template>

<script>
import UserMenu from "./UserMenu.vue";

export default {
  components: {
    UserMenu,
  },
  props: {
    userName: {
      type: String,
      required: true,
    },
  },
};
</script>

<style scoped>
.custom__card-title-menu {
  color: #ffffff !important;
  background-color: #515151;
  border-radius: 0px !important;
}
</style>
