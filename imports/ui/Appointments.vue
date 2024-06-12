<template>
  <v-container fluid class="main-background">
    <v-app-bar app>
      <v-toolbar-title
        >Appointment Booker
        <v-chip color="secondary" size="small" variant="outlined">
          Take-home assignment
        </v-chip></v-toolbar-title
      >
      <div v-if="currentUser">{{ currentUser.username }}</div>
      <v-btn text color="primary" @click="handleLogout">Logout</v-btn>
      <template v-slot:append>
        <v-btn icon="mdi-dots-vertical" @click="isModalOpen = true"></v-btn>
      </template>
    </v-app-bar>

    <v-dialog v-model="isErrorModalVisible" persistent max-width="600px">
      <v-card>
        <v-card-title class="text-h5">Error</v-card-title>
        <v-card-text>{{ errorMessage }}</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="green darken-1"
            text
            @click="isErrorModalVisible = false"
            >Close</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="isSnackbarVisible" :timeout="2000" color="success">
      {{ snackbarMessage }}
    </v-snackbar>

    <v-container fluid>
      <v-row>
        <v-col cols="12" md="5">
          <v-card class="pa-5 mb-4">
            <template v-slot:image>
              <v-img
                gradient="to top right, rgba(19,84,122,.1), rgba(128,208,199,.1)"
              ></v-img>
            </template>
            <v-card-title>
              {{ isEditMode ? "Edit Appointment" : "Create Appointment" }}
              <v-switch
                label="All-day"
                v-model="newAppointment.allDay"
                color="primary"
                class="float-right"
                style="margin-top: -12px"
              ></v-switch>
            </v-card-title>
            <v-card-text>
              <v-row></v-row>
              <v-text-field
                label="First name"
                v-model="newAppointment.firstName"
                :rules="[rules.required, rules.firstNameValid]"
                type="text"
                required
                prepend-icon="mdi-account"
              ></v-text-field>

              <v-text-field
                class="mb- hide-icon"
                label="Last name"
                v-model="newAppointment.lastName"
                :rules="[rules.required, rules.lastNameValid]"
                type="text"
                prepend-icon="mdi-account"
              ></v-text-field>

              <v-date-input
                v-model="newAppointment.date"
                label="Date"
                :min="minDate"
                :rules="[rules.required, rules.dateValid]"
                readonly
              ></v-date-input>
            </v-card-text>

            <v-card-actions>
              <v-btn
                @click="handleAppointmentAction"
                :disabled="!canSave"
                color="primary"
                class="mr-4"
              >
                Save
              </v-btn>
              <v-btn @click="handleCancel" :disabled="!canCancel">Cancel</v-btn>
            </v-card-actions>
          </v-card>
        </v-col>

        <v-col cols="12" md="7">
          <v-card class="pa-5">
            <template v-slot:image>
              <v-img
                gradient="to top right, rgba(19,84,122,.1), rgba(128,208,199,.1)"
              ></v-img>
            </template>
            <v-card-title>Appointments</v-card-title>
            <v-text-field
              v-model="search"
              label="Filter by name"
              prepend-icon="mdi-magnify"
              class="mb-4"
              clearable
            ></v-text-field>
            <!-- 
            v-model:sort-by="sortBy"
            v-model:sort-desc="sortDesc" -->
            <v-data-table
              :headers="headers"
              :items="filteredAppointments"
              class="elevation-1 transparent-table"
            >
              <template v-slot:item.allDay="{ item }">
                <span>{{ item.allDay ? "Yes" : "No" }}</span>
              </template>
              <template v-slot:item.date="{ item }">
                {{ formatDate(item.date) }}
              </template>
              <template v-slot:item.actions="{ item }">
                <v-btn
                  text
                  color="primary"
                  variant="tonal"
                  @click="handleEditAppointment(item)"
                  >Edit</v-btn
                >
              </template>
            </v-data-table>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-container>
</template>

