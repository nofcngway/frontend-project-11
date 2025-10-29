// eslint-disable-next-line import/no-unresolved
import onChange from 'on-change';
import * as yup from 'yup';
import i18next from 'i18next';
import ru from './locales/locales.js';
import loadRss from './api.js';
import parse from './parser.js';
import { renderFeeds, renderPosts, bindPostsInteractions } from './view.js';

const genId = () => crypto.randomUUID();

function renderAllTexts(i18n) {
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const { i18n: key } = el.dataset;
    el.replaceChildren(document.createTextNode(i18n.t(key)));
  });

  const input = document.getElementById('url-input');
  if (input) input.setAttribute('placeholder', i18n.t('form.placeholder'));
  document.title = i18n.t('title');
}

const knownLinksByFeed = (state, feedId) => new Set(
  state.posts.filter((p) => p.feedId === feedId).map((p) => p.link),
);

const refreshFeed = (state, feed) => loadRss(feed.url)
  .then((xml) => parse(xml))
  .then(({ posts }) => {
    const known = knownLinksByFeed(state, feed.id);
    const fresh = posts
      .filter((p) => !known.has(p.link))
      .map((p) => ({
        id: genId(),
        feedId: feed.id,
        title: p.title,
        link: p.link,
        description: p.description,
      }));

    if (fresh.length) {
      // eslint-disable-next-line no-param-reassign
      state.posts = [...fresh, ...state.posts];
    }
  })
  .catch((err) => {
    console.warn('Feed refresh failed:', err);
  });

const startPolling = (state) => {
  const POLL_INTERVAL_MS = 5000;

  const tick = () => {
    const jobs = state.feeds.map((f) => refreshFeed(state, f));
    Promise.all(jobs)
      .finally(() => {
        setTimeout(tick, POLL_INTERVAL_MS);
      });
  };
  setTimeout(tick, POLL_INTERVAL_MS);
};

export default () => {
  const i18n = i18next.createInstance();

  i18n.init({ lng: 'ru', debug: false, resources: { ru } }).then(() => {
    renderAllTexts(i18n);

    yup.setLocale({
      string: { url: i18n.t('feedback.errors.invalidUrl') },
      mixed: { required: i18n.t('feedback.errors.required') },
    });

    const form = document.querySelector('.rss-form');
    const input = form.querySelector('input');
    const feedback = document.querySelector('.feedback');
    const feedsBox = document.querySelector('.feeds');
    const postsBox = document.querySelector('.posts');

    const state = onChange({
      feeds: [],
      posts: [],
      urls: new Set(),
      ui: { read: new Set() },
    }, (path, value) => {
      if (path === 'feeds') renderFeeds(feedsBox, value);
      if (path === 'posts') renderPosts(postsBox, value, state);
    });

    bindPostsInteractions(postsBox, state);

    startPolling(state);

    const setError = (text) => {
      input.classList.add('is-invalid');
      feedback.textContent = text;
      feedback.classList.remove('text-success');
      feedback.classList.add('text-danger');
    };
    const setSuccess = (text) => {
      input.classList.remove('is-invalid');
      feedback.textContent = text;
      feedback.classList.remove('text-danger');
      feedback.classList.add('text-success');
    };
    const clearMsg = () => {
      feedback.textContent = '';
      feedback.classList.remove('text-danger', 'text-success');
    };

    const schema = yup.string().trim().url().required();

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      clearMsg();

      const raw = input.value.trim();

      schema.validate(raw)
        .then((validated) => {
          let normalized;
          try {
            normalized = new URL(validated).toString();
          } catch (err) {
            normalized = validated;
          }
          if (state.urls.has(normalized)) {
            throw new Error(i18n.t('feedback.errors.duplicate'));
          }
          return normalized;
        })
        .then((normalized) => loadRss(normalized)
          .then((xml) => ({ normalized, xml }))
          .catch((loadError) => {
            if (loadError.isAxiosError) {
              const error = new Error('networkError');
              error.isNetworkError = true;
              error.originalError = loadError;
              throw error;
            }
            const error = new Error('invalidRss');
            error.isParseError = true;
            error.originalError = loadError;
            throw error;
          }))
        .then(({ normalized, xml }) => {
          const { feed, posts } = parse(xml);

          state.urls.add(normalized);
          const feedId = genId();
          state.feeds = [{ id: feedId, url: normalized, ...feed }, ...state.feeds];

          const preparedPosts = posts.map((p) => ({
            id: genId(),
            feedId,
            title: p.title,
            link: p.link,
            description: p.description,
          }));
          state.posts = [...preparedPosts, ...state.posts];

          setSuccess(i18n.t('feedback.success', 'RSS успешно загружен'));
          form.reset();
          input.focus();
        })
        .catch((err) => {
          if (err.isNetworkError || err.isAxiosError) {
            setError(i18n.t('feedback.errors.network', 'Ошибка сети'));
            return;
          }

          if (err.isParseError || err.message === 'invalidRss') {
            setError(i18n.t('feedback.errors.invalidRss'));
            return;
          }

          setError(err.message);
        });
    });
  });
};