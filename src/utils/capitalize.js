const capitalize = (str) => {
  if (!str) return str;
  return str
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

module.exports = { capitalize };
