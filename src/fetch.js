fetch("https://dev.mattr.art/read/unpossible", {
  "headers": {
    "accept": "*/*",
    "accept-language": "en-US,en;q=0.9,bn;q=0.8",
    "cache-control": "no-cache",
    "pragma": "no-cache",
    "priority": "u=1, i",
    "sec-ch-ua": "\"Google Chrome\";v=\"147\", \"Not.A/Brand\";v=\"8\", \"Chromium\";v=\"147\"",
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": "\"Windows\"",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "cross-site",
    "x-auth-key": "77737774"
  },
  "referrer": "http://localhost:5173/",
  "body": null,
  "method": "GET",
  "mode": "cors",
  "credentials": "omit"
}).then(response => response.json()).then(data => console.log(data)).catch(err => console.error(err));