### Hexlet tests and linter status:
[![Actions Status](https://github.com/nofcngway/frontend-project-11/actions/workflows/hexlet-check.yml/badge.svg)](https://github.com/nofcngway/frontend-project-11/actions)    [![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=nofcngway_frontend-project-11&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=nofcngway_frontend-project-11)

# RSS Агрегатор

RSS агрегатор — это веб-приложение для удобного чтения RSS-фидов.

## Описание

Приложение позволяет:
- Добавлять RSS-фиды по URL
- Автоматически обновлять посты каждые 5 секунд
- Просматривать список всех добавленных фидов
- Читать посты с возможностью открытия полной версии
- Отмечать посты как прочитанные
- Просматривать описание поста в модальном окне

## Технологии

- **JavaScript (ES6+)** — основной язык разработки
- **Bootstrap 5** — стилизация интерфейса
- **Axios** — HTTP-запросы
- **on-change** — отслеживание изменений состояния
- **Yup** — валидация форм
- **i18next** — интернационализация
- **Vite** — сборка проекта

## Установка

### Требования
- `Node.js` (версия 14 или выше)
- `npm` или `yarn`

### Шаги установки

1. Клонируйте репозиторий:
```bash
git clone <URL_репозитория>
```

2. Установите зависимости:
```bash
make install
```

3. Запустите приложение в режиме разработки:
```bash
make dev
```

4. Откройте браузер по адресу:
```
http://localhost:5173/
```

## Ссылка на приложение
[RSS Reader](https://frontend-project-11-jet-seven.vercel.app/)