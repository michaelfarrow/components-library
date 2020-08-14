const files = [['./data/info.json', './data/links.json']];

module.exports = {
  async onPreBuild({ utils }) {
    await utils.cache.restore(files);
  },
  async onPostBuild({ utils }) {
    await utils.cache.save(files);
  },
};
