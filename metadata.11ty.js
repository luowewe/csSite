class Metadata {
  data() {
    return { permalink: "/metadata.json" };
  }

  render(data) {
    return JSON.stringify(data.metadata, null, 2);
  }
}

module.exports = Metadata;
