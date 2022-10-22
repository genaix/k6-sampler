import http from "k6/http";
import { group, check } from "k6";
import { parseHTML } from "k6/html";
import { SharedArray } from "k6/data";

/* cookies
    let cookies = http.cookieJar().cookiesForURL(response.url);
    console.log("Cookies::"+JSON.stringify(cookies));
*/

export const options = {
  discardResponseBodies: false,
  scenarios: {
    webtours: {
      executor: "shared-iterations",
      vus: 1,
      iterations: 1,
      maxDuration: "30s",
    },
  },
}

const host = "www.load-test.ru:1080"
const url = `http://${host}`

const today = new Date()
const tomorrow = new Date(today.getTime()+1000*60*60*24)
const dayAfterTomorrow = new Date(today.getTime()+1000*60*60*24*2)
const departDate = tomorrow.toLocaleDateString("en-US")
const returnDate = dayAfterTomorrow.toLocaleDateString("en-US")

const data = new SharedArray("get users creds", function () {
    const file = JSON.parse(open("./creds.json"));
    return file.creds;
});


export default function() {
  let random = Math.floor(Math.random() * data.length)
  let user = data[0]
  let userSession = openLogin()
  doLogin(user, userSession);
  let destination_data = openFlights()
  let airplanes = findFlight(destination_data.departures, destination_data.arrivals)
  const airplane = airplanes[Math.floor(Math.random() * airplanes.length)]
  chooseAirplane(airplane);
  paymentDetails(user, airplane);
  backToRoot();
}


export function openLogin() {
  let userSession;

  group('openLogin', function () {
    let response;
    let header = {
      headers: {
              Accept:
              'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
              'Accept-Encoding': 'gzip, deflate',
              'Accept-Language': 'en-US,en;q=0.9,ru;q=0.8',
              Connection: 'keep-alive',
              Host: `${host}`,
              'Upgrade-Insecure-Requests': '1',
              'User-Agent':
                'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36',
            }
    }
    response = http.get(`${url}/webtours/`, header)

    response = http.get(`${url}/webtours/header.html`, header)

    response = http.get(`${url}/cgi-bin/welcome.pl?signOff=true`,
      header,
      {
        headers: {
          Referer: `${url}/webtours/`,
        }
      }
    )
    check(response, {"status is 200": (r) => r.status === 200});

    response = http.get(`${url}/webtours/images/hp_logo.png`)
    check(response, {"status is 200": (r) => r.status === 200});

    response = http.get(`${url}/webtours/images/webtours.png`)
    check(response, {"status is 200": (r) => r.status === 200});

    response = http.get(`${url}/cgi-bin/nav.pl?in=home`, {
      headers: {
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
        'Accept-Encoding': 'gzip, deflate',
        'Accept-Language': 'en-US,en;q=0.9,ru;q=0.8',
        Connection: 'keep-alive',
        Host: `${host}`,
        Referer: `${url}/cgi-bin/welcome.pl?signOff=true`,
        'Upgrade-Insecure-Requests': '1',
        'User-Agent':
          'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36',
      },
    })
    check(response, {"status is 200": (r) => r.status === 200});
    userSession = parseHTML(response.body).find('input[name=\"userSession\"]').attr("value")

    response = http.get(`${url}/WebTours/home.html`)
    check(response, {"status is 200": (r) => r.status === 200});

    response = http.get(`${url}/WebTours/images/mer_login.gif`)
    check(response, {"status is 200": (r) => r.status === 200});
  })
  return userSession
}


