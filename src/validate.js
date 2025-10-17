import * as yup from 'yup';
import i18next from 'i18next';
import ru from './locales/locales.js';
import { loadRss } from './api.js';
import parse from './parser.js';
import { renderFeeds, renderPosts, bindPostsInteractions } from './view.js';
import onChange from 'on-change';

const genId = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

function renderAllTexts(i18n) {
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.dataset.i18n;
    // если нужен атрибут, можно расширить синтаксис, но нам хватает textContent
    el.textContent = i18n.t(key);
  });

  // placeholder инпута и title вкладки — отдельные ключи
  const input = document.getElementById('url-input');
  if (input) input.setAttribute('placeholder', i18n.t('form.placeholder'));

  document.title = i18n.t('title');
}

export default () => {
  const i18n = i18next.createInstance();

  i18n.init({ lng: 'ru', debug: false, resources: { ru } }).then(() => {
    // 1) РЕНДЕР ВСЕХ UI-ТЕКСТОВ ЧЕРЕЗ data-i18n
    renderAllTexts(i18n);

    // 2) yup → i18n
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
          let normalized = validated;
          try { normalized = new URL(validated).toString(); } catch {}
          if (state.urls.has(normalized)) {
            throw new Error(i18n.t('feedback.errors.duplicate'));
          }
          return normalized;
        })
        .then((normalized) => loadRss(normalized)
          .then((xml) => ({ normalized, xml })))
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

          setSuccess(i18n.t('feedback.success', 'RSS успешно добавлен'));
          form.reset();
          input.focus();
        })
        .catch((err) => {
          if (err.isParseError || err.message === 'invalidRss') {
            setError(i18n.t('feedback.errors.invalidRss'));
            return;
          }
          if (err.isAxiosError) {
            setError(i18n.t('feedback.errors.network', 'Ошибка сети'));
            return;
          }
          setError(err.message);
        });
    });
  });
};
