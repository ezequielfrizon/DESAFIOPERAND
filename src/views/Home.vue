<template>
  <v-data-table
    :headers="headers"
    :items="users"
    sort-by="name"
    class="elevation-1"
  >
    <template v-slot:top>
      <v-toolbar flat>
        <v-toolbar-title>CRUD de usuários</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-dialog v-model="dialog" max-width="500px">
          <template v-slot:activator="{ on, attrs }">
            <v-btn color="primary" dark class="mb-2" v-bind="attrs" v-on="on">
              Adicionar Usuário
            </v-btn>
          </template>
          <v-form ref="form" @submit.prevent="save">
            <v-card ref="form">
              <v-card-title>
                <span class="text-h4">{{
                  editedIndex === -1 ? "Adicionar Usuário" : "Editar Usuário"
                }}</span>
              </v-card-title>
              <v-divider></v-divider>
              <v-card-text>
                <v-container>
                  <v-row justify="center">
                    <v-col cols="12">
                      <v-text-field
                        v-model="editedItem.name"
                        ref="name"
                        :rules="[rulesName.required, rulesName.min]"
                        label="Nome Completo"
                        hint="Mínimo 6 caracteres"
                        counter
                        clearable
                        outlined
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12">
                      <v-text-field
                        v-model="editedItem.email"
                        :rules="[rulesEmail.required, rulesEmail.correct]"
                        ref="email"
                        label="Email"
                        counter
                        clearable
                        outlined
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12">
                      <v-text-field
                        v-model="editedItem.password"
                        :append-icon="show ? 'mdi-eye' : 'mdi-eye-off'"
                        :rules="[rulesPassword.required, rulesPassword.min]"
                        :type="show ? 'text' : 'password'"
                        ref="password"
                        label="Senha"
                        hint="Mínimo 8 caracteres"
                        counter
                        clearable
                        outlined
                        @click:append="show = !show"
                      ></v-text-field>
                    </v-col>
                  </v-row>
                </v-container>
              </v-card-text>
              <v-card-actions>
                <v-btn color="blue darken-1" text @click="close()">
                  Cancelar
                </v-btn>
                <v-btn color="blue darken-1" type="submit" text> Salvar </v-btn>
              </v-card-actions>
            </v-card>
          </v-form>
        </v-dialog>
        <v-dialog v-model="dialogDelete" max-width="500px">
          <v-card>
            <v-card-title>
              <span class="text-h4">
                Tem certeza que deseja deletar o usuário {{ editedItem.name }}?
              </span>
            </v-card-title>
            <v-divider></v-divider>
            <v-card-actions>
              <v-btn color="blue darken-1" text @click="closeDelete()"
                >Cancelar exclusão</v-btn
              >
              <v-btn color="blue darken-1" text @click="deleteUser()"
                >Excluir</v-btn
              >
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-toolbar>
    </template>
    <template v-slot:item.actions="{ item }">
      <v-icon small class="mr-2" @click="editItem(item)"> mdi-pencil </v-icon>
      <v-icon small @click="deleteItem(item)"> mdi-delete </v-icon>
    </template>
  </v-data-table>
</template>

<style>
.v-card__title {
  text-align: center;
  justify-content: center;
}
.text-h4 {
  word-break: normal;
}
</style>

<script>
import {
  doc,
  addDoc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
} from "firebase/firestore";
import usersColRef from "../db/index.js";

export default {
  name: "Home",
  components: {},
  data: () => ({
    users: [],
    userId: null,
    docRef: null,
    dialog: false,
    selectedDoc: null,
    dialogDelete: false,
    formHasErrors: false,
    show: false,
    rulesName: {
      required: (value) => !!value || "Nome é obrigatório.",
      min: (v) => v.length >= 6 || "Mínimo 6 caracteres",
    },
    rulesPassword: {
      required: (value) => !!value || "Senha é obrigatória.",
      min: (v) => v.length >= 8 || "Mínimo 8 caracteres",
      emailMatch: () => "The email and password you entered don't match",
    },
    rulesEmail: {
      required: (value) => !!value || "Email é obrigatório.",
      correct: (v) => /.+@.+\..+/.test(v) || "E-mail inválido",
    },
    headers: [
      {
        text: "Nome",
        value: "name",
        align: "start",
      },
      {
        text: "Email",
        value: "email",
        sortable: false,
      },
      {
        align: "end",
        sortable: false,
        text: "Actions",
        value: "actions",
      },
    ],
    userInfo: {
      name: null,
      email: null,
      password: null,
    },
    editedIndex: -1,
    editedItem: {
      name: "",
      email: "",
      password: "",
    },
    defaultItem: {
      name: "",
      email: "",
      password: "",
    },
    computed: {
      form() {
        return {
          name: this.name,
          email: this.email,
          password: this.password,
        };
      },
    },
    watch: {
      dialog(val) {
        val || this.close();
      },
      dialogDelete(val) {
        val || this.closeDelete();
      },
    },

    deleteItem(item) {
      this.dialogDelete = true;
      this.editedItem = Object.assign({}, item);
      this.editedIndex = this.users.indexOf(item);
    },

    close() {
      this.dialog = false;
      this.$nextTick(() => {
        this.editedIndex = -1;
        this.editedItem = Object.assign({}, this.defaultItem);
      });
    },

    closeDelete() {
      this.dialogDelete = false;
      this.$nextTick(() => {
        this.editedIndex = -1;
        this.editedItem = Object.assign({}, this.defaultItem);
      });
    },
  }),

  created() {
    this.fetchUsers();
  },

  methods: {
    async fetchUsers() {
      let users = [];
      let usersSnapShot = await getDocs(usersColRef);
      usersSnapShot.forEach((user) => {
        let userData = user.data();
        userData.id = user.id;
        users.push(userData);
      });
      this.users = users;
    },
    async editItem(item) {
      this.editedIndex = this.users.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialog = true;
      let userRef = doc(usersColRef, item.id);
      this.docRef = userRef;
      let user = await getDoc(this.docRef);
      let userData = user.data();
      this.userInfo.name = userData.name;
      this.userInfo.email = userData.email;
      this.userInfo.password = userData.password;
    },
    async deleteUser() {
      let userRef = doc(usersColRef, this.editedItem.id);
      await deleteDoc(userRef);
      this.fetchUsers();
      this.closeDelete();
    },
    async save() {
      if (this.$refs.form.validate()) {
        if (this.editedIndex > -1) {
          await setDoc(this.docRef, this.editedItem);
        } else {
          addDoc(usersColRef, this.editedItem);
        }
        this.close();
        this.fetchUsers();
      }
    },
  },
};
</script>
