<template>
  <div>
    <v-dialog v-model="loadingExcel.modal" max-width="650px" persistent>
      <v-card>
        <v-card-title class="headline"> Subir Archivo </v-card-title>
        <v-divider class="mx-4" inset></v-divider>

        <v-file-input
          style="width: 610px"
          show-size
          counter
          multiple
          label="Entrada Archivo"
          type="file"
          v-model="files"
          ref="myfile"
        ></v-file-input>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="loadingExcel.modal = false"
            >Cancelar</v-btn
          >
          <v-btn
            depressed
            color="blue darken-1"
            text
            :loading="loading"
            @click="deployExcel"
            >OK</v-btn
          >
          <v-spacer></v-spacer>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
export default {
  data: () => ({
    loadingExcel: {
      modal: true,
      width: false,
    },
  }),
};
</script>