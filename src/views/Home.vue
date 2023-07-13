<template>
  <div>
    <h2>Usuários</h2>
    <div>
      <div>
        <div>
          <ul>
            <li v-for="user in users" :key="user.id">
              {{ user.name }}
              <span>
                <router-link :to="{ path: `/users/${user.id}` }"
                  >Editar</router-link
                >
                <a href="#" @click="deleteUser(user.id)">Deletar</a>
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import usersColRef from "../db/index.js";
import { getDocs, doc, deleteDoc } from "firebase/firestore";
export default {
  name: "Home",
  components: {},
  data() {
    return {
      users: [],
      selectedDoc: null,
    };
  },
  methods: {
    async fetchUsers() {
      let usersSnapShot = await getDocs(usersColRef);
      let users = [];
      usersSnapShot.forEach((user) => {
        let userData = user.data();
        userData.id = user.id;
        users.push(userData);
      });
      console.log(users);
      this.users = users;
    },
    async deleteUser(userId) {
      let userRef = doc(usersColRef, userId);
      await deleteDoc(userRef);
      alert("Usuário deletado com sucesso!");
      this.$router.go();
    },
  },

  created() {
    this.fetchUsers();
  },
};
</script>
