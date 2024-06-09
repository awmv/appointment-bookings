<script setup>
import AppMenu from "./AppMenu.vue";
</script>

<template>
  <v-app>
    <v-main>
      <AppMenu />
      <router-view />
    </v-main>
  </v-app>
</template>

<script setup lang="ts"></script>
