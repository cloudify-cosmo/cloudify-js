##########
#
#  Installs node, git, java etc..
#
##########


set -v
set -e
set -x

if [ ! -f /usr/bin/node ];then
    echo "installing node"
    NODEJS_VERSION=0.10.35
    NODEJS_HOME=/opt/nodejs
    sudo mkdir -p $NODEJS_HOME
    sudo chown $USER:$USER $NODEJS_HOME
    curl --fail --silent http://nodejs.org/dist/v${NODEJS_VERSION}/node-v${NODEJS_VERSION}-linux-x64.tar.gz -o /tmp/nodejs.tar.gz
    tar -xzf /tmp/nodejs.tar.gz -C ${NODEJS_HOME} --strip-components=1
    sudo ln -s /opt/nodejs/bin/node /usr/bin/node
    sudo ln -s /opt/nodejs/bin/npm /usr/bin/npm
else
    echo "node already installed"
fi

sudo yum install -y bzip2 # for phantomjs https://github.com/Medium/phantomjs/issues/92

if [ ! -f /usr/bin/git ]; then
    echo "installing git"
    sudo yum install -y git
else
    echo "git already installed"
fi

if [ ! -f /usr/bin/java ]; then
    echo "installing java"
    sudo yum install -y java-1.7.0-openjdk
#    sudo apt-get install -y openjdk-7-jre-headless
else
    echo "java already installed"
fi

if [ ! -f /usr/bin/grunt ]; then
    echo "installing grunt and phantom"
    sudo npm install -g grunt-cli phantomjs

else
    echo "grunt and phantom already installed"
fi

sudo -- sh -c "echo '127.0.0.1 cloudify.localhost.com' >> /etc/hosts"