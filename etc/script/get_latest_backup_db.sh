#!/usr/bin/env bash

# Script to backup db in remote server and download it.
# Backup operation will be ignored if already exsits.

DATE=`date +"%Y-%m-%d"`
USER=root

ssh $USER@$DB_SERVER "( cd $BACKUP_PATH; bash backup-arascan-mongodb.sh )"
ssh $USER@$DB_SERVER uptime | awk '{print $2, $3, $4, $5}'

if [ -d dbdata ]; then
    rm -rf dbdata/*
else
    mkdir dbdata
fi

rsync -avzrhcP $USER@$DB_SERVER:$BACKUP_PATH/arascan-mongodb-backup-$DATE/ dbdata/arascan-mongodb-backup-$DATE