export function doLogin(user, userSession) {
  group('doLogin', function () {
    let response;

    response = http.post(
      `${url}/cgi-bin/login.pl`,
      {
        userSession: `${userSession}`,
        username: `${user.login}`,
        password: `${user.password}`,
        'login.x': '62',
        'login.y': '14',
        JSFormSubmit: 'off',
      },
      {
        headers: {
          Accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
          'Accept-Encoding': 'gzip, deflate',
          'Accept-Language': 'en-US,en;q=0.9,ru;q=0.8',
          'Cache-Control': 'max-age=0',
          Connection: 'keep-alive',
          'Content-Type': 'application/x-www-form-urlencoded',
//               Cookie: 'MSO=SID&1665153481',
          Host: `${host}`,
          Origin: `${url}`,
          Referer: `${url}/cgi-bin/nav.pl?in=home`,
          'Upgrade-Insecure-Requests': '1',
          'User-Agent':
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36',
        },
      }
    )
    check(response, {"status is 200": (r) => r.status === 200});

    response = http.get(`${url}/cgi-bin/nav.pl?page=menu&in=home`, {
      headers: {
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
        'Accept-Encoding': 'gzip, deflate',
        'Accept-Language': 'en-US,en;q=0.9,ru;q=0.8',
        Connection: 'keep-alive',
        Host: `${host}`,
        Referer: `${url}/cgi-bin/login.pl`,
        'Upgrade-Insecure-Requests': '1',
        'User-Agent':
          'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36',
      },
    })
    check(response, {"status is 200": (r) => r.status === 200});
    let cookies = http.cookieJar().cookiesForURL(response.url);
    console.log("Cookies::"+JSON.stringify(cookies));

    response = http.get(`${url}/cgi-bin/login.pl?intro=true`, {
      headers: {
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
        'Accept-Encoding': 'gzip, deflate',
        'Accept-Language': 'en-US,en;q=0.9,ru;q=0.8',
        Connection: 'keep-alive',
        Host: `${host}`,
        Referer: `${url}/cgi-bin/login.pl`,
        'Upgrade-Insecure-Requests': '1',
        'User-Agent':
          'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36',
      },
    })
    check(response, {"status is 200": (r) => r.status === 200});

    response = http.get(`${url}/WebTours/images/flights.gif`, {
      headers: {
        Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'Accept-Encoding': 'gzip, deflate',
        'Accept-Language': 'en-US,en;q=0.9,ru;q=0.8',
        Connection: 'keep-alive',
        Host: `${host}`,
        Referer: `${url}/cgi-bin/nav.pl?page=menu&in=home`,
        'User-Agent':
          'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36',
      },
    })
    check(response, {"status is 200": (r) => r.status === 200});

    response = http.get(`${url}/WebTours/images/itinerary.gif`, {
      headers: {
        Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'Accept-Encoding': 'gzip, deflate',
        'Accept-Language': 'en-US,en;q=0.9,ru;q=0.8',
        Connection: 'keep-alive',
        Host: `${host}`,
        Referer: `${url}/cgi-bin/nav.pl?page=menu&in=home`,
        'User-Agent':
          'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36',
      },
    })
    check(response, {"status is 200": (r) => r.status === 200});

    response = http.get(`${url}/WebTours/images/in_home.gif`, {
      headers: {
        Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'Accept-Encoding': 'gzip, deflate',
        'Accept-Language': 'en-US,en;q=0.9,ru;q=0.8',
        Connection: 'keep-alive',
        Host: `${host}`,
        Referer: `${url}/cgi-bin/nav.pl?page=menu&in=home`,
        'User-Agent':
          'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36',
      },
    })
    check(response, {"status is 200": (r) => r.status === 200});

  })
}


