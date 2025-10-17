const escape = (s) => s;

export const renderFeeds = (container, feeds) => {
  container.innerHTML = '';
  if (feeds.length === 0) return;

  const card = document.createElement('div');
  card.className = 'card border-0';
  const body = document.createElement('div');
  body.className = 'card-body';
  const h2 = document.createElement('h2');
  h2.className = 'card-title h4';
  h2.textContent = 'Фиды';
  body.append(h2);
  const list = document.createElement('ul');
  list.className = 'list-group border-0 rounded-0';

  feeds.forEach((f) => {
    const li = document.createElement('li');
    li.className = 'list-group-item border-0 border-end-0';
    const h3 = document.createElement('h3');
    h3.className = 'h6 m-0';
    h3.textContent = escape(f.title);
    const p = document.createElement('p');
    p.className = 'm-0 small text-black-50';
    p.textContent = escape(f.description);
    li.append(h3, p);
    list.append(li);
  });

  card.append(body, list);
  container.append(card);
};

export const renderPosts = (container, posts, state) => {
  container.innerHTML = '';
  if (posts.length === 0) return;

  const card = document.createElement('div');
  card.className = 'card border-0';
  const body = document.createElement('div');
  body.className = 'card-body';
  const h2 = document.createElement('h2');
  h2.className = 'card-title h4';
  h2.textContent = 'Посты';
  body.append(h2);
  const list = document.createElement('ul');
  list.className = 'list-group border-0 rounded-0';

  posts.forEach((p) => {
    const li = document.createElement('li');
    li.className = 'list-group-item d-flex justify-content-between align-items-start border-0 border-end-0';

    const a = document.createElement('a');
    a.setAttribute('href', p.link);
    a.setAttribute('target', '_blank');
    a.setAttribute('rel', 'noopener noreferrer');
    a.dataset.id = p.id;
    a.className = state.ui.read.has(p.id) ? 'fw-normal link-secondary' : 'fw-bold';
    a.textContent = escape(p.title);

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn btn-outline-primary btn-sm';
    btn.dataset.id = p.id;
    btn.dataset.bsToggle = 'modal';
    btn.dataset.bsTarget = '#modal';
    btn.textContent = 'Просмотр';

    li.append(a, btn);
    list.append(li);
  });

  card.append(body, list);
  container.append(card);
};

export const bindPostsInteractions = (container, state) => {
  container.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-id]');
    const link = e.target.closest('a[data-id]');

    // клик по ссылке — помечаем как прочитанное
    if (link) {
      state.ui.read.add(link.dataset.id);
      link.classList.remove('fw-bold');
      link.classList.add('fw-normal', 'link-secondary');
      return;
    }

    if (btn) {
      const id = btn.dataset.id;
      const post = state.posts.find((p) => p.id === id);
      if (!post) return;

      const titleEl = document.querySelector('#modal .modal-title');
      const bodyEl = document.querySelector('#modal .modal-body');
      const full = document.querySelector('#modal .full-article');

      titleEl.textContent = post.title;
      bodyEl.textContent = post.description;
      full.setAttribute('href', post.link);

      state.ui.read.add(id);
      const a = container.querySelector(`a[data-id="${id}"]`);
      if (a) {
        a.classList.remove('fw-bold');
        a.classList.add('fw-normal', 'link-secondary');
      }
    }
  });
};
