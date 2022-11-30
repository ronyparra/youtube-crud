import dayjs from "../services/days.service";

const vimeo = async (id) => {
  const vimeoUrl = `http://vimeo.com/api/v2/video/${id}.json`;
  const vimeoData = await fetch(vimeoUrl).then((res) => res.json());
  const { description, duration, thumbnail_medium, title } = vimeoData[0];
  const durationMinutes = dayjs(duration * 1000).format("mm:ss");
  return {
    videoId: id,
    embed: `https://player.vimeo.com/video/${id}`,
    img: thumbnail_medium,
    duration: durationMinutes,
    description,
    title,
  };
};

export default vimeo;
