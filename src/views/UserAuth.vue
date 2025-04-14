<template>
  <div class="userLogin">
    <template v-if="!userLoggedIn">
      <h1>Login / Sign Up</h1>
      <input
        v-model.trim="email"
        type="text"
        class="inputBox"
        placeholder="E-mail: test@gmail.com"
      />
      <br />
      <br />
      <input
        v-model.trim="password"
        type="password"
        class="inputBox"
        placeholder="Password: password123"
      />
      <br />
      <br />
      <template v-if="password && password.length < 6" style="color: red">
        <br />Your password must be at least 6 characters
      </template>

      <button class="social-button" @click="createUser">Create User</button>
      <br />
      <br />
      <button class="social-button" @click="login">Login</button>
      <br />
      <br />
      <p>Sign in with Google</p>
      <button
        class="social-button-img"
        style="background-color: rgb(226, 226, 226)"
        @click="socialLogin"
      >
        <img
          class="center"
          alt="Google Logo"
          src="../assets/google-logo4.png"
        />
      </button>

      <template v-if="userNotFound"> <br />User not found </template>
      <template v-if="invalidPassword"> <br />Invalid password </template>
      <template v-if="authError">
        <br />An error occurred: {{ authError }}
      </template>
    </template>
    <template v-else>
      <h1 class="signuph1">You are already signed in</h1>
      <button class="trashButtons" @click="signOut">Sign Out</button>
    </template>
  </div>

  <p class="about">
    © {{ new Date().getFullYear() }}, torisutansan. Project by Tristan Cai
  </p>
</template>

<script>
import {
  getAuth,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";

const auth = getAuth();

export default {
  data() {
    return {
      email: "",
      password: "",
      userNotFound: false,
      invalidPassword: false,
      userLoggedIn: false,
      authError: null,
    };
  },
  mounted() {
    onAuthStateChanged(auth, (user) => {
      this.userLoggedIn = !!user;
    });
  },
  methods: {
    async login() {
      try {
        this.userNotFound = false;
        this.invalidPassword = false;
        this.authError = null;

        await signInWithEmailAndPassword(auth, this.email, this.password);
        this.userLoggedIn = true;
        this.$router.replace("/UserAuth");
      } catch (err) {
        if (err.code === "auth/wrong-password") {
          this.invalidPassword = true;
        } else if (err.code === "auth/user-not-found") {
          this.userNotFound = true;
        } else {
          this.authError = err.message;
        }
      }
    },
    async createUser() {
      try {
        this.userNotFound = false;
        this.invalidPassword = false;
        this.authError = null;

        await createUserWithEmailAndPassword(auth, this.email, this.password);
        this.userLoggedIn = true;
        this.$router.replace("/UserAuth");
      } catch (err) {
        this.authError = err.message;
        console.error("Error in createUser", err);
      }
    },
    async signOut() {
      try {
        await signOut(auth);
        this.userLoggedIn = false;
      } catch (err) {
        console.error("Error in signOut", err);
      }
    },
    async socialLogin() {
      const provider = new GoogleAuthProvider();
      try {
        await signInWithPopup(auth, provider);
        this.userLoggedIn = true;
        this.$router.replace("/UserAuth");
      } catch (err) {
        this.authError = err.message;
        console.error("Error in socialLogin", err);
      }
    },
  },
};
</script>

<style>
/* Add your styles here */
</style>
