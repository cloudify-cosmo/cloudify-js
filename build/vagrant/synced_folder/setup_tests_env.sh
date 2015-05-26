echo "uploading blueprints and creating deployments for cloudify-js tests"
cfy blueprints publish-archive -l https://github.com/cloudify-cosmo/cloudify-js/tree/CFY-2106-system-tests/test/resources/testHelloWorld.tar.gz -b HelloWorld -n blueprint.yaml
cfy blueprints publish-archive -l https://github.com/cloudify-cosmo/cloudify-js/tree/CFY-2106-system-tests/test/resources/cloudify-nodecellar-example.tar.gz -b nodecellar -n openstack-blueprint.yaml
cfy deployments create -b HelloWorld -d HelloWorld
cfy deployments create -b nodecellar -d nodecellar --inputs https://github.com/cloudify-cosmo/cloudify-js/tree/CFY-2106-system-tests/test/resources/cloudify-nodecellar-example-inputs.yaml