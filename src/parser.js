export default (xmlString) => {
  const parser = new DOMParser()
  const doc = parser.parseFromString(xmlString, 'application/xml')

  const parseError = doc.querySelector('parsererror')
  if (parseError) {
    const error = new Error('invalidRss')
    error.isParseError = true
    throw error
  }

  const channel = doc.querySelector('channel')
  if (!channel) {
    const error = new Error('invalidRss')
    error.isParseError = true
    throw error
  }

  const feedTitle = doc.querySelector('channel > title')?.textContent?.trim() ?? ''
  const feedDescription = doc.querySelector('channel > description')?.textContent?.trim() ?? ''

  const items = [...doc.querySelectorAll('channel > item')]

  const posts = items.map((item) => {
    const title = item.querySelector('title')?.textContent?.trim() ?? ''
    const link = item.querySelector('link')?.textContent?.trim() ?? ''
    const description = item.querySelector('description')?.textContent?.trim() ?? ''
    return { title, link, description }
  })

  return {
    feed: { title: feedTitle, description: feedDescription },
    posts,
  }
}
