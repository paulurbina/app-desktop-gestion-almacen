<template>
  <v-app style="-webkit-app-region: drag">
    <div class="text-center" v-if="this.desserts.length === 0">
      <v-btn
        :loading="loadingIcon.show"
        :disabled="loadingIcon.show"
        color="blue-grey"
        class="ma-2 white--text"
        fab
      >
        <v-icon dark> mdi-cloud-upload </v-icon>
      </v-btn>
    </div>
    <v-data-table
      else
      :headers="headers"
      :items="desserts"
      sort-by="calories"
      class="elevation-1"
    >
      <template v-slot:top>
        <v-toolbar flat>
          <v-toolbar-title>Productos del Almacén</v-toolbar-title>

          <v-snackbar
            v-model="confirmationAlert.snackbar"
            :timeout="confirmationAlert.timeout"
            :color="confirmationAlert.color"
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

          <!-- load excel -->
          <v-dialog v-model="loadingExcel.modal" max-width="650px" persistent>
            <v-card>
              <v-card-title class="headline"> Subir Archivo </v-card-title>
              <v-divider class="mx-4" inset></v-divider>

              <form enctype="multipart/form-data">
                <v-file-input
                  v-model="selectFile"
                  style="width: 610px"
                  show-size
                  counter
                  label="Entrada Archivo"
                  type="file"
                  @change="onFileSelected"
                ></v-file-input>
              </form>

              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                  color="blue darken-1"
                  text
                  @click="loadingExcel.modal = false"
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
          <!-- load excel -->

          <v-divider class="mx-4" inset vertical></v-divider>
          <v-spacer></v-spacer>

          <v-dialog v-model="dialog" max-width="500px" persistent>
            <template v-slot:activator="{ on, attrs }">
              <!-- button deploy file excel -->
              <v-btn color="blue-grey" class="ma-2 white--text" fab>
                <v-icon dark @click="loadingExcel.modal = true">
                  mdi-cloud-upload
                </v-icon>
              </v-btn>
              <!-- button deploy file excel -->

              <v-btn color="primary" dark class="mb-2" v-bind="attrs" v-on="on">
                Agregar Producto
              </v-btn>
            </template>
            <v-form ref="form" v-model="rulesValid.valid" lazy-validation>
              <v-card>
                <v-card-title>
                  <span class="headline">{{ formTitle }}</span>
                </v-card-title>
                <v-divider class="mx-3" inset></v-divider>
                <v-card-text>
                  <v-container>
                    <v-row>
                      <!-- calendario -->
                      <v-col cols="12" sm="6" md="6">
                        <v-menu
                          v-model="calendar.menu"
                          :close-on-content-click="false"
                          transition="scale-transition"
                          offset-y
                          max-width="290px"
                          min-width="auto"
                        >
                          <template v-slot:activator="{ on, attrs }">
                            <v-text-field
                              v-model="computedDateFormatted"
                              label="Fecha"
                              hint="DD/MM/YYYY"
                              persistent-hint
                              readonly
                              v-bind="attrs"
                              v-on="on"
                              required
                            ></v-text-field>
                          </template>
                          <v-date-picker
                            v-model="date"
                            no-title
                            @input="calendar.menu = false"
                          ></v-date-picker>
                        </v-menu>
                      </v-col>
                      <!-- calendario -->
                      <!-- others options -->
                      <v-col cols="12" sm="6" md="6">
                        <v-text-field
                          v-model="editedItem.producto"
                          label="Nombre Producto"
                          :counter="10"
                          :rules="rulesValid.productNameRules"
                          required
                        ></v-text-field>
                      </v-col>
                    </v-row>
                    <v-row>
                      <v-col cols="12" sm="6" md="6">
                        <v-text-field
                          v-model="editedItem.cantidad"
                          label="Cantidad"
                          :counter="20"
                          :rules="rulesValid.amountRules"
                          required
                        ></v-text-field>
                      </v-col>
                      <v-col cols="12" sm="6" md="6">
                        <v-text-field
                          v-model="editedItem.codigo"
                          label="Código"
                          :counter="40"
                          :rules="rulesValid.codeRules"
                          required
                        ></v-text-field>
                      </v-col>
                    </v-row>
                    <!-- others options -->
                  </v-container>
                </v-card-text>

                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn color="blue darken-1" text @click="close">
                    Cancelar
                  </v-btn>
                  <v-btn color="blue darken-1" text @click="save(editedItem)">
                    Guardar
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-form>
          </v-dialog>

          <v-dialog v-model="dialogView" max-width="350px" persistent>
            <v-card>
              <v-card-title class="headline">
                Detalle del Producto
              </v-card-title>
              <v-divider class="mx-4" inset></v-divider>
              <v-card-text>
                <v-container>
                  <v-row>
                    <v-list>
                      <v-list-item
                        v-for="(n, index) in editedItem"
                        :key="index"
                      >
                        <v-list-item-title
                          >{{ index }} : {{ n }}</v-list-item-title
                        >
                      </v-list-item>
                    </v-list>
                  </v-row>
                </v-container>
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" text @click="closeView">OK</v-btn>
                <v-spacer></v-spacer>
              </v-card-actions>
            </v-card>
          </v-dialog>

          <v-dialog v-model="dialogDelete" max-width="650px" persistent>
            <v-card>
              <v-card-title class="headline"
                >¿Estás seguro de que quieres eliminar este
                artículo?</v-card-title
              >
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" text @click="closeDelete"
                  >Cancelar</v-btn
                >
                <v-btn
                  depressed
                  color="blue darken-1"
                  text
                  :loading="loading"
                  @click="deleteItemConfirm()"
                  >OK</v-btn
                >
                <v-spacer></v-spacer>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-toolbar>
      </template>
      <template v-slot:[`item.actions`]="{ item }">
        <v-icon small class="mr-2" @click="editItem(item)"> mdi-pencil </v-icon>
        <v-icon small class="mr-2" @click="deleteItem(item)">mdi-delete</v-icon>
        <v-icon small @click="viewItem(item)"> mdi-eye </v-icon>
      </template>
      <template v-slot:no-data>
        <!-- <v-btn color="primary" @click="initialize"> Reset </v-btn> -->
      </template>
    </v-data-table>
  </v-app>
