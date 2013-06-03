public/build.js: client.js console/*
	`npm bin`/browserify -t brfs client.js > public/build.js

release:
	git diff --quiet && git diff --cached --quiet || (echo 'please stash or commit your changes.'; exit 1)
	-rm ../driver-admin.tar.gz
	npm install
	`npm bin`/browserify -t brfs client.js > public/build.js
	rm -Rf ./node_modules
	npm install --production
	tar -czvf ../driver-admin.tar.gz .
	scp ../driver-admin.tar.gz ubuntu@ninjablock.local:~/tmp
	rm ../driver-admin.tar.gz

	@echo "ssh ubuntu@ninjablock.local"
	@echo "cd ~/tmp"
	@echo "rm -Rf ./driver-admin"
	@echo "mkdir ./driver-admin"
	@echo "tar -xzvf driver-admin.tar.gz -C driver-admin"
	@echo "cd driver-admin"
	@echo "npm rebuild"
	@echo "git checkout -b release"
	@echo "git add ."
	@echo "git commit -m 'Update release build'"
	@echo "git push"
	@echo "exit"

@PHONY: release
