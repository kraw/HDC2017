composer network deploy -a my-network.bna -p hlfv1 -i PeerAdmin -s randomString
composer network ping -n my-network -p hlfv1 -i admin -s adminpw

composer-rest-server -p hlfv1 -n my-network -i admin -s adminpw -N never -w
