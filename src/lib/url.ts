// Link project dari DB kadang tanpa protokol ("contoh.com") — tambahkan https://.
export const formatUrl = (url: string) => {
  if (!url) return "#";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `https://${url}`;
};
