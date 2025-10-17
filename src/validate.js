import * as yup from 'yup';
import i18next from 'i18next';
import ru from './locales/locales.js';

export default () => {
  const i18n = i18next.createInstance();
  i18n.init({
    lng: 'ru',
    debug: false,
    resources: { ru },
  }).then(() => {
    renderUiTexts(i18n);
    initForm(i18n);
  });
};

function renderUiTexts(i18n) {
  const t = i18n.t.bind(i18n);

  const h1 = document.querySelector('h1.display-3');
  const lead = document.querySelector('.lead');
  const label = document.querySelector('label[for="url-input"]');
  const input = document.getElementById('url-input');
  const addBtn = document.querySelector('button[aria-label="add"]');
  const example = document.querySelector('.text-secondary');
  const modalReadFull = document.querySelector('#modal .full-article');
  const modalClose = document.querySelector('#modal .btn-secondary');

  if (h1) h1.textContent = t('title');
  if (lead) lead.textContent = t('description');
  if (label) label.textContent = t('form.label');
  if (input) input.setAttribute('placeholder', t('form.placeholder'));
  if (addBtn) addBtn.textContent = t('form.button');
  if (example) example.textContent = t('example');
  if (modalReadFull) modalReadFull.textContent = t('modal.readFull', 'Читать полностью');
  if (modalClose) modalClose.textContent = t('modal.close', 'Закрыть');
}

function initForm(i18n) {
  const t = i18n.t.bind(i18n);

  yup.setLocale({
    string: { url: t('feedback.errors.invalidUrl') },
    mixed: { required: t('feedback.errors.required') },
  });

  const form = document.querySelector('.rss-form');
  const input = form.querySelector('input');
  const feedback = document.querySelector('.feedback');
  const feedsList = []; // список добавленных фидов

  const schema = yup.string().trim().url().required();

  const showError = (message) => {
    input.classList.add('is-invalid');
    feedback.textContent = message;
    feedback.classList.remove('text-success');
    feedback.classList.add('text-danger');
  };

  const showSuccess = (message) => {
    input.classList.remove('is-invalid');
    feedback.textContent = message;
    feedback.classList.remove('text-danger');
    feedback.classList.add('text-success');
  };

  const clearFeedback = () => {
    feedback.textContent = '';
    feedback.classList.remove('text-danger', 'text-success');
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    clearFeedback();

    const raw = input.value.trim();

    schema.validate(raw)
      .then((validUrl) => {
        let normalized = validUrl;
        try { normalized = new URL(validUrl).toString(); } catch {}
        if (feedsList.includes(normalized)) {
          throw new Error(t('feedback.errors.duplicate'));
        }
        return normalized;
      })
      .then((normalized) => {
        feedsList.push(normalized);
        showSuccess(t('feedback.success', 'RSS успешно добавлен'));
        form.reset();
        input.focus();
      })
      .catch((err) => {
        showError(err.message);
      });
  });
}
