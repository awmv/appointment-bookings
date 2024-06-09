<script setup>
import { ref } from "vue";

const count = ref(0);

function increment() {
  count.value++;
}
</script>

<template>
  <v-btn
    @click="increment"
    class="bg-green-700 hover:bg-green-900 text-white py-2 px-4 rounded"
  >
    Click Me
  </v-btn>
  <p>
    You've pressed the button <strong>{{ count }}</strong> times.
  </p>

  <v-date-picker elevation="24"></v-date-picker>
</template>
