<template>
  <v-menu bottom left>
    <template v-slot:activator="{ on, attrs }">
      <v-btn dark icon v-bind="attrs" v-on="on">
        <v-icon>mdi mdi-menu</v-icon>
      </v-btn>
    </template>
    <v-list>
      <v-list-item>
        <v-btn dark normal text color="#694EDF" @click="logout">
          Sair
        </v-btn>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script>
import { signOut } from "firebase/auth";

export default {
  methods: {
    logout() {
      signOut(auth)
        .then(() => {})
        .catch((err) => alert(err.message));
    },
  },
};
</script>