</template>

<script src="https://code.jquery.com/jquery-3.5.1.min.js"></script>
<script>
import { ipcRenderer } from "electron";

export default {
  name: "App",

  components: {},

  data: (vm) => ({
    loading: false,
    selectFile: {},
    loadingIcon: {
      show: true,
    },
    rulesValid: {
      valid: true,
      productNameRules: [
        (v) => !!v || "El nombre del producto es requerido",
        (v) => (v && v.length <= 15) || "Name must be less than 10 characters",
      ],
      amountRules: [
        (v) => !!v || "La cantidad es requerido",
        (v) => /^[0-9]+$/.test(v) || "La cantidad debe ser un número",
      ],
      codeRules: [
        (v) => !!v || "El código es requerido",
        (v) => /^[0-9]+$/.test(v) || "La cantidad debe ser un número",
      ],
    },

    loadingExcel: {
      modal: true,
      width: false,
    },

    date: new Date().toISOString().substr(0, 10),
    calendar: {
      dateFormatted: vm.formatDate(new Date().toISOString().substr(0, 10)),
      menu: false,
    },

    confirmationAlert: {
      snackbar: false,
      text: "Se eliminó correctamente.",
      timeout: 1500,
      color: "green lighten-1",
    },
    dialog: false,
    dialogDelete: false,
    dialogView: false,
    headers: [
      {
        text: "Fecha",
        align: "start",
        sortable: true,
        value: "fecha",
      },
      { text: "Producto", value: "producto" },
      { text: "Cantidad", value: "cantidad" },
      { text: "Código", value: "codigo" },
      { text: "Acciones", value: "actions", sortable: true },
    ],
    desserts: [],
    editedIndex: -1,
    editedItem: {
      fecha: "",
      producto: "",
      cantidad: 0,
      codigo: 0,
    },
    defaultItem: {
      fecha: "",
      producto: "",
      cantidad: 0,
      codigo: 0,
    },
  }),

  computed: {
    formTitle() {
      return this.editedIndex === -1 ? "Agregar Producto" : "Editar Producto";
    },
    computedDateFormatted() {
      return this.formatDate(this.date);
    },
  },

  watch: {
    dialog(val) {
      val || this.close();
    },
    dialogDelete(val) {
      val || this.closeDelete();
    },
    date() {
      this.calendar.dateFormatted = this.formatDate(this.date);
    },
  },

  mounted() {
    this.loadingIcon.show = true;
  },

  created() {
    ipcRenderer.send(
      "verificationData",
      this.desserts.length > 0 ? true : false
    ); // validar si existe un data en array // this.loadingExcel.modal = true
    ipcRenderer.on("dtaExcel", (e, args) => {
      this.desserts = args;
    });
  },

  methods: {
    formatDate(date) {
      if (!date) return null;

      const [year, month, day] = date.split("-");
      return `${day}/${month}/${year}`;
    },

    viewItem(item) {
      this.viewIndex = this.desserts.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialogView = true;
    },

    closeView() {
      this.dialogView = false;
    },

    editItem(item) {
      this.editedIndex = this.desserts.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialog = true;
    },

    deleteItem(item) {
      this.editedIndex = this.desserts.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialogDelete = true;
    },

    deleteItemConfirm() {
      this.loading = true;
      this.desserts.splice(this.editedIndex, 1);
      this.loading = false;

      ipcRenderer.send("deleteRow", this.editedIndex);

      this.closeDelete();
      // notifications
      ipcRenderer.on("sendNotifications", (event, args) => {
        this.confirmationAlert.snackbar = args.snackbar;
        this.confirmationAlert.text = args.text;
      });
    },

    // time loading for delete o add register
    async loadingButton() {
      this.loading = true;
      await new Promise((resolve) => setTimeout(resolve, 2000));
      this.loading = false;
    },

    close() {
      this.dialog = false;
      this.$refs.form.resetValidation();
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      });
    },

    closeDelete() {
      this.dialogDelete = false;
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      });
    },

    onFileSelected(event) {
      // event.preventDefault();
      // event.stopPropagation();

      this.selectFile = event;
      console.log("onFileSelected", event);
    },

    deployExcel() {
      console.log("test");
      
      // let formData = new FormData();
      // formData.append('file', this.selectFile);
      // ipcRenderer.send("test", this.selectFile);

      // FilePathWithHeaders.push(this.selectFile)
    },

    save(newProduct) {
      const validateInputs = this.$refs.form.validate(); //boolean

      if (this.editedIndex > -1 && validateInputs) {
        this.editedItem.fecha = this.formatDate(this.date);

        Object.assign(this.desserts[this.editedIndex], this.editedItem);

        ipcRenderer.send("editRow", this.editedIndex);

        this.dialog = false;

        // notifications
        ipcRenderer.on("sendNotifications", (event, args) => {
          this.confirmationAlert.snackbar = args.snackbar;
          this.confirmationAlert.text = args.text;
        });
      } else {
        if (validateInputs) {
          newProduct.fecha = this.formatDate(this.date);
          // this.desserts.push(this.editedItem);

          // ipcRenderer.send("productNewRow", this.editedItem);

          // ipcRenderer.on("test", (event, args) => {
          //   console.log(typeof args)
          // });


          this.dialog = false;

          // notifications
          // ipcRenderer.on("sendNotifications", (event, args) => {
          //   this.confirmationAlert.snackbar = args.snackbar;
          //   this.confirmationAlert.text = args.text;
          // });
        }
      }
    },
  },
};
</script>
