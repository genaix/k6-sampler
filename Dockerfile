FROM grafana/k6:0.40.0

COPY webtours.ts creds.json ya_ru.ts /tests/
WORKDIR /tests/
ENTRYPOINT ["k6", "run", "--out", "influxdb=http://localhost:8086/k6", "ya_ru.ts"]
