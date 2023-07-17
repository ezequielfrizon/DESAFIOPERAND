<template>
  <div id="app">
    <v-app>
      <v-content>
        <v-container>
          <v-form ref="form" @submit.prevent="register">
            <v-card class="mx-auto my-12 outer-card" max-width="374">
              <v-card-title>
                <v-card
                  class="v-header py-2 mx-auto my-n12"
                  max-width="364"
                  raised
                >
                  <v-card-title>
                    <v-row justify="center" color="white">
                      <h4>Registrar</h4>
                    </v-row>
                  </v-card-title>
                  <v-row justify="center" color="white" class="custom__v-row">
                    <v-btn icon color="white">
                      <v-icon>mdi-facebook</v-icon>
                    </v-btn>
                    <v-btn icon color="white">
                      <v-icon>mdi-twitter</v-icon>
                    </v-btn>
                    <v-btn icon color="white">
                      <v-icon>mdi-google-plus</v-icon>
                    </v-btn>
                  </v-row>
                </v-card>
              </v-card-title>
              <br />
              <v-card-text class="my-4">
                <v-text-field
                  counter
                  clearable
                  label="Nome"
                  color="purple"
                  v-model="name"
                  hint="Mínimo 3 caracteres"
                  prepend-icon="mdi mdi-account-circle"
                  :rules="[rulesName.required, rulesName.min]"
                ></v-text-field>
                <v-text-field
                  counter
                  clearable
                  label="Email"
                  color="purple"
                  v-model="email"
                  prepend-icon="mdi mdi-email"
                  :rules="[rulesEmail.required, rulesEmail.correct]"
                ></v-text-field>
                <v-text-field
                  counter
                  clearable
                  label="Senha"
                  color="purple"
                  v-model="password"
                  hint="Mínimo 8 caracteres"
                  prepend-icon="mdi mdi-lock"
                  @click:append="show = !show"
                  :type="show ? 'text' : 'password'"
                  :append-icon="show ? 'mdi-eye' : 'mdi-eye-off'"
                  :rules="[rulesPassword.required, rulesPassword.min]"
                ></v-text-field>
              </v-card-text>
              <v-card-actions class="custom__v-card-actions">
                <v-row justify="center" class="custom__v-row-button">
                  <v-btn
                    normal
                    width="100%"
                    type="submit"
                    color="#694EDF"
                    class="custom__v-btn"
                  >
                    REGISTRAR
                  </v-btn>
                </v-row>
                <v-row justify="center" class="custom__v-row-actions">
                  <v-card-text class="custom__v-card-text"
                    >Já possui uma conta?</v-card-text
                  >
                  <router-link class="custom__router-link" to="/login"
                    >LOGIN</router-link
                  >
                </v-row>
              </v-card-actions>
            </v-card>
          </v-form>
        </v-container>
      </v-content>
    </v-app>
  </div>
</template>

<script>
import { doc, setDoc } from "firebase/firestore";
import {
  auth,
  firestore,
  updateProfile,
  createUserWithEmailAndPassword,
} from "@/firebase.js";

export default {
  data() {
    return {
      uid: "",
      name: "",
      email: "",
      show: false,
      password: "",
      rulesName: {
        required: (value) => !!value || "Nome é obrigatório.",
        min: (v) => v.length >= 3 || "Mínimo 3 caracteres",
      },
      rulesPassword: {
        required: (value) => !!value || "Senha é obrigatória.",
        min: (v) => v.length >= 8 || "Mínimo 8 caracteres",
      },
      rulesEmail: {
        required: (value) => !!value || "Email é obrigatório.",
        correct: (v) => /.+@.+\..+/.test(v) || "E-mail inválido",
      },
    };
  },
  methods: {
    register() {
      if (this.$refs.form.validate()) {
        createUserWithEmailAndPassword(auth, this.email, this.password)
          .then(({ user }) => {
            // Após criar o usuário autenticado, atualize o perfil para definir o displayName
            return updateProfile(user, {
              displayName: this.name,
            }).then(() => {
              // Após atualizar o perfil com o displayName, armazene os detalhes adicionais no Firestore
              const userRef = doc(firestore, "users", user.uid);
              const uid = (userRef._key.path.segments[1])
              setDoc(userRef, {
                uid: uid,
                name: this.name,
                email: this.email,
              });
            });
          })
          .catch((error) => {
            console.error("Erro ao registrar:", error);
          });
      }
    },
  },
};
</script>

<style>
.v-header {
  width: 100%;
  text-align: center;
  margin-top: -40px;
  min-height: 100px;
  background-image: linear-gradient(60deg, #9480eb, #2f1b85);
}
.custom__v-card-actions {
  padding: 0px 16px 16px 16px !important;
  flex-direction: column;
  background-color: #ffffff;
}
.custom__v-card-text {
  color: #757575;
  padding: 0px !important;
}
.custom__v-btn {
  color: #ffffff !important;
}
.custom__v-row-button {
  width: 100%;
  margin-bottom: 36px !important;
}
.custom__router-link {
  text-decoration: none;
}
.custom__v-row {
  margin: 0px !important;
}
.custom__v-row-actions {
  align-items: center;
  flex-direction: column;
  justify-content: center;
  margin: 0px !important;
}
h4 {
  color: white;
}
.outer-card {
  border-radius: 8px !important;
}
.v-input__icon--prepend .v-icon {
  color: black;
}
</style>
