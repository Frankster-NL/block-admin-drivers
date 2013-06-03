public/build.js: client.js console/*
	`npm bin`/browserify -t brfs client.js > public/build.js

release:
	npm install
	`npm bin`/browserify -t brfs client.js > public/build.js
	git checkout -b release
	npm prune
	rm -Rf ./node_modules
	npm install --production
	git add .
	git commit -m "Update release build."


@PHONY: release
