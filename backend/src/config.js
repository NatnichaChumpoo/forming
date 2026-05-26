function getCorsOrigin(rawOrigin) {
  if (!rawOrigin || rawOrigin.trim() === '' || rawOrigin.trim() === '*') {
    return true;
  }

  const origins = rawOrigin
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean);

  return origins.length > 0 ? origins : true;
}

module.exports = { getCorsOrigin };
