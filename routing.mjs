export function articleFromHash(hash, articles) {
  if (!hash.startsWith('#article/')) return null;
  try {
    const id = decodeURIComponent(hash.slice(9));
    return Object.hasOwn(articles, id) ? id : null;
  } catch { return null; }
}

export function articleHash(id, articles) {
  return Object.hasOwn(articles, id) ? '#article/' + encodeURIComponent(id) : null;
}
