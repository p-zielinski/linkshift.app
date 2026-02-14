const createId = () => 'test-id-' + Math.random().toString(36).substring(2, 9);
const init = () => createId;
const getConstants = () => ({});
const isCuid = () => true;

module.exports = {
  createId,
  init,
  getConstants,
  isCuid,
};
