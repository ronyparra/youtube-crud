import { notify } from "@kyvg/vue3-notification";
const message = {
  error: (text) =>
    notify({
      title: "Error",
      text,
      type: "error",
    }),
  success: (text) =>
    notify({
      title: "Success",
      text: text,
      type: "success",
    }),
};

export default message;
