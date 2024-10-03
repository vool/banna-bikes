const Image = require("@11ty/eleventy-img");
const glob = require("glob-promise");

const THUMB = 250;
const FULL = 650;

async function generateImages() {

	let options = {
		widths: [THUMB,FULL],
		formats: ['jpeg'],
		filenameFormat:function(id, src, width, format, options) {
			let origFilename = src.split('/').pop();
			//strip off the file type, this could probably be one line of fancier JS
			let parts = origFilename.split('.');
			parts.pop();
			origFilename = parts.join('.');

			if(width === THUMB) return `thumb-${origFilename}.${format}`;
			else return `${origFilename}.${format}`;
		}
	};

	let files = await glob('./rawphotos/*.{jpg,jpeg,png,gif}');
	for(const f of files) {
		console.log('doing f',f);
		let md = await Image(f, options);
	};

};

module.exports = function (eleventyConfig) {

  eleventyConfig.addPassthroughCopy("img");
  eleventyConfig.addPassthroughCopy("css");



    eleventyConfig.setBrowserSyncConfig({
      files: './public/static/**/*.css',
    });

    eleventyConfig.on('beforeBuild', async () => {
      console.log('beforeBuild');
      await generateImages();
      console.log('images done');
    });


    eleventyConfig.addCollection('images', async collectionApi => {

      let files = await glob('./img/*.jpeg');
      //Now filter to non thumb-
      let images = files.filter(f => {
        return f.indexOf('./img/thumb-') !== 0;
      });

      let collection = images.map(i => {
        return {
          path: i.replace('./img/', '/img/'),
          thumbpath: i.replace('./img/', '/img/thumb-')
        }
      });

      return collection;

    });

    eleventyConfig.addShortcode("image", async function (src, alt, widths = [300, 600], sizes = "100vh") {
  let metadata = await Image(src, {
    widths,
    formats: ["avif", "jpeg"],
  });

  let imageAttributes = {
    alt,
    sizes,
    loading: "lazy",
    decoding: "async",
  };

  // You bet we throw an error on a missing alt (alt="" works okay)
  return Image.generateHTML(metadata, imageAttributes);
});

    return {
      dir: {
        input: 'src',
        output: 'public',
      },
    };
  };
