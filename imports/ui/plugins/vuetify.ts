import "vuetify/styles";
import { aliases, mdi } from "vuetify/iconsets/mdi";
import { VDateInput } from "vuetify/labs/VDateInput";
import { createVuetify } from "vuetify";

export default createVuetify({
  components: {
    VDateInput,
  },

  theme: {
    defaultTheme: "light",
  },
  icons: {
    defaultSet: "mdi",
    aliases,
    sets: {
      mdi,
    },
  },
});
