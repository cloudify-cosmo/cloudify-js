set -e
set -v

cd /vagrant
# sudo yum update -y
echo "instlalling prerequisites"
./install_prereq.sh

## bootstrap
source /etc/ENVIRONMENT_VARIABLES.sh || echo "no environment variables file.. skipping.. "
echo "installing cloudify-installer"
export TAG="3.3rc1"
export TYPE="plain"
export TEST_BRANCH="CFY-4034-fix-integration-tests"
sudo npm -g install cloudify-cosmo/cloudify-installer --ignore-scripts
export INSTALL_SYSTEM_TESTS_REQ=true
export SYSTEM_TESTS_VIRTUAL_ENV=/tmp/cloudify-js-virtenv

cloudify-installer run_script -s 3.3.0/vagrant_install_simple/script.sh

./run_test.sh
