echo "uploading blueprints and creating deployments for tests"
cfy blueprints publish-archive -l ../../../test/resources/testHelloWorld.tar.gz -b HelloWorld -n blueprint.yaml
cfy blueprints publish-archive -l ../../../test/resources/cloudify-nodecellar-example.tar.gz -b nodecellar -n openstack-blueprint.yaml
cfy deployments create -b HelloWorld -d HelloWorld
cfy deployments create -b nodecellar -d nodecellar --inputs ../../../test/resources/cloudify-nodecellar-example-inputs.yaml

