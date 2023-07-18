<template>
  <v-form ref="form" @submit.prevent="saveUser">
    <v-card>
      <v-card-title>
        <span class="text-h5">
          {{ editedIndex === -1 ? "Adicionar Usuário" : "Editar Usuário" }}
        </span>
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
                hint="Mínimo 3 caracteres"
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
            <v-col v-if="editedIndex === -1" class="custom__col" cols="12">
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
        <v-btn dark normal color="#595959" @click="close()"> Cancelar </v-btn>
        <v-btn dark normal type="submit" color="#694EDF"> Salvar </v-btn>
      </v-card-actions>
    </v-card>
  </v-form>
</template>

<script>
import { setDoc, doc } from "firebase/firestore";
import {
  auth,
  firestore,
  updateProfile,
  createUserWithEmailAndPassword,
} from "@/firebase.js";

export default {
  props: {
    // Propriedades recebidas pelo componente
    editedIndex: {
      type: Number,
      required: true,
    },
    editedItem: {
      type: Object,
      required: true,
    },
    rulesName: {
      type: Object,
      required: true,
    },
    rulesEmail: {
      type: Object,
      required: true,
    },
    rulesPassword: {
      type: Object,
      required: true,
    },
    users: {
      type: Array,
      required: true,
    },
    docRefValue: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      show: false,
    };
  },
  methods: {
    async saveUser() {
      // Validação do formulário antes de salvar o usuário
      if (this.$refs.form.validate()) {
        if (this.editedIndex > -1) {
          try {
            if (this.docRefValue) {
              // Atualiza os dados do usuário existente no Firestore
              await setDoc(this.docRefValue, {
                uid: this.docRefValue.id,
                name: this.editedItem.name,
                email: this.editedItem.email,
              });
            }
            // Emite evento para fechar o formulário de edição
            this.$emit("close");
            // Emite evento para informar que o usuário foi salvo
            this.$emit("user-saved", this.editedItem);
            this.$toasted.success("Usuário editado com sucesso", {
              position: "top-right",
              duration: 3000,
            });
          } catch (err) {
            this.$toasted.error("Erro ao editar usuário" + err.message, {
              position: "top-right",
              duration: 3000,
            });
          }
        } else {
          const editedItem = this.editedItem;
          try {
            // Cria um novo usuário no Firebase Authentication com email e senha fornecidos
            const userCredential = await createUserWithEmailAndPassword(
              auth,
              editedItem.email,
              editedItem.password
            );
            const user = userCredential.user;
            // Atualiza o perfil do usuário com o nome fornecido
            await updateProfile(user, {
              displayName: editedItem.name,
            });
            const userRef = doc(firestore, "users", user.uid);
            const uid = userRef._key.path.segments[1];
            // Cria um novo documento de usuário no Firestore com os dados fornecidos
            await setDoc(userRef, {
              uid: uid,
              name: editedItem.name,
              email: editedItem.email,
            });
            // Emite evento para fechar o formulário de edição
            this.$emit("close");
            // Emite evento para informar que o usuário foi salvo
            this.$emit("user-saved", this.editedItem);
            this.$toasted.success("Usuário criado com sucesso", {
              position: "top-right",
              duration: 3000,
            });
          } catch (err) {
            this.$toasted.error("Erro ao cadastrar" + err.message, {
              position: "top-right",
              duration: 3000,
            });
          }
        }
      }
    },
    close() {
      // Emite evento para fechar o formulário de edição
      this.$emit("close");
    },
  },
};
</script>

<style scoped>
.v-card__title {
  color: #676767;
  text-align: center;
  justify-content: center;
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
