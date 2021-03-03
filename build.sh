#!/bin/bash

#mvn clean package -Dmaven.test.skip=true
#
#docker build -t registry.fit2cloud.com/east/fks-service:${branch} .
#docker push registry.fit2cloud.com/east/fks-service:${branch}

mvn clean package -U -Dmaven.test.skip=true
rm -fr fks.tar

docker build -t registry.fit2cloud.com/east/fks-service:pmlabs3 .
docker save -o fks.tar registry.fit2cloud.com/east/fks-service:pmlabs3
docker push registry.fit2cloud.com/east/fks-service:pmlabs3