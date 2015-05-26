cd /vagrant
sudo apt-get update -y
echo "instlalling prerequisites"
./install_prereq.sh

## bootstrap
source /etc/ENVIRONMENT_VARIABLES.sh || echo "no environment variables file.. skipping.. "
echo "installing cloudify-installer"
sudo npm -g install cloudify-cosmo/cloudify-installer --ignore-scripts
export INSTALL_SYSTEM_TESTS_REQ=true
export INSTALL_SYSTEM_TESTS_SCRIPT=`pwd`/setup_tests_env.sh

cloudify-installer run_script -s 3.2.0/vagrant_install_simple/script.sh

./run_test.sh
