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
      <v-btn text color="primary" @click="logout">Logout</v-btn>
      <template v-slot:append>
        <v-btn icon="mdi-dots-vertical" @click="isModalOpen = true"></v-btn>
      </template>
    </v-app-bar>

    <v-dialog v-model="showErrorModal" persistent max-width="600px">
      <v-card>
        <v-card-title class="text-h5">Error</v-card-title>
        <v-card-text>{{ errorMessage }}</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="green darken-1" text @click="showErrorModal = false"
            >Close</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar" :timeout="2000" color="success">
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
                @click="handleAppointmentClick"
                :disabled="!ableToSave"
                color="primary"
                class="mr-4"
              >
                Save
              </v-btn>
              <v-btn @click="cancel" :disabled="!ableToCancel">Cancel</v-btn>
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
                  @click="editAppointment(item)"
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
      search: "",
      newAppointment: {
        firstName: "",
        lastName: "",
        allDay: false,
        date: null,
      },
      currentUser: null,
      appointments: [],
      showErrorModal: false,
      showRequirementModal: false,
      errorMessage: "",
      headers: [
        { title: "First Name", value: "firstName", sortable: true },
        { title: "Last Name", value: "lastName", sortable: true },
        { title: "Date", value: "date", sortable: true },
        { title: "All-day", value: "allDay", sortable: true },
        { title: "Actions", value: "actions" },
      ],
      sortBy: "date",
      sortDesc: false,
      trackerComputation: null,
      isEditMode: false,
      snackbar: false,
      snackbarMessage: "",
      validationEnabled: true,
      rules: {
        required: (value) =>
          this.validationEnabled ? !!value || "Field is required" : true,
        firstNameValid: (value) => {
          if (!this.validationEnabled) return true;
          const firstNameSchema = AppointmentSchema.shape.firstName;
          const result = firstNameSchema.safeParse(value);
          return result.success || result.error.errors[0].message;
        },
        lastNameValid: (value) => {
          if (!this.validationEnabled) return true;
          const lastNameSchema = AppointmentSchema.shape.lastName;
          const result = lastNameSchema.safeParse(value);
          return result.success || result.error.errors[0].message;
        },
        dateValid: (value) => {
          if (!value || !this.validationEnabled) return true;
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
    minDate() {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, "0");
      const day = String(today.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    },
    newAppointmentValid() {
      return (
        this.newAppointment.firstName &&
        this.newAppointment.lastName &&
        this.newAppointment.date
      );
    },
    ableToSave() {
      return (
        this.newAppointmentValid &&
        !this.isDayReserved() &&
        this.rules.dateValid(this.newAppointment.date) === true
      );
    },
    ableToCancel() {
      const defaultValues = {
        firstName: "",
        lastName: "",
        allDay: false,
        date: null,
      };

      return !(
        this.newAppointment.firstName === defaultValues.firstName &&
        this.newAppointment.lastName === defaultValues.lastName &&
        this.newAppointment.allDay === defaultValues.allDay &&
        this.newAppointment.date === defaultValues.date
      );
    },
  },
  created() {
    this.getCurrentUser();
    this.fetchAppointments();
  },

  beforeDestroy() {
    if (this.trackerComputation) {
      this.trackerComputation.stop();
    }
  },

  methods: {
    saveAppointment(item) {
      if (!this.newAppointmentValid) {
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
          this.showErrorModal = true;
        } else {
          this.snackbarMessage = "Appointment created successfully";
          this.snackbar = true;
          this.resetForm();
          this.showErrorModal = false;
        }
      });
    },
    editAppointment(item) {
      this.newAppointment = { ...item };
      this.isEditMode = true;
      console.log("Edit appointment:", item);
    },

    handleAppointmentClick() {
      this.isEditMode ? this.updateAppointment() : this.saveAppointment();
    },

    updateAppointment() {
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
            this.showErrorModal = true;
          } else {
            this.snackbarMessage = "Appointment updated successfully";
            this.snackbar = true;
            this.showErrorModal = false;
            this.resetForm();
          }
        },
      );
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
    cancel() {
      this.resetForm();
    },
    logout() {
      Meteor.logout((err) => {
        if (err) {
          console.error("Logout failed:", err);
        } else {
          console.log("Logged out successfully");
          this.$router.push({ name: "login" });
        }
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
    isDayReserved() {
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
    fetchAppointments() {
      this.trackerComputation = Tracker.autorun(() => {
        Meteor.subscribe("appointments");
        const appointments = AppointmentsCollection.find({
          userId: Meteor.userId(),
        }).fetch();
        this.appointments = appointments;
        this.sortAppointmentsByDateAsc();
      });
    },
    sortAppointmentsByDateAsc() {
      this.appointments.sort((a, b) => a.date - b.date);
    },
    getCurrentUser() {
      this.currentUser = Meteor.user();
    },
    resetForm() {
      this.validationEnabled = false;
      this.newAppointment = {
        firstName: "",
        lastName: "",
        allDay: false,
        date: null,
      };
      this.$nextTick(() => {
        this.validationEnabled = true;
        this.isEditMode = false;
      });
    },
  },
  mounted() {
    this.getCurrentUser();
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
