#!/bin/bash

set -e 

mkdir -p stage/opt/ninjablocks
mkdir -p stage/etc/init

rsync -axvr --exclude stage --exclude *.deb --exclude misc --exclude .git . stage/opt/ninjablocks/admin
cp misc/block-admin-drivers.conf  stage/etc/init

# TODO --after-install misc/postinstall.sh 
fpm -s dir -t deb -n block_admin_drivers --deb-compression xz --deb-user root --deb-group root -v "0.1.0-1vr~ubuntu1" --category web -m "Builder<builder@ninjablocks.com>" --url http://ninjablocks.com/  --description "Block driver admin service."  -C stage -a armhf  -p block_admin_drivers_0.1.1-1vr~ubuntu1_armhf.deb  opt/ninjablocks etc/init 
