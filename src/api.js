import axios from 'axios';

const makeUrl = (url) => {
  const base = 'https://allorigins.hexlet.app/get';
  const u = new URL(base);
  u.searchParams.set('disableCache', 'true');
  u.searchParams.set('url', url);
  return u.toString();
};

export default (url) => axios.get(makeUrl(url))
  .then((resp) => {
    const { contents, status } = resp.data ?? {};
    if (status && typeof status.http_code === 'number' && status.http_code !== 200) {
      // ВАЖНО: не делаем isAxiosError — это не сетевой обрыв, а «целевой ресурс не ок»
      const err = new Error(`Proxy HTTP ${status.http_code}`);
      err.isProxyHttpError = true; // пометим явно (не обязательно, но удобно)
      throw err;
    }
    return contents;
  });
