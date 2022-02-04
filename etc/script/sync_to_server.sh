#!/usr/bin/env bash

rsync -avzrhcP --exclude=node_modules --exclude=dbdata \
	--exclude=.git \
	--exclude=etc \
	--exclude=dist \
  --exclude=.env \
	--delete-after ./ root@$DEPLOY_SERVER:$DEPLOY_PATH

