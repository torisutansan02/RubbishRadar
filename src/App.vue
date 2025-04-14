<script setup>
import { RouterView } from "vue-router";
</script>

<template>
  <div class="nav">
    <RouterLink class="homeLink" to="/"> Home </RouterLink>
    <RouterLink class="aboutLink" to="/about"> About </RouterLink>
    <RouterLink class="userAuthLink" to="/UserAuth"> Sign Up </RouterLink>
  </div>

  <!-- Correct usage with keep-alive -->
  <router-view v-slot="{ Component }">
    <keep-alive>
      <component :is="Component" />
    </keep-alive>
  </router-view>
</template>