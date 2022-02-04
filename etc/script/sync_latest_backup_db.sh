#!/usr/bin/env bash

# Script to restore db from previous downloaded database
# using get_latest_backup_db.sh

DATE=`date +"%Y-%m-%d"`

mongorestore --db arascan dbdata/arascan-mongodb-backup-$DATE/nuchain
