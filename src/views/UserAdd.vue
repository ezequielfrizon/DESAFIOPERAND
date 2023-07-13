<template>
  <div>
    <div>
      <div>
        <div>
          <h2>Adicionar Usuário</h2>
          <form @submit.prevent="createUser">
            <div>
              <input
                type="text"
                placeholder="Nome"
                v-model="name"
              />
            </div>
            <div>
              <input
                type="text"
                placeholder="Email"
                v-model="email"
              />
            </div>
            <div class="form-group">
              <input
                type="password"
                placeholder="Senha"
                v-model="password"
              />
            </div>
            <button>Adicionar</button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import usersColRef from "../db/index.js";
import { addDoc } from "firebase/firestore";
export default {
  data() {
    return {
      name: null,
      email: null,
      password: null,
    };
  },
  methods: {
    async createUser() {
      console.log("Criando usuário");
      const addedDoc = await addDoc(usersColRef, this.$data);
      alert("Usuário criado com sucesso!");
      console.log(addedDoc);
      this.$router.push("/");
    },
  },
};
</script>

<style>
</style>