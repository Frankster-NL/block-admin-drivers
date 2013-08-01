public/build.js: client.js console/*
	browserify -t brfs client.js > public/build.js

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
	@echo ""
	@echo "Now do something like:"
	@echo ""
	@echo "ssh ubuntu@ninjablock.local"
	@echo "cd ~/tmp"
	@echo "rm -Rf ./driver-admin"
	@echo "mkdir ./driver-admin"
	@echo "tar -xzvf driver-admin.tar.gz -C driver-admin"
	@echo "cd driver-admin"
	@echo "npm rebuild"
	@echo "rm driver-admin.tar.gz"
	@echo "cd .."
	@echo "tar -cvzf driver-admin.tar.gz driver-admin"
	@echo "Trasfer file back, switch to release branch on original computer."
	@echo "git add node_modules public/build.js -f"
	@echo "git commit -m 'Updated release'"
	@echo "git push"

@PHONY: release
