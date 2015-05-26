SYSTEM_TESTS_FOLDER=system-tests
rm -rf $SYSTEM_TESTS_FOLDER || echo "folder does not exist"
git clone -b CFY-2106-system-tests https://github.com/cloudify-cosmo/cloudify-js.git $SYSTEM_TESTS_FOLDER
cd $SYSTEM_TESTS_FOLDER
export TESTS_FOLDER=`pwd`