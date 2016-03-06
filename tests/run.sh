#make sure ionic serve isn't running
kill -9 $(lsof -n -ti4TCP:8100)

#/usr/lib/node_modules/protractor/bin/webdriver-manager update --ignore_ssl

echo starting ionic serve...
screen -d -m -L ionic serve --nolivereload --nobrowser --address localhost
sleep 1

echo waiting for ionic to start...
while ! curl http://localhost:8100 &>/dev/null; do :; done
echo ionic serve started

#run end to end tests

(
    cd tests
    /usr/bin/protractor conf.js
)

echo stoping ionic...
kill -9 $(lsof -n -ti4TCP:8100)
echo stopped.

echo done
