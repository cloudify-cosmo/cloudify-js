
SYSTEM_TESTS_FOLDER=system-tests
rm -rf $SYSTEM_TESTS_FOLDER || echo "folder does not exist"
git clone https://github.com/cloudify-cosmo/cloudify-js.git $SYSTEM_TESTS_FOLDER
cd $SYSTEM_TESTS_FOLDER

sudo npm cache clean
npm install

export PROTRACTOR_BASE_URL=http://localhost

echo "uploading blueprints and creating deployments for cloudify-js tests"
echo "virtual env folder is: [$SYSTEM_TESTS_VIRTUAL_ENV]"
source $SYSTEM_TESTS_VIRTUAL_ENV/bin/activate
cfy blueprints publish-archive -l test/resources/testHelloWorld.tar.gz -b HelloWorld -n blueprint.yaml
cfy blueprints publish-archive -l test/resources/cloudify-nodecellar-example.tar.gz -b nodecellar -n openstack-blueprint.yaml
cfy deployments create -b HelloWorld -d HelloWorld
cfy deployments create -b nodecellar -d nodecellar --inputs test/resources/cloudify-nodecellar-example-inputs.yaml

if [ "$TEST_TYPE" = "" ];then
    TEST_TYPE="mocha"
fi
echo "TEST_TYPE is $TEST_TYPE"

grunt $TEST_TYPE
