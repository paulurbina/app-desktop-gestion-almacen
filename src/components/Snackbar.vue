<template>
  <v-container>
    <v-snackbar
      v-model="confirmationAlert.snackbar"
      :timeout="confirmationAlert.timeout"
      color="green lighten-1"
      top
    >
      {{ confirmationAlert.text }}

      <template v-slot:action="{ attrs }">
        <v-btn
          color="white"
          text
          v-bind="attrs"
          @click="confirmationAlert.snackbar = false"
        >
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script>
export default {
  name: "Snackbar",
  data: () => ({
    confirmationAlert: {
      snackbar: false,
      text: "Se eliminó correctamente.",
      timeout: 1500,
    },
  }),
};
</script>