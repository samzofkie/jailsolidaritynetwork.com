To get prepared, you'll need to run:
```
cd frontend
npm i
npm run build
cd ../backend/api
npm i
cd ../nginx
docker build -t nginx-log-rotate .
cd ..
```
And finally, to start the server, you'll run:
```
docker compose -f prod.yaml up
```
(from the `backend` dir).