// index.js
// 简单版：手动更新 Cookie，支持两台 KISX100

const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

// === 1. Sharp 控制 API ===
const SHARP_URL =
  "https://cocoroplusapp.jp.sharp/v1/cocoro-air/sync/air-cleaner";

// ✅ 每次 Cookie 失效，就在 F12 里从任意成功的 /sync/air-cleaner 请求中
// 复制整条 “Cookie:” 的值，贴到这里（字符串完整保留）
const COOKIE =
  'jsessionid=aa90e6153b611d791d2fcf57876f2515deefdb8395b1e1e8e8d0997552b7409b; __ulfpc=202511131710192510; _ga=GA1.1.1699515766.1763021420; _yjsu_yjad=1763021429.e3987e3d-5776-4828-ab9f-f55f4a9d30ef; _fbp=fb.1.1763021430023.292972934676934523; _gcl_au=1.1.447730744.1763021419.1545637172.1763021435.1763021434; _ga_TB0LTTTG8W=GS2.1.s1763021429$o1$g0$t1763021436$j53$l0$h0; _ga_VHQX38ELP8=GS2.1.s1763021429$o1$g0$t1763021436$j53$l0$h0; _ga_KNQMGS7V8C=GS2.1.s1763085024$o2$g1$t1763085030$j54$l0$h0; _ga_CLV2799SMH=GS2.1.s1763085024$o2$g1$t1763085030$j54$l0$h0; _ga_E9NZ25ZMZ0=GS2.1.s1763085024$o2$g1$t1763085030$j54$l0$h0; _ga_6MQ8VF2DKW=GS2.1.s1763085024$o2$g1$t1763085030$j54$l0$h0';

// === 2. 你的帐号（现在先不用，之后如果做自动登录会用到） ===
// 你刚刚说选 A，所以先硬编码在这儿
const ACCOUNT = {
  memberId: "kasoulss@gmail.com",
  password: "iamlegend111",
};

// === 3. 两台机器的 deviceToken ===
// 第一台（你最早贴出来的）
const DEVICE1_TOKEN =
  "1125b114249445ed3fc2b5072b9c5a03349565f16e233a7b55842b5e7436424b";

// 第二台（你刚刚贴的）
const DEVICE2_TOKEN =
  "10761bd910414dfa05d0aa0ff72bc23d437b828b18852e2426da357e1878c9b4";

// === 4. Sharp API 请求头 ===
const HEADERS = {
  Accept: "*/*",
  "Accept-Language": "zh-CN,zh;q=0.9,ja;q=0.8,en;q=0.7",
  Origin: "https://cocoroplusapp.jp.sharp",
  Referer: "https://cocoroplusapp.jp.sharp/air/devicelist",
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36",
  Cookie: COOKIE,
  "Content-Type": "application/json",
};

// === 5. 生成 echonet_control payload ===
// on = true  -> 开机
// on = false -> 关机
function makeEchonetPayload(deviceToken, on) {
  return {
    deviceToken,
    model_name: "KISX100",
    event_key: "echonet_control",
    additional_request: true,
    data: [
      {
        epc: "0x80",
        edt: on ? "0x30" : "0x31",
      },
      {
        opc: "k3",
        odt: {
          s6: on ? "FF" : "00",
        },
      },
    ],
  };
}

// === 6. 通用调用函数 ===
async function sharpControl(payload) {
  try {
    const res = await axios.post(SHARP_URL, payload, {
      headers: HEADERS,
    });
    return {
      ok: true,
      status: res.status,
      data: res.data,
    };
  } catch (err) {
    return {
      ok: false,
      status: err.response?.status ?? null,
      error: err.response?.data ?? err.toString(),
    };
  }
}

// === 7. 路由：第一台 ===

// 第一台开机
app.get("/air1/on", async (req, res) => {
  const payload = makeEchonetPayload(DEVICE1_TOKEN, true);
  const result = await sharpControl(payload);
  res.json(result);
});

// 第一台关机
app.get("/air1/off", async (req, res) => {
  const payload = makeEchonetPayload(DEVICE1_TOKEN, false);
  const result = await sharpControl(payload);
  res.json(result);
});

// === 8. 路由：第二台 ===

// 第二台开机
app.get("/air2/on", async (req, res) => {
  const payload = makeEchonetPayload(DEVICE2_TOKEN, true);
  const result = await sharpControl(payload);
  res.json(result);
});

// 第二台关机
app.get("/air2/off", async (req, res) => {
  const payload = makeEchonetPayload(DEVICE2_TOKEN, false);
  const result = await sharpControl(payload);
  res.json(result);
});

// 根路径：健康检查
app.get("/", (req, res) => {
  res.json({ msg: "Sharp Controller for 2x KISX100 is running" });
});

// Cloud Run 需要监听 PORT 环境变量
const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log("Server is running on port", port);
});
