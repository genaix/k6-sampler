import {group, check} from "k6";
import http from "k6/http";

// import { randomBetween } from "https://jslib.k6.io/k6-utils/1.4.0/index.js"; incorrect import?
import { SharedArray } from "k6/data";

const data = new SharedArray("get Users", function () {
    const file = JSON.parse(open("./users.json"));
    return file.users;
});


export const options = {
//debug scenario
//     vus: 11,
//     duration: "7s",
//global checks scenario success
//     thresholds: {
//         http_req_duration: ["p(95) < 200"]
//     }
//strong load frequency without checks, only status code
//     discardResponseBodies: true,

// default function
//     scenarios:
//         executor: "costant-arrival-rate",
//         rate: 10,
//         duration: "15s",
//         preAllocatedVUs: 50,
//         maxVUs: 100,
//     }

    scenarios:
        otus1:{
            exec: "getBase"
            executor: "costant-arrival-rate",
            rate: 10,
            duration: "13s",
            preAllocatedVUs: 50,
            maxVUs: 100,
        }
        otus2:{
            exec: "getFeature"
            executor: "costant-arrival-rate",
            rate: 5,
            duration: "15s",
            preAllocatedVUs: 50,
            maxVUs: 100,
        }
    }
}

const url = "https://test.k6.io"

export default function(){
    group('get_base', () => {getBase();});
    group('get_feature', () => {getFeature();});
}

export function getBase(){
    let random = Math.floor(Math.random() * data.length)
    let user = data[random]
    let body = `my otus login ${user} ssfd`
    console.warn(random)
    console.error(user)
    console.log(body)

    http.get(`${url}/contacts.php`);
    // console.log("Hello, k6!");

    let payload = {name: "Ronald"};
    let header = {headers: {"Content-Type": "application/json"}};

    let response_1 = http.post(url + "/flip_coin.php", JSON.stringify(payload), header);
    check(response_1, {"status is 200": (r) => r.status === 200});

//     let random = Math.floor(Math.random() * locData.length);

    let response_2 = http.get(`${url}/my_messages.php`);
    check(response_2, {"status is 200": (r) => r.status === 200});
    let title = response_2.html().find("head title").text;
    console.log(title);
}

export function getFeature(){
    group('login', () => {
        let response_2 = http.get(`${url}/news.php`);
        check(response_2, {"status is 200": (r) => r.status === 200});
        let response_2 = http.get(`${url}/contact.php`);
        check(response_2, {"status is 200": (r) => r.status === 200});
    })
}
