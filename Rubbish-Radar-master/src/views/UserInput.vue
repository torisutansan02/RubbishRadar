<script setup></script>

<template>
  <div class="userInput">
    <h1>Add Trash Can</h1>
    <br />
    <input v-model="additionalInfo" placeholder="Info About Location" />
    <br />
    <button @click="addTrashCan">Add Trash Can</button>
    <!-- <p v-if="location">Trash can added at location: {{location.latitude}}, {{location.longitude}}</p> -->
    <button @click="addRecyclingBin">Add Recycling Bin</button>
    <!-- <p v-if="location">Recycling Bin added at location: {{location.latitude}}, {{location.longitude}}</p> -->
    <button @click="addCombustible">Add Combustable Bin</button>
    <p v-if="location">
      Added at location: {{ location.latitude }}, {{ location.longitude }}
    </p>
  </div>
</template>

<script>
import { db } from "../firebaseResources";
import {
  collection,
  doc,
  addDoc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  deleteDoc,
} from "firebase/firestore";

export default {
  data() {
    return {
      additionalInfo: "",
      location: null,
    };
  },
  methods: {
    async addTrashCan() {
      if ("geolocation" in navigator) {
        try {
          const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
          });

          this.location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            info: this.additionalInfo,
          };

          const docReference = await addDoc(collection(db, "trashcans"), {
            location: this.location,
          });
        } catch (error) {
          console.error("Error getting location: ", error);
        }
      } else {
        console.error("Location services not available in this browser");
      }
    },
    async addRecyclingBin() {
      if ("geolocation" in navigator) {
        try {
          const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
          });

          this.location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            info: this.additionalInfo,
          };

          const docReference = await addDoc(collection(db, "recyclingbins"), {
            location: this.location,
          });
        } catch (error) {
          console.error("Error getting location: ", error);
        }
      } else {
        console.error("Location services not available in this browser");
      }
    },
    async addCombustible() {
      if ("geolocation" in navigator) {
        try {
          const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
          });

          this.location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            info: this.additionalInfo,
          };

          const docReference = await addDoc(collection(db, "combustiblebins"), {
            location: this.location,
          });
        } catch (error) {
          console.error("Error getting location: ", error);
        }
      } else {
        console.error("Location services not available in this browser");
      }
    },
  },
};
</script>

<style>
body {
  text-align: center;
}
</style>
