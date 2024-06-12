<template>
  <v-container>
    <v-row>
      <v-col cols="12" md="6" offset-md="3">
        <v-alert
          v-model="alert"
          border="top"
          close-label="Credentials"
          color="secondary"
          title="Credentials"
          variant="outlined"
          closable
          class="mb-4"
          type="info"
          ><p>
            <code>test1:password1</code>
          </p>
          <p><code>test2:password2</code></p>
        </v-alert>

        <v-card>
          <template v-slot:image>
            <v-img
              gradient="to top right, rgba(19,84,122,.1), rgba(128,208,199,.1)"
            ></v-img>
          </template>
          <v-card-title class="text-h6">Login</v-card-title>
          <v-card-text>
            <v-form @submit.prevent="login">
              <v-text-field
                v-model="username"
                label="Username"
                type="username"
                prepend-icon="mdi-account"
                required
              ></v-text-field>
              <v-text-field
                v-model="password"
                label="Password"
                type="password"
                prepend-icon="mdi-lock"
                required
              ></v-text-field>
              <v-btn type="submit" color="primary" variant="tonal">Login</v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { Meteor } from "meteor/meteor";
import { useRouter } from "vue-router";

export default defineComponent({
  data() {
    return {
      username: "",
      password: "",
      alert: true,
    };
  },
  setup() {
    const router = useRouter();
    return { router };
  },
  methods: {
    login() {
      Meteor.loginWithPassword(this.username, this.password, (err) => {
        if (err) {
          // TODO: Client side error to avoid exposing the reason
          console.error("Login failed:", err);
        } else {
          console.log("Logged in successfully");
          this.router.push({ name: "appointments" });
        }
      });
    },
  },
});
</script>
