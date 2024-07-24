function dateReceivedValid(dateReceived) {
  return /^\d{4}-\d{2}-\d{2}$/.test(dateReceived);
}

module.exports = {
  dateReceivedValid,
};