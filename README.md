# k6-sampler

Simple k6 load test for OTUS

Запуск с логом в файл
`k6 run --logformat raw --console-output=test.log --no-summary --http-debug="full" --out csv=resuls.csv ya_ru.js`
`k6 run --out influxdb=http://localhost:8086/k6 ya_ru.js`

har converter
`docker run --rm -it -v /home/evgeniy/Downloads/har_converter/:/converter/har_converter grafana/har-to-k6 har_converter/www.load-test.ru.har -o har_converter/loadtest.js`

Запуск в контейнере
1. _build_ `docker build -t script_k6 .`
2. _run_ `docker run --rm -it script_k6:latest`
