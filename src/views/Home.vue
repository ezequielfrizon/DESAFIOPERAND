<template>
  <v-data-table
    :headers="headers"
    :items="users"
    :footer-props="{ 'items-per-page-text': 'Usuários por página' }"
    sort-by="name"
  >
    <template v-slot:top>
      <v-row class="custom__v-row-menu">
        <v-col class="custom__v-col-menu">
          <v-card>
            <v-card-title class="custom__card-title-menu">
              <span class="text-h5">Usuário logado: {{ userName }}</span>
              <v-spacer></v-spacer>
              <v-menu bottom left>
                <template v-slot:activator="{ on, attrs }">
                  <v-btn dark icon v-bind="attrs" v-on="on">
                    <v-icon>mdi mdi-menu</v-icon>
                  </v-btn>
                </template>
                <v-list>
                  <v-list-item>
                    <v-btn dark normal text color="#694EDF" @click="Logout">
                      Sair
                    </v-btn>
                  </v-list-item>
                </v-list>
              </v-menu>
            </v-card-title>
          </v-card>
        </v-col>
      </v-row>
      <v-toolbar flat>
        <v-toolbar-title>CRUD de usuários</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-dialog v-model="dialog" max-width="500px">
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              fab
              dark
              small
              v-on="on"
              depressed
              v-bind="attrs"
              color="#694EDF"
            >
              <v-icon dark> mdi-plus </v-icon>
            </v-btn>
          </template>
          <v-form ref="form" @submit.prevent="saveUser">
            <v-card ref="form">
              <v-card-title>
                <span class="text-h5">{{
                  editedIndex === -1 ? "Adicionar Usuário" : "Editar Usuário"
                }}</span>
              </v-card-title>
              <v-divider></v-divider>
              <v-card-text>
                <v-container>
                  <v-row justify="center">
                    <v-col class="custom__col" cols="12">
                      <v-text-field
                        v-model="editedItem.name"
                        ref="name"
                        :rules="[rulesName.required, rulesName.min]"
                        label="Nome"
                        hint="Mínimo 6 caracteres"
                        counter
                        clearable
                        filled
                      ></v-text-field>
                    </v-col>
                    <v-col class="custom__col" cols="12">
                      <v-text-field
                        v-model="editedItem.email"
                        :rules="[rulesEmail.required, rulesEmail.correct]"
                        ref="email"
                        label="Email"
                        counter
                        clearable
                        filled
                      ></v-text-field>
                    </v-col>
                    <v-col
                      v-if="editedIndex === -1"
                      class="custom__col"
                      cols="12"
                    >
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
                        filled
                        @click:append="show = !show"
                      ></v-text-field>
                    </v-col>
                  </v-row>
                </v-container>
              </v-card-text>
              <v-card-actions>
                <v-btn dark normal color="#595959" @click="close()">
                  Cancelar
                </v-btn>
                <v-btn dark normal type="submit" color="#694EDF">
                  Salvar
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-form>
        </v-dialog>
        <v-dialog v-model="dialogDelete" max-width="500px">
          <v-card>
            <v-card-title>
              <span class="text-h5"> Deletar Usuário </span>
            </v-card-title>
            <v-divider></v-divider>
            <v-card-text class="custom__card-text">
              Tem certeza que deseja deletar o usuário {{ editedItem.name }}?
            </v-card-text>
            <v-card-actions>
              <v-btn dark normal color="#595959" @click="closeDelete()"
                >Cancelar</v-btn
              >
              <v-btn dark normal color="#694EDF" @click="deleteUser()"
                >Excluir</v-btn
              >
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-toolbar>
    </template>
    <template v-slot:item.actions="{ item }">
      <v-icon small color="#959595" class="mr-2" @click="editUser(item)">
        mdi-pencil
      </v-icon>
      <v-icon small color="#E96C6C" @click="deleteItem(item)">
        mdi-delete
      </v-icon>
    </template>
  </v-data-table>
</template>

<script>
import { onAuthStateChanged } from "firebase/auth";
import {
  doc,
  addDoc,
  setDoc,
  getDoc,
  deleteDoc,
  getDocs as fetchDocs,
} from "firebase/firestore";
import {
  auth,
  firestore,
  usersColRef,
  updateProfile,
  createUserWithEmailAndPassword,
} from "@/firebase.js";

