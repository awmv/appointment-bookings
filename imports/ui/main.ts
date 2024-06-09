import { createApp } from "vue";
import App from "./App.vue";
import { Meteor } from "meteor/meteor";
import { VueMeteor } from "vue-meteor-tracker";
import { router } from "./router";
import vuetify from "./plugins/vuetify";

Meteor.startup(() => {
  createApp(App).use(router).use(vuetify).use(VueMeteor).mount("#app");
});
