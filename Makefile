public/build.js: client.js console/*
	`npm bin`/browserify -t brfs client.js > public/build.js

release: public/build.js
	git checkout -b release
	npm purge
	npm install --production
	git add .
	git commit -m "Update release build."


@PHONY: release
