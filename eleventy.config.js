const path = require("path");
const prettier = require("prettier");

const makePretty = true;

const pageDirs = [
  'assessments',
  'assignments',
  'calendar',
  'demos',
  'expressions',
  'frames',
  'playgrounds',
  'projects',
  'visualizations',
];

const extensions = ['css', 'js', 'json', 'txt', 'java', 'py', 'jpg', 'png', 'svg'];

const titleSort = (a, b) => {
  const aTitle = '' + a.template._frontMatter.data.title ?? '';
  const bTitle = '' + b.template._frontMatter.data.title ?? '';
  return aTitle.localeCompare(bTitle);
};

const sortedCollection = (config, tag, fn) => {
  config.addCollection(`${tag}s`, function(collectionApi) {
    return collectionApi.getFilteredByTag(tag).sort(fn);
  });
};

module.exports = function eleventyConfig(eleventyConfig) {
  // Hack to make our configured output dir available to class-based templates.
  eleventyConfig.addPlugin((ec) => ec.addGlobalData('eleventyConfig', ec));

  eleventyConfig.addFilter("date", require("./filters/datefilter.js"));

  eleventyConfig.addWatchTarget('./js/');

  eleventyConfig.addPassthroughCopy('css');
  eleventyConfig.addPassthroughCopy('fonts');
  eleventyConfig.addPassthroughCopy('img');
  eleventyConfig.addPassthroughCopy('reveal');
  eleventyConfig.addPassthroughCopy('favicon.ico');
  eleventyConfig.addPassthroughCopy('_headers');

  if (makePretty) {

    // Adapted from https://github.com/11ty/eleventy/issues/1314#issuecomment-657999759
    eleventyConfig.addTransform("prettier", function (content, outputPath) {
      if (outputPath) { // some templates don't produce output and have false for their outputPath
        const extname = path.extname(outputPath);
        switch (extname) {
          case ".html":
          case ".json":
            // Strip leading period from extension and use as the Prettier parser.
            const parser = extname.replace(/^./, "");
            return prettier.format(content, { parser });

          default:
            return content;
        }
      }
    });
  }

  sortedCollection(eleventyConfig, "assessment", titleSort);
  sortedCollection(eleventyConfig, "assignment", titleSort);
  sortedCollection(eleventyConfig, "demo", titleSort);
  sortedCollection(eleventyConfig, "expression", titleSort);
  sortedCollection(eleventyConfig, "playground", titleSort);
  sortedCollection(eleventyConfig, "visualization", titleSort);

  // So date formatting of naive dates comes out right.
  eleventyConfig.setLiquidOptions({
    timezoneOffset: 0,
  });

  // Copy through content used by iframes
  pageDirs.forEach((dir) => {
    extensions.forEach((ext) => {
      eleventyConfig.addPassthroughCopy(`${dir}/**/*.${ext}`);
    });
  });

  eleventyConfig.addCollection('projectTypes', function (collectionApi) {
    const projects = collectionApi.getFilteredByTag('projects');
    const types = [
      ...new Set(projects.flatMap((p) => p.data.tags.filter((t) => t !== 'projects'))),
    ];
    types.sort();
    return types;
  });

  return {
    templateFormats: ['11ty.js', 'html', 'njk'],
  };
};
