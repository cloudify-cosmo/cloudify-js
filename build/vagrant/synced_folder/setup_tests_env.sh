echo "uploading blueprints and creating deployments for cloudify-js tests"
echo "TESTS_FOLDER value is: [$TESTS_FOLDER]"
cfy blueprints publish-archive -l $TESTS_FOLDER/test/resources/testHelloWorld.tar.gz -b HelloWorld -n blueprint.yaml
cfy blueprints publish-archive -l $TESTS_FOLDER/test/resources/cloudify-nodecellar-example.tar.gz -b nodecellar -n openstack-blueprint.yaml
cfy deployments create -b HelloWorld -d HelloWorld
cfy deployments create -b nodecellar -d nodecellar --inputs $TESTS_FOLDER/test/resources/cloudify-nodecellar-example-inputs.yaml