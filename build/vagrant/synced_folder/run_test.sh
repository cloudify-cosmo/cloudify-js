
sudo npm cache clean
npm install

export PROTRACTOR_BASE_URL=http://localhost

if [ "$TEST_TYPE" = "" ];then
    TEST_TYPE="mocha"
fi
echo "TEST_TYPE is $TEST_TYPE"

grunt $TEST_TYPE

