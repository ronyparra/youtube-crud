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
        <afex-btn @click="submit()">Añadir</afex-btn>
      </div>
    </section>
    <section class="home-page__items row">
      <div
        v-for="(item, i) of videoList"
        :key="`youtube-video-${i}`"
        class="col-12 col-md-4"
      >
        <div class="img-content">
          <img @click="openVideo(item)" :src="item.img" :alt="item.title" />
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
          <div class="col-12 col-md-6">
            <div class="dialog-video__iframe">
              <iframe
                width="460"
                height="315"
                :src="videoSelected.value.embed"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                class="video"
                allowfullscree
              >
              </iframe>
            </div>
          </div>
          <div class="col-12 col-md-6">
            <div class="dialog-video__text">
              <h3>{{ videoSelected.value.title }}</h3>
              <div v-html="videoSelected.value.description"></div>
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
    <div>
      <form action="" class="laia-capture-form">
        <!-- Nombre -->
        <div>
          <label for="name-captured">Nombre</label>
          <input
            id="name-captured"
            type="text"
            name="Nombre"
            class="laia-capture-field"
            data-laia-field-map="fullname"
          />
        </div>
        <!-- Telefono -->
        <div>
          <label for="phone-captured">Teléfono</label>
          <input
            id="phone-captured"
            type="text"
            name="Telefono"
            class="laia-capture-field"
            data-laia-field-map="phone"
          />
        </div>
        <!-- TipoCliente -->
        <div>
          <label for="customer-captured">Tipo de cliente</label>
          <select
            id="customer-captured"
            name="TipoCliente"
            class="laia-capture-field"
          >
            <option value="particular">particular</option>
            <option value="empresa">empresa</option>
          </select>
        </div>
        <!-- Horario -->
        <div>
          <div>Horario</div>
          <input
            id="schedule-captured-m"
            value="m"
            type="radio"
            name="Horario"
            class="laia-capture-field"
          />
          <label for="schedule-captured-m">Mañana</label>
          <br />
          <input
            id="schedule-captured-t"
            value="t"
            type="radio"
            name="Horario"
            class="laia-capture-field"
          />
          <label for="schedule-captured-t">Tarde</label>
        </div>
        <!-- AceptaTerminos -->
        <div>
          <input
            id="terms-captured"
            type="checkbox"
            name="policy"
            data-laia-field-map="laia-policy"
            class="laia-capture-field laia-consent-capture"
          />
          <label for="terms-captured">Acepto los terminos y condiciones</label>
        </div>
        <!-- Submit -->
        <div>
          <button
            class="laia-capture-submit"
            type="button"
            click="event => console.log(event)"
          >
            Enviar
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
<script setup>
import { firebase } from "../services/firebase";
import youtubeProvider from "../providers/youtube";
import vimeoProvider from "../providers/vimeo";
import message from "../services/message.service";

import { ref, reactive, onMounted } from "vue";
import AfexBtn from "../components/AfexBtn.vue";
import AfexTextField from "../components/AfexTextField.vue";
import AfexDialog from "../components/AfexDialog.vue";
import BtnClose from "../components/BtnClose.vue";

const [YOUTUBE, VIMEO, DEFAULT] = ["YOUTUBE", "VIMEO", "DEFAULT"];
const notFound =
  "No se pudo obtener el video, vuelva a ingresar el link e intente nuevamente";

const urlVideo = ref();
const error = ref(null);
const dialogVideo = ref(false);
const dialogDelete = ref(false);
const videoSelected = reactive({});
const videoList = reactive([]);

onMounted(() => {
  loadVideos();
});

const getVideoData = (url) => {
  let type = DEFAULT;
  const urlData = url?.match(
    /(youtube\.com\/watch\?v=|youtu.be\/|vimeo\.com\/)(.+)/
  );
  if (url.includes("youtu")) {
    type = YOUTUBE;
  }
  if (url.includes("vimeo")) {
    type = VIMEO;
  }

  return {
    id: urlData?.length ? urlData[2] : null,
    type,
  };
};

const submit = () => {
  if (!urlVideo.value) return (error.value = "Ingrese un link");
  error.value = "";
  const { id, type } = getVideoData(urlVideo.value);

  const providers = {
    YOUTUBE: () =>
      youtubeProvider(id)
        .then((data) => {
          saveVideo(data);
        })
        .catch(() => message.error(notFound)),
    VIMEO: () =>
      vimeoProvider(id)
        .then((data) => {
          saveVideo(data);
        })
        .catch(() => message.error(notFound)),
    DEFAULT: () => message.error("Ingrese un URL valida"),
  };
  providers[type]();
};

const loadVideos = () =>
  firebase
    .getVideos()
    .then((data) => {
      videoList.splice(0);
      data.forEach((item) => {
        videoList.push(item);
      });
    })
    .catch(() => message.error("No se pudo cargar los videos"));

const saveVideo = async (data) => {
  if (videoList.find(({ videoId }) => videoId === data.videoId))
    return message.error("Este video ya existe");
  firebase
    .saveVideo(data)
    .then(() => {
      loadVideos();
      urlVideo.value = "";
      message.success("El video se agregado correctamente");
    })
    .catch(() => message.error("Ocurrio un error al guardar el video"));
};

const openDelete = async (video) => {
  dialogDelete.value = true;
  videoSelected.value = JSON.parse(JSON.stringify(video));
};

const deleteVideo = async () =>
  firebase
    .deleteVideo(videoSelected.value.id)
    .then(() => {
      loadVideos();
      dialogDelete.value = false;
      message.success("El video se eliminado correctamente");
    })
    .catch(() => message.error("Ocurrio un error al eliminar el video"));

const openVideo = (video) => {
  videoSelected.value = JSON.parse(JSON.stringify(video));
  dialogVideo.value = true;
};
</script>
