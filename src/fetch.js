import axios from "axios";

axios.get("https://dev.mattr.art/read/unpossible", {headers: {"X-Auth-Key": "77737774"}}).then((res) => {
    console.log(res.data);
}).catch((err) => {
    console.error(err);
});