export default {
  setup() {
    const Logout = () => {
      auth
        .signOut()
        .then()
        .catch((err) => alert(err.message));
    };
    return {
      Logout,
    };
  },
  name: "Home",
  components: {},
  data: () => ({
    uid: "",
    users: [],
    show: false,
    docRef: null,
    userName: "",
    userRef: null,
    dialog: false,
    dialogDelete: false,
    rulesName: {
      required: (value) => !!value || "Nome é obrigatório.",
      min: (v) => v.length >= 6 || "Mínimo 6 caracteres",
    },
    rulesEmail: {
      required: (value) => !!value || "Email é obrigatório.",
      correct: (v) => /.+@.+\..+/.test(v) || "E-mail inválido",
    },
    rulesPassword: {
      required: (value) => !!value || "Senha é obrigatória.",
      min: (v) => v.length >= 8 || "Mínimo 8 caracteres",
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
    },
    editedIndex: -1,
    editedItem: {
      id: "",
      name: "",
      email: "",
    },
    defaultItem: {
      name: "",
      email: "",
    },
    computed: {
      form() {
        return {
          name: this.name,
          email: this.email,
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
      this.uid = item.uid;
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

  methods: {
    async fetchUsers() {
      const querySnapshot = await fetchDocs(usersColRef);
      this.users = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    },

    async editUser(item) {
      this.uid = item.uid;
      const userDocRef = doc(firestore, "users", item.id);
      this.userRef = userDocRef;
      getDoc(userDocRef)
        .then((docSnapshot) => {
          if (docSnapshot.exists()) {
            this.editedUser = {
              id: docSnapshot.id,
              ...docSnapshot.data(),
            };
          }
        })
        .catch((error) => {
          console.error("Erro ao obter os dados do usuário:", error);
        });
      this.editedIndex = this.users.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialog = true;
      const userRef = doc(usersColRef, item.id);
      this.docRef = userRef;
      const user = await getDoc(this.docRef);
      const userData = user.data();
      this.userInfo.name = userData.name;
      this.userInfo.email = userData.email;
    },

    async deleteUser() {
      const user = auth.currentUser;
      if (user) {
        user
          .delete()
          .then(() => {
            // Exclusão do usuário bem-sucedida
            // Exclua o documento do usuário do Firestore
            const userDocRef = doc(firestore, "users", user.uid);
            deleteDoc(userDocRef)
              .then(() => {
                // Exclusão do documento do usuário do Firestore bem-sucedida
              })
              .catch((error) => {
                console.error(
                  "Erro ao excluir o documento do usuário do Firestore:",
                  error
                );
              });
          })
          .catch((error) => {
            console.error("Erro ao excluir o usuário:", error);
          });
      }
      this.fetchUsers();
      this.closeDelete();
    },

    async saveUser() {
      if (this.$refs.form.validate()) {
        if (this.editedIndex > -1) {
          try {
            await setDoc(this.docRef, {
              name: this.editedItem.name,
              email: this.editedItem.email,
            });

            this.close();
            this.fetchUsers();
            this.closeDelete();
          } catch (error) {
            console.error("Erro ao atualizar o usuário:", error);
          }
        } else {
          await addDoc(usersColRef, this.editedItem);
          createUserWithEmailAndPassword(
            auth,
            this.editedItem.email,
            this.editedItem.name,
            this.editedItem.password
          )
            .then(({ user }) => {
              // Após criar o usuário autenticado, atualize o perfil para definir o displayName
              return updateProfile(user, {
                displayName: this.editedItem.name,
              }).then(() => {
                // Após atualizar o perfil com o displayName, armazene os detalhes adicionais no Firestore
                const userRef = doc(firestore, "users", user.uid);
                const uid = userRef._key.path.segments[1];
                setDoc(userRef, {
                  uid: uid,
                  name: this.editedItem.name,
                  email: this.editedItem.email,
                });
              });
            })
            .catch((error) => {
              console.error("Erro ao registrar:", error);
            });
          this.close();
          this.fetchUsers();
        }
      }
    },
  },

  mounted() {
    this.fetchUsers();
    onAuthStateChanged(auth, (user) => {
      if (user) {
        this.userName = user.displayName;
      } else {
        return;
      }
    });
  },

  created() {
    this.fetchUsers();
  },
};
</script>

<style>
th {
  font-size: 1rem !important;
  color: #676767 !important;
  font-weight: 500 !important;
}
.v-list-item {
  padding: 0px !important;
}
.custom__v-col-menu {
  padding: 0px !important;
}
.v-list {
  padding: 8px !important;
}
.custom__v-row-menu {
  margin: 0px !important;
}
.custom__card-title-menu {
  color: #ffffff !important;
  background-color: #515151;
  border-radius: 0px !important;
}
.v-toolbar {
  background-color: #f0f0f0 !important;
}
.v-toolbar__title {
  color: #676767;
}
.v-data-footer {
  background-color: #f0f0f0 !important;
}
.v-data-table {
  margin: 32px;
  max-height: 100vh;
  box-shadow: 0 0px 10px 5px rgba(0, 0, 0, 0.1), 0 0px 15px 0 rgba(0, 0, 0, 0.1),
    0 0px 5px 0 rgba(0, 0, 0, 0.1) !important;
}
.v-card__title {
  color: #676767;
  text-align: center;
  justify-content: center;
}
.v-card__text {
  padding: 16px !important;
}
.custom__card-text {
  display: flex;
  min-height: 140px;
  text-align: center;
  align-items: center;
  justify-content: center;
  padding: 24px !important;
  font-size: 24px !important;
  line-height: 30px !important;
  color: #676767 !important;
}
.v-card__actions {
  padding: 16px !important;
  background-color: #f0f0f0;
  justify-content: space-around;
  .v-btn {
    padding: 0 16px !important;
  }
}
.text-h5 {
  word-break: normal;
}
.custom__col {
  padding: 0px !important;
}
</style>
