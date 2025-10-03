import * as yup from 'yup';
import i18next from 'i18next';
import ru from './locales/locales.js'

export default () => {
  const i18nextInstance = i18next.createInstance()
  i18nextInstance.init({
    lng: 'ru',
    debug: false,
    resources: {
      ru,
    },
  });

  yup.setLocale({
    string: {
      url: i18nextInstance.t('feedback.errors.invalidUrl'),
    },
    mixed: {
      required: i18nextInstance.t('feedback.errors.required'),
    },
  });

  const form = document.querySelector('.rss-form');
  const input = form.querySelector('input');
  const feedback = document.querySelector('.feedback');
  const feedsList = []; // Массив добавленных фидов

  const showError = (message) => {
    input.classList.add('is-invalid');
    feedback.textContent = message;
    feedback.classList.add('text-danger');
  };

  const clearError = () => {
    input.classList.remove('is-invalid');
    feedback.textContent = '';
    feedback.classList.remove('text-danger');
  };

  const schema = yup.string()
    .url()
    .required();

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const url = input.value.trim();

    clearError();

    schema.validate(url)
      .then((validUrl) => {
        if (feedsList.includes(validUrl)) {
          throw new Error(i18nextInstance.t('feedback.errors.duplicate'));
        }
        return validUrl;
      })
      .then((validUrl) => {
        feedsList.push(validUrl);
        input.value = '';
        input.focus();
      })
      .catch((error) => {
        showError((error.message));
      });
  });
};
