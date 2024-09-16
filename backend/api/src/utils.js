function formatDate(dateString) {
  const date = new Date(dateString);
  if (isNaN(date.getSeconds()))
    throw new Error('formatDate\'s argument must be a string accepted as valid by Date() constructor');
  return date.toISOString().slice(0,7);
};

module.exports = {
  formatDate,
};