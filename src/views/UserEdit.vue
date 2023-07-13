<template>
  <div>
    <div>
      <div>
        <div>
          <h2>Editar Usuário</h2>
          <form @submit.prevent="updateUser">
            <div>
              <input
                type="text"
                placeholder="Nome"
                v-model="userInfo.name"
              />
            </div>
            <div>
              <input
                type="text"
                placeholder="Email"
                v-model="userInfo.email"
              />
            </div>
            <div>
              <input
                type="password"
                placeholder="Senha"
                v-model="userInfo.password"
              />
            </div>
            <button>Confirmar edição</button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import usersColRef from "../db/index.js";
import { getDoc, doc, setDoc } from "firebase/firestore";
export default {
  data() {
    return {
      selectedUser: {},
      userId: null,
      docRef: null,
      userInfo: {
        name: null,
        email: null,
        password: null,
      },
    };
  },

  methods: {
    async getUser() {
      let userRef = doc(usersColRef, this.userId);
      this.docRef = userRef;
      let user = await getDoc(this.docRef);
      let userData = user.data();
      this.userInfo.name = userData.name;
      this.userInfo.email = userData.email;
      this.userInfo.password = userData.password;
    },
    async updateUser() {
      await setDoc(this.docRef, this.userInfo);
      alert(
        `O usuário com ID ${this.userId} foi alterado com sucesso!`
      );
      this.$router.push("/");
    },
  },

  created() {
    let userId = this.$route.params.userId;
    this.userId = userId;
    this.getUser();
  },
};
</script>

<style>
</style>