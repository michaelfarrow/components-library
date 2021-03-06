module.exports = function slugify(str) {
  if (!str) return;
  return str
    .toString()
    .toLowerCase()
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, '') // Trim - from end of text
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/\.+/g, '-') // Replace . with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, ''); // Trim - from end of text
  // .replace(/-+/g, '');
};
