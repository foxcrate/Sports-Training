#! /bin/bash
docker stop instaplay-staging;
docker rm instaplay-staging;
docker image rm instaplay/staging;
docker build . --tag instaplay/staging;
docker run -d -p 8000:8000 --restart unless-stopped -v ./public:/app/public --name instaplay-staging instaplay/staging;
