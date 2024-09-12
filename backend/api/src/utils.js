exports.formatDate = function(dateString) {
  const date = new Date(dateString);
  let month = (date.getMonth() + 1).toString();
  if (month.length < 2) {
    month = '0' + month;
  }
  return `${date.getFullYear()}-${month}`;
};