<script>
import { Meteor } from "meteor/meteor";
import { Tracker } from "meteor/tracker";
import { AppointmentsCollection } from "../api/collections/appointments";
import { AppointmentSchema } from "../api/schemas/appointmentsSchema";

export default {
  data() {
    return {
      currentUser: null,
      isErrorModalVisible: false,
      errorMessage: "",
      isSnackbarVisible: false,
      snackbarMessage: "",
      isEditMode: false,
      isValidationEnabled: true,

      search: "",
      newAppointment: {
        firstName: "",
        lastName: "",
        allDay: false,
        date: null,
      },
      initialEditAppointment: {
        firstName: "",
        lastName: "",
      },
      appointments: [],
      trackerComputation: null,

      rules: {
        required: (value) =>
          this.isValidationEnabled ? !!value || "Field is required" : true,
        firstNameValid: (value) => {
          if (!this.isValidationEnabled) return true;
          const firstNameSchema = AppointmentSchema.shape.firstName;
          const result = firstNameSchema.safeParse(value);
          return result.success || result.error.errors[0].message;
        },
        lastNameValid: (value) => {
          if (!this.isValidationEnabled) return true;
          const lastNameSchema = AppointmentSchema.shape.lastName;
          const result = lastNameSchema.safeParse(value);
          return result.success || result.error.errors[0].message;
        },
        dateValid: (value) => {
          if (!value || !this.isValidationEnabled) return true;
          const selectedDateStr = this.formatDate(value);
          const conflict = this.appointments.some((appointment) => {
            if (
              this.isEditMode &&
              this.newAppointment._id === appointment._id
            ) {
              return false;
            }
            const appointmentDateStr = this.formatDate(appointment.date);
            return (
              selectedDateStr === appointmentDateStr &&
              (this.newAppointment.allDay || appointment.allDay)
            );
          });
          return conflict
            ? "All-day: There is already another appointment that day"
            : true;
        },
      },

      headers: [
        { title: "First Name", value: "firstName", sortable: true },
        { title: "Last Name", value: "lastName", sortable: true },
        { title: "Date", value: "date", sortable: true },
        { title: "All-day", value: "allDay", sortable: true },
        { title: "Actions", value: "actions" },
      ],
      sortBy: "date",
      sortDesc: false,
    };
  },
  computed: {
    filteredAppointments() {
      const searchQuery = this.search || "";
      return this.appointments.filter((appointment) => {
        const fullName =
          `${appointment.firstName} ${appointment.lastName}`.toLowerCase();
        return fullName.includes(searchQuery.toLowerCase());
      });
    },
    isNewAppointmentComplete() {
      return (
        this.newAppointment.firstName &&
        this.newAppointment.lastName &&
        this.newAppointment.date
      );
    },
    minDate() {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, "0");
      const day = String(today.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    },
    canSave() {
      const isFirstNameChanged =
        this.newAppointment.firstName !== this.initialEditAppointment.firstName;
      const isLastNameChanged =
        this.newAppointment.lastName !== this.initialEditAppointment.lastName;

      return (
        (this.isNewAppointmentComplete &&
          !this.checkIfDayReserved() &&
          this.rules.dateValid(this.newAppointment.date)) ||
        (this.isEditMode && (isFirstNameChanged || isLastNameChanged))
      );
    },
    canCancel() {
      const defaultValues = {
        firstName: "",
        lastName: "",
        allDay: false,
        date: null,
      };

      return (
        this.newAppointment.firstName !== defaultValues.firstName ||
        this.newAppointment.lastName !== defaultValues.lastName ||
        this.newAppointment.allDay !== defaultValues.allDay ||
        this.newAppointment.date !== defaultValues.date
      );
    },
  },
  created() {
    this.fetchCurrentUser();
    this.loadAppointments();
  },
  mounted() {
    this.fetchCurrentUser();
  },
  beforeDestroy() {
    if (this.trackerComputation) {
      this.trackerComputation.stop();
    }
  },
  methods: {
    handleSaveAppointment(item) {
      if (!this.isNewAppointmentComplete) {
        console.error("All fields are required.");
        return;
      }

      const newAppointment = {
        ...this.newAppointment,
        userId: Meteor.userId(),
      };

      Meteor.call("appointments.insert", newAppointment, (error) => {
        if (error) {
          console.error("Failed to insert appointment:", error);
          this.errorMessage = error.reason || "An unexpected error occurred.";
          this.isErrorModalVisible = true;
          return;
        }
        this.snackbarMessage = "Appointment created successfully";
        this.isSnackbarVisible = true;
        this.resetForm();
        this.isErrorModalVisible = false;
      });
    },
    handleUpdateAppointment() {
      const appointmentId = this.newAppointment._id;
      const { firstName, lastName, date, allDay } = this.newAppointment;
      const appointmentToUpdate = {
        firstName,
        lastName,
        date,
        allDay,
      };
      Meteor.call(
        "appointments.update",
        appointmentId,
        appointmentToUpdate,
        (error, result) => {
          if (error) {
            console.error("Failed to update appointment:", error);
            this.errorMessage = error.reason || "An unexpected error occurred.";
            this.isErrorModalVisible = true;
            return;
          }
          this.snackbarMessage = "Appointment updated successfully";
          this.isSnackbarVisible = true;
          this.isErrorModalVisible = false;
          this.resetForm();
        },
      );
    },
    handleEditAppointment(item) {
      this.newAppointment = { ...item };
      this.initialEditAppointment = {
        firstName: item.firstName,
        lastName: item.lastName,
      };
      this.isEditMode = true;
    },
    handleAppointmentAction() {
      this.isEditMode
        ? this.handleUpdateAppointment()
        : this.handleSaveAppointment();
    },
    handleCancel() {
      this.resetForm();
    },
    resetForm() {
      this.isValidationEnabled = false;
      this.newAppointment = {
        firstName: "",
        lastName: "",
        allDay: false,
        date: null,
      };
      this.$nextTick(() => {
        this.isValidationEnabled = true;
        this.isEditMode = false;
        this.initialEditAppointment = {
          firstName: "",
          lastName: "",
        };
      });
    },
    formatDate(date) {
      if (!date) return "";
      const d = new Date(date);
      const month = `${d.getMonth() + 1}`.padStart(2, "0");
      const day = `${d.getDate()}`.padStart(2, "0");
      const year = d.getFullYear();
      return `${month}/${day}/${year}`;
    },
    validateAllDayConflict(appointments, newAppointment) {
      const newAppointmentDate = this.formatDate(newAppointment.date);
      return appointments.some((appointment) => {
        const appointmentDate = this.formatDate(appointment.date);
        return (
          newAppointmentDate === appointmentDate &&
          (appointment.allDay || newAppointment.allDay)
        );
      });
    },
    checkIfDayReserved() {
      if (!this.newAppointment.allDay || !this.newAppointment.date)
        return false;
      const selectedDateStr = this.formatDate(this.newAppointment.date);
      return this.appointments.some((appointment) => {
        const appointmentDateStr = this.formatDate(appointment.date);
        return (
          selectedDateStr === appointmentDateStr &&
          (this.newAppointment.allDay || appointment.allDay)
        );
      });
    },
    loadAppointments() {
      this.trackerComputation = Tracker.autorun(() => {
        Meteor.subscribe("appointments");
        const appointments = AppointmentsCollection.find({
          userId: Meteor.userId(),
        }).fetch();
        this.appointments = appointments;
        this.sortAppointmentsByDate();
      });
    },
    sortAppointmentsByDate() {
      this.appointments.sort((a, b) => a.date - b.date);
    },
    fetchCurrentUser() {
      this.currentUser = Meteor.user();
    },
    handleLogout() {
      Meteor.logout((err) => {
        if (err) {
          console.error("Logout failed:", err);
          return;
        }
        this.$router.push({ name: "login" });
      });
    },
  },
};
</script>

<style scoped>
.main-background {
  background-color: #dbdbdb;
  height: 100%;
}
.transparent-table {
  background-color: transparent;
}
</style>
