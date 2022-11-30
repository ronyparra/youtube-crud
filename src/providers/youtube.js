import dayjs from "../services/days.service";

const youtube = async (id) => {
  const youtubeUrl = `https://www.googleapis.com/youtube/v3/videos?id=${id}&key=${
    import.meta.env.VITE_YOUTUBE_API_KEY
  }`;
  const snippet = `${youtubeUrl}&part=snippet`;
  const contentDetails = `${youtubeUrl}&part=contentDetails`;
  const dataSnippet = await fetch(snippet).then((res) => res.json());
  const dataContentDetails = await fetch(contentDetails).then((res) =>
    res.json()
  );
  const auxDuration = dataContentDetails.items[0].contentDetails.duration;
  const duration =
    dayjs.duration(auxDuration).asHours() > 1
      ? "+01:00:00"
      : dayjs(dayjs.duration(auxDuration).$ms).format("mm:ss");

  return {
    videoId: id,
    embed: `https://www.youtube.com/embed/${id}`,
    img: dataSnippet.items[0].snippet.thumbnails.high.url,
    duration,
    description: dataSnippet.items[0].snippet.description,
    title: dataSnippet.items[0].snippet.title,
  };
};

export default youtube;