export function openFlights() {
  let departures = []
  let arrivals = []

  group('openFlights', function () {
    let response;
    response = http.get(`${url}/WebTours/images/signoff.gif`, {
      headers: {
        Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'Accept-Encoding': 'gzip, deflate',
        'Accept-Language': 'en-US,en;q=0.9,ru;q=0.8',
        Connection: 'keep-alive',
        Host: `${host}`,
        Referer: `${url}/cgi-bin/nav.pl?page=menu&in=home`,
        'User-Agent':
          'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36',
      },
    })
    check(response, {"status is 200": (r) => r.status === 200});

    response = http.get(`${url}/cgi-bin/welcome.pl?page=search`, {
      headers: {
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
        'Accept-Encoding': 'gzip, deflate',
        'Accept-Language': 'en-US,en;q=0.9,ru;q=0.8',
        Connection: 'keep-alive',
        Host: `${host}`,
        Referer: `${url}/cgi-bin/nav.pl?page=menu&in=home`,
        'Upgrade-Insecure-Requests': '1',
        'User-Agent':
          'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36',
      },
    })
    check(response, {"status is 200": (r) => r.status === 200});

    response = http.get(`${url}/cgi-bin/nav.pl?page=menu&in=flights`, {
      headers: {
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
        'Accept-Encoding': 'gzip, deflate',
        'Accept-Language': 'en-US,en;q=0.9,ru;q=0.8',
        Connection: 'keep-alive',
        Host: `${host}`,
        Referer: `${url}/cgi-bin/welcome.pl?page=search`,
        'Upgrade-Insecure-Requests': '1',
        'User-Agent':
          'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36',
      },
    })
    check(response, {"status is 200": (r) => r.status === 200});

    response = http.get(`${url}/cgi-bin/reservations.pl?page=welcome`, {
      headers: {
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
        'Accept-Encoding': 'gzip, deflate',
        'Accept-Language': 'en-US,en;q=0.9,ru;q=0.8',
        Connection: 'keep-alive',
        Host: `${host}`,
        Referer: `${url}/cgi-bin/welcome.pl?page=search`,
        'Upgrade-Insecure-Requests': '1',
        'User-Agent':
          'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36',
      },
    })
    check(response, {"status is 200": (r) => r.status === 200});
    parseHTML(response.body).find('select[name="depart"] option').toArray().forEach( (element) => {
      departures.push(element.attr("value"));
    });
    parseHTML(response.body).find('select[name="arrive"] option').toArray().forEach( (element) => {
      arrivals.push(element.attr("value"));
    });

    response = http.get(`${url}/WebTours/images/in_flights.gif`, {
      headers: {
        Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'Accept-Encoding': 'gzip, deflate',
        'Accept-Language': 'en-US,en;q=0.9,ru;q=0.8',
        Connection: 'keep-alive',
        Host: `${host}`,
        Referer: `${url}/cgi-bin/nav.pl?page=menu&in=flights`,
        'User-Agent':
          'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36',
      },
    })
    check(response, {"status is 200": (r) => r.status === 200});

    response = http.get(`${url}/WebTours/images/itinerary.gif`, {
      headers: {
        Referer: `${url}/cgi-bin/nav.pl?page=menu&in=flights`,
        'User-Agent':
          'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36',
      },
    })
    check(response, {"status is 200": (r) => r.status === 200});

    response = http.get(`${url}/WebTours/images/home.gif`, {
      headers: {
        Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'Accept-Encoding': 'gzip, deflate',
        'Accept-Language': 'en-US,en;q=0.9,ru;q=0.8',
        Connection: 'keep-alive',
        Host: `${host}`,
        Referer: `${url}/cgi-bin/nav.pl?page=menu&in=flights`,
        'User-Agent':
          'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36',
      },
    })
    check(response, {"status is 200": (r) => r.status === 200});

    response = http.get(`${url}/WebTours/images/signoff.gif`, {
      headers: {
        Referer: `${url}/cgi-bin/nav.pl?page=menu&in=flights`,
        'User-Agent':
          'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36',
      },
    })
    check(response, {"status is 200": (r) => r.status === 200});

    response = http.get(`${url}/WebTours/images/button_next.gif`, {
      headers: {
        Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'Accept-Encoding': 'gzip, deflate',
        'Accept-Language': 'en-US,en;q=0.9,ru;q=0.8',
        Connection: 'keep-alive',
        Host: `${host}`,
        Referer: `${url}/cgi-bin/reservations.pl?page=welcome`,
        'User-Agent':
          'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36',
      },
    })
    check(response, {"status is 200": (r) => r.status === 200});

  })

  return {departures: departures, arrivals: arrivals}
}


export function findFlight(departures, arrivals) {
  let airplanes = []

  group('findFlight', function () {
    let response;

    const departure = departures[Math.floor(Math.random() * departures.length)]
    const arrive = arrivals[Math.floor(Math.random() * arrivals.length)]
    let payload = {
      "advanceDiscount":"0",
      "depart":`${departure}`,
      "departDate":`${departDate}`,
      "arrive":`${arrive}`,
      "returnDate":`${returnDate}`,
      "numPassengers":"1",
      "seatPref":"None",
      "seatType":"Coach",
      "findFlights.x":"37",
      "findFlights.y":"10",
      ".cgifields":"roundtrip,seatType,seatPref"
    }
    response = http.post(
      `${url}/cgi-bin/reservations.pl`,
      JSON.stringify(payload),
      {
        headers: {
          Accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
          'Accept-Encoding': 'gzip, deflate',
          'Accept-Language': 'en-US,en;q=0.9,ru;q=0.8',
          'Cache-Control': 'max-age=0',
          Connection: 'keep-alive',
          'Content-Type': 'application/x-www-form-urlencoded',
          Host: `${host}`,
          Origin: `${url}`,
          Referer: `${url}/cgi-bin/reservations.pl?page=welcome`,
          'Upgrade-Insecure-Requests': '1',
          'User-Agent':
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36',
        },
      }
    )
    check(response, {"status is 200": (r) => r.status === 200});
    parseHTML(response.body).find('input[name="outboundFlight"]').toArray().forEach( (element) => {
      airplanes.push(element.attr("value"));
    });

    response = http.get(`${url}/WebTours/images/button_next.gif`, {
      headers: {
        Referer: `${url}/cgi-bin/reservations.pl`,
        'User-Agent':
          'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36',
      },
    })
    check(response, {"status is 200": (r) => r.status === 200});

  })

  return airplanes
}


