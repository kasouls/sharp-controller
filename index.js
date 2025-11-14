const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

// Sharp Cloud API
const SHARP_URL = "https://cocoroplusapp.jp.sharp/v1/cocoro-air/sync/air-cleaner";

// 你抓到的 Cookie（注意：若过期需重新抓）
const COOKIE = "jsessionid=db3e1a40cd83ed216f30d4fe18796c8368a0032780473c6bf6c65a7c385b2a34; __ulfpc=202511131710192510; _ga=GA1.1.1699515766.1763021420; _yjsu_yjad=1763021429.e3987e3d-5776-4828-ab9f-f55f4a9d30ef; _fbp=fb.1.1763021430023.292972934676934523; _gcl_au=1.1.447730744.1763021419.1545637172.1763021435.1763021434; _ga_TB0LTTTG8W=GS2.1.s1763021429$o1$g0$t1763021436$j53$l0$h0; _ga_VHQX38ELP8=GS2.1.s1763021429$o1$g0$t1763021436$j53$l0$h0; _ga_KNQMGS7V8C=GS2.1.s1763021420$o1$g1$t1763021947$j14$l0$h0; _ga_CLV2799SMH=GS2.1.s1763021420$o1$g1$t1763021947$j14$l0$h0; _ga_E9NZ25ZMZ0=GS2.1.s1763021420$o1$g1$t1763021947$j14$l0$h0; _ga_6MQ8VF2DKW=GS2.1.s1763021420$o1$g1$t1763021947$j14$l0$h0";

// Sharp API 请求头
const HEADERS = {
  "Accept": "*/*",
  "Accept-Language": "zh-CN,zh;q=0.9,ja;q=0.8,en;q=0.7",
  "Origin": "https://cocoroplusapp.jp.sharp",
  "Referer": "https://cocoroplusapp.jp.sharp/air/ap/main/status",
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36",
  "Cookie": COOKIE,
  "Content-Type": "application/json",
};

// 封装请求函数
async function sharpControl(payload) {
  try {
    const res = await axios.post(SHARP_URL, payload, { headers: HEADERS });
    return { ok: true, status: res.status, data: res.data };
  } catch (err) {
    return {
      ok: false,
      status: err.response?.status || null,
      error: err.response?.data || err.toString(),
    };
  }
}

// 开机
app.get("/power/on", async (req, res) => {
  const payload = {
    air_cleaner_operation: "operate",
    air_cleaner_state: { power: "on" }
  };
  res.json(await sharpControl(payload));
});

// 关机
app.get("/power/off", async (req, res) => {
  const payload = {
    air_cleaner_operation: "operate",
    air_cleaner_state: { power: "off" }
  };
  res.json(await sharpControl(payload));
});

// 根路径
app.get("/", (req, res) => {
  res.json({ msg: "Sharp Controller OK" });
});

// Cloud Run 要求监听 PORT 环境变量
const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log("Server is running on port", port);
});
