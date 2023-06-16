// weekOffset.js

let currentOffset = 0;

module.exports = {
  getCurrentOffset: () => currentOffset,
  incrementOffset: () => currentOffset++,
  decrementOffset: () => currentOffset--,
  resetOffset: () => currentOffset = 0
};
