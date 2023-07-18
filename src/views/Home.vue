<template>
  <v-data-table
    :headers="headers"
    :items="users"
    :footer-props="{ 'items-per-page-text': 'Usuários por página' }"
    sort-by="name"
  >
    <!-- Top section -->
    <template v-slot:top>
      <!-- UserCard component -->
      <v-row class="custom__v-row-menu">
        <v-col class="custom__v-col-menu">
          <user-card :user-name="getUserName()"></user-card>
        </v-col>
      </v-row>
      <v-toolbar flat>
        <v-toolbar-title>CRUD de usuários</v-toolbar-title>
        <v-spacer></v-spacer>
        <!-- UserForm component inside a v-dialog -->
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
              <v-icon dark>mdi-plus</v-icon>
            </v-btn>
          </template>
          <user-form
            :edited-index="editedIndex"
            :edited-item="editedItem"
            :rules-name="rulesName"
            :rules-email="rulesEmail"
            :rules-password="rulesPassword"
            :users="users"
            :docRefValue="docRef ? docRef : {}"
            @close="close"
            @fetch-users="fetchUsers"
            @close-delete="closeDelete"
            @user-saved="fetchUsers"
          ></user-form>
        </v-dialog>
        <!-- Delete dialog -->
        <v-dialog v-model="dialogDelete" max-width="500px">
          <!-- Delete user confirmation -->
          <v-card>
            <v-card-title>
              <span class="text-h5">Deletar Usuário</span>
            </v-card-title>
            <v-divider></v-divider>
            <v-card-text class="custom__card-text">
              Tem certeza que deseja deletar o usuário {{ editedItem.name }}?
            </v-card-text>
            <v-card-actions>
              <v-btn dark normal color="#595959" @click="closeDelete()">
                Cancelar
              </v-btn>
              <v-btn dark normal color="#694EDF" @click="deleteUser(uid)">
                Excluir
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-toolbar>
    </template>
    <!-- Actions for each item in the table -->
    <template v-slot:item.actions="{ item }">
      <!-- Edit icon -->
      <v-icon small color="#959595" class="mr-2" @click="editUser(item)">
        mdi-pencil
      </v-icon>
      <!-- Delete icon -->
      <v-icon
        small
        v-if="item.email !== loggedUserEmail"
        color="#E96C6C"
        @click="deleteItem(item)"
      >
        mdi-delete
      </v-icon>
    </template>
  </v-data-table>
</template>

<script>
import { onAuthStateChanged } from "firebase/auth";
import {
  doc,
  getDoc,
  deleteDoc,
  getDocs as fetchDocs,
} from "firebase/firestore";
import { auth, firestore, usersColRef } from "@/firebase.js";
import UserCard from "../components/UserCard.vue";
import UserForm from "../components/UserForm.vue";

export default {
  name: "Home",
  components: {
    UserCard,
    UserForm,
  },
  data() {
    return {
      uid: "",
      users: [],
      show: false,
      docRef: null,
      userName: "",
      userRef: null,
      dialog: false,
      currentUser: null,
      dialogDelete: false,
      loggedUserEmail: "",
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
        min: (v) =>
          (typeof v === "string" && v.length >= 8) || "Mínimo 8 caracteres",
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
        name: "",
        email: "",
        password: "",
      },
      defaultItem: {
        name: "",
        email: "",
      },
    };
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
      if (!val) {
        this.close();
      }
    },
    dialogDelete(val) {
      if (!val) {
        this.closeDelete();
      }
    },
  },
  methods: {
    // Fetches the list of users from Firestore
    async fetchUsers() {
      try {
        const querySnapshot = await fetchDocs(usersColRef);
        const loggedUser = auth.currentUser;
        if (loggedUser) {
          this.loggedUserEmail = loggedUser.email;
        }
        this.users = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
      } catch (error) {
        console.error("Erro ao buscar usuários:", error);
      }
    },
    // Retrieves the name of the currently logged-in user
    getUserName() {
      const user = auth.currentUser;
      if (user) {
        return user.displayName || ""; // Returns the name of the logged-in user or an empty string
      } else {
        return "";
      }
    },
    // Edits a user
    editUser(item) {
      this.uid = item.uid;
      const userDocRef = doc(firestore, "users", this.uid);
      this.userRef = userDocRef;
      getDoc(userDocRef)
        .then((docSnapshot) => {
          if (docSnapshot.exists()) {
            this.editedItem = {
              id: docSnapshot.id,
              ...docSnapshot.data(),
            };
            const userRef = doc(usersColRef, this.uid);
            this.docRef = userDocRef;
          }
        })
        .catch((error) => {
          console.error("Erro ao obter os dados do usuário:", error);
        });
      this.editedIndex = this.users.indexOf(item);
      this.editedItem = { ...item };
      this.dialog = true;
    },

    // Deletes a user
    async deleteUser() {
      try {
        const userDocRef = doc(firestore, "users", this.uid);
        await deleteDoc(userDocRef);
        console.log("Usuário excluído com sucesso do Firestore");
        this.fetchUsers();
      } catch (error) {
        console.error("Erro ao excluir usuário do Firestore:", error);
      }
      this.closeDelete();
    },

    // Closes the dialog
    close() {
      this.dialog = false;
      this.$nextTick(() => {
        this.editedIndex = -1;
        this.editedItem = { ...this.defaultItem };
      });
    },

    // Closes the delete dialog
    closeDelete() {
      this.dialogDelete = false;
      this.$nextTick(() => {
        this.editedIndex = -1;
        this.editedItem = { ...this.defaultItem };
      });
    },

    // Logs out the user
    logout() {
      auth
        .signOut()
        .then(() => {})
        .catch((err) => alert(err.message));
    },

    // Opens the delete dialog and sets the edited item
    deleteItem(item) {
      this.dialogDelete = true;
      if (item && item.uid) {
        this.uid = item.uid;
        this.editedItem = { ...item };
        this.editedIndex = this.users.findIndex(
          (user) => user.uid === item.uid
        );
        this.$nextTick(() => {
          this.dialogDelete = true;
        });
      }
    },
  },
  async mounted() {
    this.fetchUsers();
    onAuthStateChanged(auth, (user) => {
      if (user) {
        this.userName = user.displayName;
      }
    });
  },
  created() {
    this.fetchUsers();
  },
};
</script>

<style scoped>
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
