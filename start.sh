docker compose down
docker compose up -d
sleep 4
bash migrate.sh
npm run dev