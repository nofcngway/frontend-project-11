/* eslint-disable no-param-reassign */
const createElement = (tag, options = {}) => {
  const el = document.createElement(tag);

  if (options.className) {
    el.className = options.className;
  }

  if (options.textContent) {
    el.textContent = options.textContent;
  }

  if (options.href) {
    el.href = options.href;
  }

  if (options.target) {
    el.target = options.target;
  }

  if (options.rel) {
    el.rel = options.rel;
  }

  if (options.type) {
    el.type = options.type;
  }

  if (options.dataset) {
    Object.entries(options.dataset).forEach(([key, value]) => {
      el.dataset[key] = value;
    });
  }

  return el;
};

const createCard = (title) => {
  const card = createElement('div', { className: 'card border-0' });
  const body = createElement('div', { className: 'card-body' });
  const h2 = createElement('h2', {
    className: 'card-title h4',
    textContent: title,
  });

  body.append(h2);

  const list = createElement('ul', {
    className: 'list-group border-0 rounded-0',
  });

  return { card, body, list };
};

export const renderFeeds = (container, feeds) => {
  container.innerHTML = '';
  if (!feeds.length) return;

  const { card, body, list } = createCard('Фиды');

  feeds.forEach((feed) => {
    const li = createElement('li', {
      className: 'list-group-item border-0 border-end-0',
    });

    const title = createElement('h3', {
      className: 'h6 m-0',
      textContent: feed.title,
    });

    const description = createElement('p', {
      className: 'm-0 small text-black-50',
      textContent: feed.description,
    });

    li.append(title, description);
    list.append(li);
  });

  card.append(body, list);
  container.append(card);
};

export const renderPosts = (container, posts, state) => {
  container.innerHTML = '';
  if (!posts.length) return;

  const { card, body, list } = createCard('Посты');

  posts.forEach((post) => {
    const li = createElement('li', {
      className: 'list-group-item d-flex justify-content-between align-items-start border-0 border-end-0',
    });

    const isRead = state.ui.read.has(post.id);

    const link = createElement('a', {
      href: post.link,
      target: '_blank',
      rel: 'noopener noreferrer',
      className: isRead ? 'fw-normal link-secondary' : 'fw-bold',
      textContent: post.title,
      dataset: { id: post.id },
    });

    const button = createElement('button', {
      type: 'button',
      className: 'btn btn-outline-primary btn-sm',
      textContent: 'Просмотр',
      dataset: {
        id: post.id,
        bsToggle: 'modal',
        bsTarget: '#modal',
      },
    });

    li.append(link, button);
    list.append(li);
  });

  card.append(body, list);
  container.append(card);
};

const markAsRead = (container, postId) => {
  const link = container.querySelector(`a[data-id="${postId}"]`);
  if (link) {
    link.classList.remove('fw-bold');
    link.classList.add('fw-normal', 'link-secondary');
  }
};

const showModal = (post) => {
  const titleEl = document.querySelector('#modal .modal-title');
  const bodyEl = document.querySelector('#modal .modal-body');
  const linkEl = document.querySelector('#modal .full-article');

  if (titleEl) titleEl.textContent = post.title;
  if (bodyEl) bodyEl.textContent = post.description;
  if (linkEl) linkEl.href = post.link;
};

export const bindPostsInteractions = (container, state) => {
  container.addEventListener('click', (e) => {
    const link = e.target.closest('a[data-id]');
    const button = e.target.closest('button[data-id]');

    if (link) {
      const { id } = link.dataset;
      state.ui.read.add(id);
      markAsRead(container, id);
      return;
    }

    if (button) {
      const { id } = button.dataset;
      const post = state.posts.find((p) => p.id === id);
      if (!post) return;

      showModal(post);
      state.ui.read.add(id);
      markAsRead(container, id);
    }
  });
};
