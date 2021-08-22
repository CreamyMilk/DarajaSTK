const express = require("express");
const moment = require("moment"); //Package to generate timestamp
const fetch = require("node-fetch");
const app = express();
require("dotenv").config(); //Allow acces to environment Variables
const port = process.env.PORT;
let callBacksStore = []; // This should be any form of persistent storage
app.use(express.json());
app.use("/", express.static("public"));

async function getAccessToken() {
  let url =
    "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials";
  let username = process.env.CONSUMER_KEY;
  let password = process.env.CONSUMER_SECRET;
  let response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization:
        "Basic " +
        `${Buffer.from(username + ":" + password).toString("base64")}`,
      "Content-type": "application/json",
      Accept: "application/json",
      "Accept-Charset": "utf-8",
    },
  });
  let data = await response.json();
  console.log(data)
  return data;
}

async function sendPaymentRequest(PhoneNumber) {
  console.log("Phonezz",PhoneNumber)
  let url = "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest";    // This url varies depending on wether this is for testing or a live depliyment
  let tokenResponse = await getAccessToken()
  let AccessToken   = tokenResponse["access_token"];
  let Timestamp     = moment().format("YYYYMMDDHHmmss");
  let ShortCode     = process.env.SHORT_CODE;
  let PassKey       = process.env.PROCESS_PASSKEY;
  let Password      = new Buffer.from(ShortCode + PassKey + Timestamp).toString("base64");
  let bearer = "Bearer " + AccessToken;
  let AccountReference = "NotJotham"; // You can customise this for record Keeping
  let TransactionDesc = "simple";
  let Amount = '1'; //The amount payable
  let request = {
    BusinessShortCode: ShortCode,
    Password,
    Timestamp,
    TransactionType: "CustomerPayBillOnline",
    Amount,
    PartyA: PhoneNumber,
    PartyB: ShortCode,
    PhoneNumber,
    CallBackURL: process.env.CALL_BACK_URL,
    AccountReference,
    TransactionDesc,
  };
  let reqFormat= {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: bearer,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  }

  let response = await fetch(url,reqFormat);
  let data = await response.json();

  console.log(reqFormat)
  console.log(data)
  callBacksStore.push(data)
  return data;
}
app.get("/token", async (req, res) => {
  let tokenResponse = await getAccessToken();
  res.json(tokenResponse);
});

app.post("/lipa", async (req, res) => {
  let { PhoneNumber } = req.body;
  console.table(req.body)
  let lipaResponse = await sendPaymentRequest(PhoneNumber);
  res.json(lipaResponse);
});

//Web hooks for Mpesa to verify trasaction is successful
app.post("/reactive/hooks", (req, res) => {
  let message = {
    ResponseCode: "00000000",
    ResponseDesc: "success",
  };
  callBacksStore.push(req.body)
  res.json(message);
});

app.get("/callbacks", (req, res) => {
  res.json(callBacksStore);
});

app.listen(port, () => {
  console.log(`Listening http://localhost:${port}`);
});
