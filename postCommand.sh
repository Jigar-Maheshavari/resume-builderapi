# this file execute after git pull code will complete
# $1 you will get current path on server a
#!/bin/bash
echo "post command"
echo "path : $1"
cd "$1"
# npm install
rm /var/www/html/demo/ec/api/logs/log.txt
rm /var/www/html/demo/ec/api/logs/error.txt
rm /var/www/html/demo/ec/api/logs/output.txt
forever stop ec
sudo kill `sudo lsof -t -i:8007`
sudo forever start -c "npm run start:prod" -l "/var/www/html/demo/ec/api/logs/log.txt" -e "/var/www/html/demo/ec/api/logs/error.txt" -o "/var/www/html/demo/ec/api/logs/output.txt" --uid "ec" -a ./
