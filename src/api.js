import axios from 'axios';

const makeUrl = (url) => {
  const base = 'https://allorigins.hexlet.app/get';
  const u = new URL(base);
  u.searchParams.set('disableCache', 'true');
  u.searchParams.set('url', url);
  return u.toString();
};

export const loadRss = (url) =>
  axios.get(makeUrl(url))
    .then((resp) => resp.data.contents);
