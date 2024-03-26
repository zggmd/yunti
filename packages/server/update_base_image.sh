#!/bin/bash
set -e

# build base image
base_image="yuntijs/yunti-server:base-1.0"
docker build -t ${base_image} -f Dockerfile.base .
docker push ${base_image}

# build prod base image
base_image_prod="yuntijs/yunti-server:base-1.0-prod"
docker build -t ${base_image_prod} -f Dockerfile.pro .
docker push ${base_image_prod}
