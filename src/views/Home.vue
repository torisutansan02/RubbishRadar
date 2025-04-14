<template>
  <div class="scrollButtonContainer">
    <button class="scrollButton" @click="scrollToMap">Go to Map</button>
  </div>

  <CustomMap v-if="mapVisible" />
  <UserInputMap />

  <img class="logo" src="../images/new_logo.png" alt="Rubbish_Radar_Logo_pic" />

  <p>
    © {{ new Date().getFullYear() }}, torisutansan. Project by Tristan Cai
  </p>
</template>

<script>
import CustomMap from "../components/CustomMap.vue";
import UserInputMap from "../components/userInputMap.vue";

export default {
  components: { CustomMap, UserInputMap },
  data() {
    return {
      mapVisible: false,
    };
  },
  mounted() {
    this.mapVisible = true;
  },
  methods: {
    scrollToMap() {
      const map = document.getElementById("map");
      if (map) {
        window.scrollTo({ top: map.offsetTop, behavior: "smooth" });
      }
    },
  },
};
</script>
