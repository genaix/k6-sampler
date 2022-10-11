FROM grafana/k6:0.40.0

COPY webtours.ts creds.json /tests/
WORKDIR /tests/
ENTRYPOINT ["k6", "run", "webtours.ts"]
