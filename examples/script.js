import http from 'k6/http';
import { group, check } from 'k6';

// Base config
const host = `${__ENV.HOST}` || 'localhost';
const protocol = 'https://';
const port = `${__ENV.PORT}` || 8080;

export const options = {
  discardResponseBodies: true,
  scenarios: {
    freefly: {
      executor: 'ramping-arrival-rate',
      startRate: 1,
      timeUnit: '1s',
      preAllocatedVUs: 50,
      maxVUs: 100,
      exec: 'free',
      stages: [
        { target: 5, duration: '3s' },
        { target: 5, duration: '10s' },
        { target: 0, duration: '2s' },
      ],
    },
    hardfly: {
      executor: 'ramping-arrival-rate',
      startRate: 50,
      timeUnit: '1s',
      preAllocatedVUs: 50,
      maxVUs: 100,
      exec: 'hard',
      stages: [
        { target: 5, duration: '3s' },
        { target: 10, duration: '10s' },
        { target: 0, duration: '2s' },
      ],
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<200'],
  },
};

// Groups
export function free() {
  group('GET_/', () => {
    const getRoot = http.get(protocol.concat(host, ':', port));
    check(getRoot, {
      'status code is 200': (res) => res.status === 200,
    });
  });

  group('GET_/secret', () => {
    const getSecret = http.get(protocol.concat(host, ':', port, '/secret'));
    check(getSecret, {
      'status code is 200': (res) => res.status === 200,
    });
  });

  group('POST_/', () => {
    const postRoot = http.post(protocol.concat(host, ':', port));
    check(postRoot, {
      'status code is 200': (res) => res.status === 200,
    });
  });
}

export function hard() {
  group('GET_/random', () => {
    const getRandom = http.get(protocol.concat(host, ':', port, '/random-number'));
    check(getRandom, {
      'status code is 200': (res) => res.status === 200,
    });
  });
}