export function chooseAirplane(airplane) {
  group('chooseAirplane', function () {
    let response;

    response = http.post(
      `${url}/cgi-bin/reservations.pl`,
      {
        outboundFlight: `${airplane}`,
        numPassengers: '1',
        advanceDiscount: '0',
        seatType: 'Coach',
        seatPref: 'None',
        'reserveFlights.x': '64',
        'reserveFlights.y': '11',
      },
      {
        headers: {
          Accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
          'Accept-Encoding': 'gzip, deflate',
          'Accept-Language': 'en-US,en;q=0.9,ru;q=0.8',
          'Cache-Control': 'max-age=0',
          Connection: 'keep-alive',
          'Content-Type': 'application/x-www-form-urlencoded',
          Host: `${host}`,
          Origin: `${url}`,
          Referer: `${url}/cgi-bin/reservations.pl`,
          'Upgrade-Insecure-Requests': '1',
          'User-Agent':
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36',
        },
      }
    )
    check(response, {"status is 200": (r) => r.status === 200});

    response = http.get(`${url}/WebTours/images/button_next.gif`, {
      headers: {
        Referer: `${url}/cgi-bin/reservations.pl`,
        'User-Agent':
          'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36',
      },
    })
    check(response, {"status is 200": (r) => r.status === 200});

  })
}


export function paymentDetails(user, airplane) {
  group('paymentDetails', function () {
    let response;

    response = http.post(
      `${url}/cgi-bin/reservations.pl`,
      JSON.stringify({
        firstName: `${user.login}`,
        lastName: `${user.login}`,
        address1: '',
        address2: '',
        pass1: `${user.login} ${user.login}`,
        creditCard: '',
        expDate: '',
        oldCCOption: '',
        numPassengers: '1',
        seatType: 'Coach',
        seatPref: 'None',
        outboundFlight: `${airplane}`,
        advanceDiscount: '0',
        returnFlight: '',
        JSFormSubmit: 'off',
        'buyFlights.x': '42',
        'buyFlights.y': '10',
        '.cgifields': 'saveCC',
      }),
      {
        headers: {
          Accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
          'Accept-Encoding': 'gzip, deflate',
          'Accept-Language': 'en-US,en;q=0.9,ru;q=0.8',
          'Cache-Control': 'max-age=0',
          Connection: 'keep-alive',
          'Content-Type': 'application/x-www-form-urlencoded',
          Host: `${host}`,
          Origin: `${url}`,
          Referer: `${url}/cgi-bin/reservations.pl`,
          'Upgrade-Insecure-Requests': '1',
          'User-Agent':
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36',
        },
      }
    )
    check(response, {"status is 200": (r) => r.status === 200});
    let cookies = http.cookieJar().cookiesForURL(response.url);
    console.log("Cookies::"+JSON.stringify(cookies));

    response = http.get(`${url}/WebTours/images/bookanother.gif`, {
      headers: {
        Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'Accept-Encoding': 'gzip, deflate',
        'Accept-Language': 'en-US,en;q=0.9,ru;q=0.8',
        Connection: 'keep-alive',
        Host: `${host}`,
        Referer: `${url}/cgi-bin/reservations.pl`,
        'User-Agent':
          'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36',
      },
    })
    check(response, {"status is 200": (r) => r.status === 200});

  })
}


export function backToRoot() {
  group('backToRoot', function () {
    let response;
    response = http.post(
      `${url}/cgi-bin/reservations.pl`,
      {
        'Book+Another.x': '59',
        'Book+Another.y': '7',
      },
      {
        headers: {
          Accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
          'Accept-Encoding': 'gzip, deflate',
          'Accept-Language': 'en-US,en;q=0.9,ru;q=0.8',
          'Cache-Control': 'max-age=0',
          Connection: 'keep-alive',
          'Content-Type': 'application/x-www-form-urlencoded',
          Host: `${host}`,
          Origin: `${url}`,
          Referer: `${url}/cgi-bin/reservations.pl`,
          'Upgrade-Insecure-Requests': '1',
          'User-Agent':
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36',
        },
      }
    )
    check(response, {"status is 200": (r) => r.status === 200});

    response = http.get(`${url}/WebTours/images/button_next.gif`)
    check(response, {"status is 200": (r) => r.status === 200});

  })
}
