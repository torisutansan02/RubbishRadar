<template>
  <div>
    <h1>Add Trash Can</h1>
    <h3>
      Add trash from custom location
    </h3>
    <input v-model="additionalInfo" className = "inputBox" placeholder="Location Description" />
    <input v-model.number="latitude" className = "inputBox" placeholder="Latitude" />
    <input v-model.number="longitude" className = "inputBox" placeholder="Longitude" />
    <br />
    <button id="leftButton" class="trashButtons" @click="addTrashCan">
      Add Trash Can
    </button>
    <button id="midButton" class="trashButtons" @click="addRecyclingBin">
      Add Recycling Bin
    </button>
    <button id="rightButton" class="trashButtons" @click="addCombustible">
      Add Combustible Bin
    </button>
    <p v-if="location">
      Added at location: {{ location.latitude }}, {{ location.longitude }}
    </p>
  </div>
</template>

<script>
import { db } from "../firebaseResources";
import { collection, addDoc } from "firebase/firestore";

export default {
  data() {
    return {
      additionalInfo: "",
      latitude: null,
      longitude: null,
      location: null,
    };
  },

  methods: {
    async addLocation(type) {
      if (this.latitude && this.longitude) {
        try {
          this.location = {
            latitude: this.latitude,
            longitude: this.longitude,
            info: this.additionalInfo,
            type: type,
            upvoteCount: 0,
            downvoteCount: 0,
          };

          await addDoc(collection(db, "locations"), {
            location: this.location,
          });

          // Clear input fields
          this.additionalInfo = "";
          this.latitude = null;
          this.longitude = null;

          // Optionally refresh the page or do something else
          // window.location.reload();
        } catch (error) {
          console.error("Error adding location: ", error);
        }
      } else {
        console.error("Latitude and longitude are required.");
      }
    },

    addTrashCan() {
      this.addLocation("Trash");
    },

    addRecyclingBin() {
      this.addLocation("Recycle");
    },

    addCombustible() {
      this.addLocation("Combustible");
    },
  },
};
</script>

<style>
.trashButtons {
  color: white;
}

.trashButtons:hover {
  background-color: black;
}
</style>
