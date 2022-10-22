import http from "k6/http";
import { group, check } from "k6";
import { parseHTML } from "k6/html";
import { SharedArray } from "k6/data";


export const options = {
  discardResponseBodies: false,
  scenarios: {
    yandex: {
      executor: "ramping-arrival-rate",
      exec: "yandex",
      startRate: 1,
      timeUnit: "1m",
      preAllocatedVUs: 2,
      maxVUs: 50,
      stages: [
        { target: 60, duration: "5m" },
        { target: 60, duration: "10m" },
        { target: 72, duration: "5m" },
        { target: 72, duration: "10m" },
      ],
    },
    www: {
      executor: "ramping-arrival-rate",
      exec: "www",
      startRate: 1,
      timeUnit: "1m",
      preAllocatedVUs: 2,
      maxVUs: 50,
      stages: [
        { target: 120, duration: "5m" },
        { target: 120, duration: "10m" },
        { target: 144, duration: "5m" },
        { target: 144, duration: "10m" },
      ],
    },
  },
}

export function yandex () {
  let response = http.get("http://ya.ru", {headers: {Connection: "keep-alive"}})
}

export function www () {
  let response = http.get("http://www.ru", {headers: {Connection: "keep-alive"}})
}
