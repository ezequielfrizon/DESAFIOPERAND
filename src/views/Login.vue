<template>
  <div id="app">
    <v-app>
      <v-content>
        <v-container>
          <v-form ref="form" @submit.prevent="Login">
            <v-card class="mx-auto my-12 outer-card" max-width="374">
              <v-card-title>
                <v-card
                  class="v-header py-2 mx-auto my-n12"
                  max-width="364"
                  raised
                >
                  <v-card-title>
                    <v-row justify="center" color="white">
                      <h4>Login</h4>
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
                    ENTRAR
                  </v-btn>
                </v-row>
                <v-row justify="center" class="custom__v-row-actions">
                  <v-card-text class="custom__v-card-text"
                    >Ainda não possui uma conta?</v-card-text
                  >
                  <router-link class="custom__router-link" to="/register"
                    >REGISTRE-SE</router-link
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
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
export default {
  data() {
    return {
      email: "",
      show: false,
      password: "",
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
  computed: {
    form() {
      return {
        email: this.email,
        password: this.password,
      };
    },
  },
  methods: {
    //Login do usuário
    async Login() {
      if (this.$refs.form.validate()) {
        try {
          const auth = getAuth();
          await signInWithEmailAndPassword(auth, this.email, this.password);
        } catch (error) {
          this.$toasted.error("Ocorreu um erro", {
            position: "top-right",
            duration: 3000,
          });
        }
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
  color: #694edf !important;
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
