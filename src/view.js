const createCard = (title) => {
  const card = document.createElement('div')
  card.className = 'card border-0'

  const body = document.createElement('div')
  body.className = 'card-body'

  const h2 = document.createElement('h2')
  h2.className = 'card-title h4'
  h2.textContent = title

  body.append(h2)

  const list = document.createElement('ul')
  list.className = 'list-group border-0 rounded-0'

  return { card, body, list }
}

export const renderFeeds = (container, feeds) => {
  container.innerHTML = ''
  if (!feeds.length) return

  const { card, body, list } = createCard('Фиды')

  feeds.forEach((feed) => {
    const li = document.createElement('li')
    li.className = 'list-group-item border-0 border-end-0'

    const title = document.createElement('h3')
    title.className = 'h6 m-0'
    title.textContent = feed.title

    const description = document.createElement('p')
    description.className = 'm-0 small text-black-50'
    description.textContent = feed.description

    li.append(title, description)
    list.append(li)
  })

  card.append(body, list)
  container.append(card)
}

export const renderPosts = (container, posts, state) => {
  container.innerHTML = ''
  if (!posts.length) return

  const { card, body, list } = createCard('Посты')

  posts.forEach((post) => {
    const li = document.createElement('li')
    li.className = 'list-group-item d-flex justify-content-between align-items-start border-0 border-end-0'

    const isRead = state.ui.read.has(post.id)

    const link = document.createElement('a')
    link.setAttribute('href', post.link)
    link.setAttribute('target', '_blank')
    link.setAttribute('rel', 'noopener noreferrer')
    link.className = isRead ? 'fw-normal link-secondary' : 'fw-bold'
    link.textContent = post.title
    link.dataset.id = post.id

    const button = document.createElement('button')
    button.setAttribute('type', 'button')
    button.className = 'btn btn-outline-primary btn-sm'
    button.textContent = 'Просмотр'
    button.dataset.id = post.id
    button.dataset.bsToggle = 'modal'
    button.dataset.bsTarget = '#modal'

    li.append(link, button)
    list.append(li)
  })

  card.append(body, list)
  container.append(card)
}

const markAsRead = (container, postId) => {
  const link = container.querySelector(`a[data-id="${postId}"]`)
  if (link) {
    link.classList.remove('fw-bold')
    link.classList.add('fw-normal', 'link-secondary')
  }
}

const showModal = (post) => {
  const titleEl = document.querySelector('#modal .modal-title')
  const bodyEl = document.querySelector('#modal .modal-body')
  const linkEl = document.querySelector('#modal .full-article')

  if (titleEl) titleEl.textContent = post.title
  if (bodyEl) bodyEl.textContent = post.description
  if (linkEl) linkEl.setAttribute('href', post.link)
}

export const bindPostsInteractions = (container, state) => {
  container.addEventListener('click', (e) => {
    const link = e.target.closest('a[data-id]')
    const button = e.target.closest('button[data-id]')

    if (link) {
      const { id } = link.dataset
      state.ui.read.add(id)
      markAsRead(container, id)
      return
    }

    if (button) {
      const { id } = button.dataset
      const post = state.posts.find(p => p.id === id)
      if (!post) return

      showModal(post)
      state.ui.read.add(id)
      markAsRead(container, id)
    }
  })
}
