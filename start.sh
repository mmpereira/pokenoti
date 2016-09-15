
#nohup node server.js &

nohup node server.js > pokenoti.log 2>&1&
echo $! > save_pid.txt