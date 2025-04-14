<template>
  <div ref="mapArea" id="map"></div>
</template>

<script>
import { Loader } from "@googlemaps/js-api-loader";
import { auth, db } from "../firebaseResources";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  addDoc,
  deleteDoc,
} from "firebase/firestore";

let map = null;
let infoWindow = null;
let markerMap = new Map();
let directionsRenderer = null;

export default {
  data() {
    return {
      locArray: [],
      userLoggedIn: false,
      mapInitialized: false,
    };
  },
  async mounted() {
    auth.onAuthStateChanged(async (user) => {
      this.userLoggedIn = !!user;
      await this.loadGoogleMaps();
    });
  },
  activated() {
    if (window.google && map) {
      markerMap = new Map();
      this.getLocations().then(() => this.renderMarkers());
    }
  },
  beforeUnmount() {
    if (this.liveNavigationInterval) {
      clearInterval(this.liveNavigationInterval);
    }
  },
  methods: {
    async loadGoogleMaps() {
      const loader = new Loader({
        apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
        version: "weekly",
        libraries: ["places", "routes"],
      });

      try {
        await loader.load();
        await this.initMap();
      } catch (e) {
        console.error("Failed to load Google Maps", e);
      }
    },

    async initMap() {
      if (!this.$refs.mapArea) return;

      const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");

      map = new google.maps.Map(this.$refs.mapArea, {
        center: { lat: 41, lng: -87 },
        zoom: 16,
        mapId: "c843d678fb7a23f3",
      });

      infoWindow = new google.maps.InfoWindow({ content: "" });

      map.addListener("click", (e) => this.handleMapClick(e.latLng));

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((pos) => {
          map.setCenter({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        });
      }

      await this.getLocations();
      this.renderMarkers();
      this.mapInitialized = true;
    },

    async getLocations() {
      const snapshot = await getDocs(collection(db, "locations"));
      this.locArray = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    },

    async renderMarkers() {
      const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");

      const icons = {
        Trash: new URL('@/assets/trash.png', import.meta.url).href,
        Recycle: new URL('@/assets/recycle.png', import.meta.url).href,
        Combustible: new URL('@/assets/combustible.png', import.meta.url).href,
      };

      for (const loc of this.locArray) {
        const { latitude, longitude, type, info, upvoteCount, downvoteCount } = loc.location;
        const id = loc.id;

        if (markerMap.has(id)) continue;

        const markerContent = document.createElement("div");
        const markerImg = document.createElement("img");
        markerImg.src = icons[type];
        markerContent.appendChild(markerImg);

        const marker = new AdvancedMarkerElement({
          position: new google.maps.LatLng(latitude, longitude),
          content: markerContent,
          map,
        });

        marker.addListener("gmp-click", () => this.showInfoWindow(id, marker));
        markerMap.set(id, marker);
      }
    },

    showInfoWindow(id, marker) {
      const loc = this.locArray.find((l) => l.id === id);
      if (!loc) return;

      const { latitude, longitude, type, info, upvoteCount, downvoteCount } = loc.location;

      infoWindow.setContent(`
        <div style="text-align: left; line-height: 1.5;">
          <strong>${info}</strong><br/>
          Type: ${type}<br/>
          Upvotes: ${upvoteCount}<br/>
          Downvotes: ${downvoteCount}<br/>
          <a href="https://google.com/maps/place/${latitude},${longitude}" target="_blank">View on Maps</a>
          ${this.userLoggedIn ? `
            <br/><br/>
            <button id="upvoteButton" class="trashButtons">Upvote</button>
            <button id="downvoteButton" class="trashButtons">Downvote</button>
            <button id="navigateBtn" class="trashButtons">Navigate</button>
          ` : ""}
        </div>
      `);

      infoWindow.open(map, marker);

      google.maps.event.addListenerOnce(infoWindow, "domready", () => {
        document.getElementById("upvoteButton")?.addEventListener("click", () => this.upvote(id));
        document.getElementById("downvoteButton")?.addEventListener("click", () => this.downvote(id));
        document.getElementById("navigateBtn")?.addEventListener("click", () =>
          this.navigateToMarker(latitude, longitude)
        );
      });
    },

    async navigateToMarker(destinationLat, destinationLng) {
      const { DirectionsService, DirectionsRenderer } = await google.maps.importLibrary("routes");

      if (directionsRenderer) {
        directionsRenderer.setMap(null);
      }

      const directionsService = new google.maps.DirectionsService();
      directionsRenderer = new google.maps.DirectionsRenderer({
        suppressMarkers: false,
        preserveViewport: true,
      });

      directionsRenderer.setMap(map);

      // Save reference for interval re-routing
      this.liveNavigationInterval && clearInterval(this.liveNavigationInterval);

      const updateRoute = () => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const origin = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
            const destination = {
              lat: destinationLat,
              lng: destinationLng,
            };

            directionsService.route(
              {
                origin,
                destination,
                travelMode: google.maps.TravelMode.WALKING,
              },
              (result, status) => {
                if (status === "OK") {
                  directionsRenderer.setDirections(result);
                } else {
                  console.error("Directions request failed:", status);
                }
              }
            );
          },
          (error) => {
            console.error("Geolocation error:", error);
          }
        );
      };

      // Call it once immediately
      updateRoute();

      // Then call it every 5 seconds
      this.liveNavigationInterval = setInterval(updateRoute, 5000);
    },


    async handleMapClick(latLng) {
      const lat = latLng.lat();
      const lng = latLng.lng();

      infoWindow.setContent(`
        <div style="font-size: 16px; line-height: 1.5;">
          <strong>${lat}, ${lng}</strong><br/>
          ${this.userLoggedIn ? `
            <button id="addTrash" class="trashButtons">Add Trash</button>
            <button id="addRecycle" class="trashButtons">Add Recycle</button>
            <button id="addCombustible" class="trashButtons">Add Combustible</button>
          ` : "Log in to add bins."}
        </div>
      `);

      infoWindow.setPosition(latLng);
      infoWindow.open(map);

      google.maps.event.addListenerOnce(infoWindow, "domready", () => {
        document.getElementById("addTrash")?.addEventListener("click", () => this.addBin("Trash", lat, lng));
        document.getElementById("addRecycle")?.addEventListener("click", () => this.addBin("Recycle", lat, lng));
        document.getElementById("addCombustible")?.addEventListener("click", () => this.addBin("Combustible", lat, lng));
      });
    },

    async addBin(type, lat, lng) {
      const ref = await addDoc(collection(db, "locations"), {
        location: {
          type,
          info: `This is a ${type} Location`,
          latitude: lat,
          longitude: lng,
          upvoteCount: 0,
          downvoteCount: 0,
        },
      });
      const snap = await getDoc(ref);
      this.locArray.push({ id: ref.id, ...snap.data() });
      this.renderMarkers();
    },

    async upvote(id) {
      const ref = doc(db, "locations", id);
      const snap = await getDoc(ref);
      if (!snap.exists()) return;
      const upvoteCount = (snap.data().location.upvoteCount || 0) + 1;
      await updateDoc(ref, { "location.upvoteCount": upvoteCount });
      this.updateMarkerVotes(id, upvoteCount, null);
    },

    async downvote(id) {
      const ref = doc(db, "locations", id);
      const snap = await getDoc(ref);
      if (!snap.exists()) return;

      const downvoteCount = (snap.data().location.downvoteCount || 0) + 1;
      const upvoteCount = snap.data().location.upvoteCount || 0;

      await updateDoc(ref, { "location.downvoteCount": downvoteCount });

      if (downvoteCount >= upvoteCount / 5 && downvoteCount !== 0) {
        await this.deleteBin(id);
      } else {
        this.updateMarkerVotes(id, null, downvoteCount);
      }
    },

    async deleteBin(id) {
      const ref = doc(db, "locations", id);
      await deleteDoc(ref);

      const marker = markerMap.get(id);
      if (marker) {
        marker.setMap(null);
        markerMap.delete(id);
      }

      this.locArray = this.locArray.filter((l) => l.id !== id);
    },

    updateMarkerVotes(id, up, down) {
      this.locArray = this.locArray.map((l) =>
        l.id === id
          ? {
              ...l,
              location: {
                ...l.location,
                upvoteCount: up ?? l.location.upvoteCount,
                downvoteCount: down ?? l.location.downvoteCount,
              },
            }
          : l
      );

      const marker = markerMap.get(id);
      if (marker) this.showInfoWindow(id, marker);
    },
  },
};
</script>

<style>
#map {
  width: 100%;
  height: 100vh;
}
.gm-style-iw-chr {
  position: absolute;
  display: flex;
  top: 0;
  right: 0;
}
.gm-style-iw.gm-style-iw-c {
  padding-top: 14px !important;
}
</style>
