public/build.js: client.js console/*
	`npm bin`/browserify -t brfs client.js > public/build.js
