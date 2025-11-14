const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

// Sharp Cloud API
const SHARP_URL = "https://cocoroplusapp.jp.sharp/v1/cocoro-air/sync/air-cleaner";

// 你抓包得到的 cookie（如果失效，请重新抓）
const COOKIE = "jsessionid=db3e1a40cd83ed216f30d4fe18796c8368a0032780473c6bf6c65a7c385b2a34; __ulfpc=202511131710192510; _ga=GA1.1.1699515766.1763021420; _yjsu_yjad=1763021429.e3987e3d-5776-4828-ab9f-f55f4a9d30ef; _fbp=fb.1.1763021430023.292972934676934523; _gcl_au=1.1.447730744.1763021419.1545637172.1763021435.1763021434; _ga_TB0LTTTG8W=GS2.1.s1763021429$o1$g0$t1763021436$j53$l0$h0; _ga_VHQX38ELP8=GS2.1.s1763021429$o1$g0$t1763021436$j53$l0$h0; _ga_KNQMGS7V8C=GS2.1.s1763021420$o1$g1$t1763021947$j14$l0$h0; _ga_CLV2799SMH=GS2.1.s1763021420$o1$g1$t1763021947$j14$l0$h0; _ga_E9NZ25ZMZ0=GS2.1.s1763021420$o1$g1$t1763021947$j14$l0$h0; _ga_6MQ8VF2DKW=GS2.1.s1763021420$o1$g1$t1763021947$j14$l0$h0";

const HEADERS = {
    "Accept": "*/*",
    "Accept-Language": "zh-CN,zh;q=0.9,ja;q=0.8,en;q=0.7",
    "Origin": "https://cocoroplusapp.jp.sharp",
    "Referer": "https://cocoroplusapp.jp.sharp/air/ap/main/status",
    "User-Agent": "Mozilla/5.0",
    "Cookie": COOKIE,
    "Content-Type": "application/json"
};

// 第一台设备的信息（你抓包得到）
const DEVICE_1 = {
    deviceToken: "1125b114249445ed3fc2c5072b9c5a03349565f16e233a7b55842b5e7436424b",
    model_name: "KISX100"
};


// 封装发送控制的函数
async function controlDevice(payload) {
    try {
        const res = await axios.post(SHARP_URL, payload, { headers: HEADERS });
        return { ok: true, status: res.status, data: res.data };
    } catch (err) {
        return {
            ok: false,
            status: err.response?.status,
            error: err.response?.data || err.toString()
        };
    }
}


// ============= 开机 =============
app.get("/power/on", async (req, res) => {
    const payload = {
        deviceToken: DEVICE_1.deviceToken,
        event_key: "echonet_control",
        model_name: DEVICE_1.model_name,
        additional_request: true,
        data: [
            { epc: "0x80", edt: "0x30" },        // 电源 ON
            { opc: "k3", odt: { s6: "FF" } }    // 运行
        ]
    };
    res.json(await controlDevice(payload));
});


// ============= 关机 =============
app.get("/power/off", async (req, res) => {
    const payload = {
        deviceToken: DEVICE_1.deviceToken,
        event_key: "echonet_control",
        model_name: DEVICE_1.model_name,
        additional_request: true,
        data: [
            { epc: "0x80", edt: "0x31" },        // 电源 OFF
            { opc: "k3", odt: { s6: "00" } }     // 停止运转
        ]
    };
    res.json(await controlDevice(payload));
});


// 根路径
app.get("/", (req, res) => {
    res.json({ msg: "Sharp Controller 1 Ready" });
});


// Cloud Run 监听 PORT
const port = process.env.PORT || 8080;
app.listen(port, () => console.log("Server running on port", port));
