public/build.js: client.js
	`npm bin`/browserify -t brfs client.js > public/build.js
