<template>
  <div class="home-page container">
    <section class="home-page__form">
      <label>Añadir nuevo video</label>
      <div class="form">
        <afex-text-field
          v-model="urlVideo"
          :error="error"
          placeholder="Añadir"
        />
        <afex-btn @click="addVideo">Añadir</afex-btn>
      </div>
    </section>
    <section class="home-page__items row">
      <div
        v-for="(item, i) of youtubeVideoList"
        :key="`youtube-video-${i}`"
        class="col-12 col-md-4"
      >
        <div class="img-content">
          <img
            @click="openVideo(item)"
            :src="item.items[0].snippet.thumbnails.high.url"
            :alt="item.items[0].snippet.title"
          />
          <div class="time">
            <span>{{ item.duration }}</span>
          </div>
          <btn-close class="close" @click="openDelete(item)" />
        </div>
      </div>
    </section>
    <AfexDialog v-model="dialogVideo">
      <div class="dialog-video" v-if="dialogVideo">
        <div class="row">
          <div class="col-12 col-md-6 dialog-video__iframe">
            <iframe
              width="420"
              height="315"
              :src="`https://www.youtube.com/embed/${videoSelected.value.items[0].id}`"
            >
            </iframe>
          </div>
          <div class="col-12 col-md-6">
            <div class="dialog-video__text">
              <h3>{{ videoSelected.value.items[0].snippet.title }}</h3>
              <div>{{ videoSelected.value.items[0].snippet.description }}</div>
            </div>
          </div>
        </div>
      </div>
    </AfexDialog>
    <AfexDialog v-model="dialogDelete" class="dialog-delete">
      <div>
        <h3>¿Seguro que quieres eliminar este video?</h3>
        <div class="dialog-delete__actions">
          <AfexBtn text @click="dialogDelete = false">Cancelar</AfexBtn>
          <AfexBtn @click="deleteVideo">Eliminar</AfexBtn>
        </div>
      </div>
    </AfexDialog>
  </div>
</template>
<script setup>
import { firebase } from "../services/firebase";
import { notify } from "@kyvg/vue3-notification";

import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import { ref, reactive, computed, onMounted } from "vue";
import AfexBtn from "../components/AfexBtn.vue";
import AfexTextField from "../components/AfexTextField.vue";
import AfexDialog from "../components/AfexDialog.vue";
import BtnClose from "../components/BtnClose.vue";

dayjs.extend(duration);

const urlVideo = ref();
const error = ref(null);
const youtubeId = ref(null);
const dialogVideo = ref(false);
const dialogDelete = ref(false);
const videoSelected = reactive({});
const youtubeVideoList = reactive([]);

onMounted(() => {
  loadVideos();
});

const isValidYoutubeUrl = (value) => {
  const regex =
    /(youtu.*be.*)\/(watch\?v=|embed\/|v|shorts|)(.*?((?=[&#?])|$))/gm;
  return regex.test(value);
};

const hasYoutubeId = (value) => {
  return !!value.split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/)[2];
};

const getYoutubeId = (url) => {
  url = url.split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
  return url[2] !== undefined ? url[2].split(/[^0-9a-z_-]/i)[0] : url[0];
};

const isValid = () => {
  error.value = "";
  if (!isValidYoutubeUrl(urlVideo.value)) {
    error.value = "Ingrese una url de youtube valida";
  } else {
    if (!hasYoutubeId(urlVideo.value)) {
      error.value = "Ingrese una url con un ID valido";
    }
  }
  return !error.value;
};

const youtubeUrl = computed(
  () =>
    `https://www.googleapis.com/youtube/v3/videos?id=${youtubeId.value}&key=${
      import.meta.env.VITE_YOUTUBE_API_KEY
    }`
);

const loadVideos = async () => {
  try {
    const data = await firebase.getVideos();
    youtubeVideoList.splice(0);
    if (data) {
      data.forEach((item) => {
        youtubeVideoList.push(item);
      });
    }
  } catch (e) {
    console.error("Error getting documents: ", e);
    notify({
      title: "Error",
      text: "No se pudo cargar los videos",
      type: "error",
    });
  }
};

const saveVideo = async (data) => {
  try {
    firebase.saveVideo(data);
    loadVideos();
    urlVideo.value = "";
    notify({
      title: "Success",
      text: "El video se agregado correctamente",
      type: "success",
    });
  } catch (e) {
    console.error("Error add document: ", e);
    notify({
      title: "Error",
      text: "Ocurrio un error al guardar el video",
      type: "error",
    });
  }
};

const openDelete = async (video) => {
  dialogDelete.value = true;
  videoSelected.value = JSON.parse(JSON.stringify(video));
};

const deleteVideo = async () => {
  try {
    await firebase.deleteVideo(videoSelected.value.id);
    loadVideos();
    dialogDelete.value = false;
    notify({
      title: "Success",
      text: "El video se eliminado correctamente",
      type: "success",
    });
  } catch (e) {
    console.error("Error delet3 document: ", e);
    notify({
      title: "Error",
      text: "Ocurrio un error al eliminar el video",
      type: "error",
    });
  }
};

const openVideo = (video) => {
  videoSelected.value = JSON.parse(JSON.stringify(video));
  dialogVideo.value = true;
};

const isRepeat = (data) =>
  youtubeVideoList.find(({ items }) => items[0].id === data.items[0].id);

const addVideo = async () => {
  if (!isValid()) return;
  youtubeId.value = getYoutubeId(urlVideo.value);
  const snippet = `${youtubeUrl.value}&part=snippet`;
  const contentDetails = `${youtubeUrl.value}&part=contentDetails`;

  try {
    const dataSnippet = await fetch(snippet).then((res) => res.json());
    if (isRepeat(dataSnippet)) {
      return notify({
        title: "Error",
        text: "Este video ya existe",
        type: "error",
      });
    }

    const dataContentDetails = await fetch(contentDetails).then((res) =>
      res.json()
    );
    const auxDuration = dataContentDetails.items[0].contentDetails.duration;
    const duration =
      dayjs.duration(auxDuration).asHours() > 1
        ? "+01:00:00"
        : dayjs(dayjs.duration(auxDuration).$ms).format("mm:ss");

    saveVideo({
      ...dataSnippet,
      duration,
    });
  } catch (error) {
    console.log(`Error => ${error}`);
    notify({
      title: "Error",
      text: "No se pudo obtener el video, vuelva a ingresar el link e intente nuevamente",
      type: "error",
    });
  }
};
</script>
