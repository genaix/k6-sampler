# k6-sampler

Simple k6 load test for OTUS

Запуск с логом в файл
`k6 run --logformat raw --console-output=test.log --no-summary --http-debug="full" --out csv=resuls.csv test.js`

har converter
`docker run --rm -it -v /home/evgeniy/Downloads/har_converter/:/converter/har_converter grafana/har-to-k6 har_converter/www.load-test.ru.har -o har_converter/loadtest.js`

Запуск в контейнере
`docker run --rm -it -v /home/evgeniy/github/k6_otus_example/:/home/k6 grafana/k6 "run --http-debug="full" loadtest.ts"`
