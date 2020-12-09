function getTotal(entries) {
  let totalCount = 0;
  entries.forEach(function () {
    totalCount++;
  });
  return totalCount;
}

module.exports = { getTotal };
