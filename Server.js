const express = require('express');
const fetch = require('node-fetch');
const moment = require('moment'); //Package to generate timestamp
const app = express();
require('dotenv').config(); //Allow acces to environment Variables
const port = process.env.PORT;
//Allows our express server to be able to handle JSON data 
app.use(express.json());
//Hosts my Static HTML and CSS files
app.use('/', express.static('public'))

//headers.append('Content-Type', 'text/json');
app.get('/token',(req,res)=>{
	//Authantication End Point
	let url = 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials';
	let username = process.env.CONSUMER_KEY;
	let password = process.env.CONSUMER_SECRET;
	fetch(url, {method:'GET',
        headers: {
			"Authorization": 'Basic ' + `${Buffer.from(username + ":" + password).toString('base64')}`,
			"Content-type": "application/json",
			"Accept": "application/json",
			"Accept-Charset": "utf-8"
		},
       })
	.then(response => response.json())
	.then(json => res.json(json));
	//.done()
})


app.post('/lipa',(req,res)=>{
	let url = "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest";
	let {access_token,PhoneNumber,Amount} = req.body;
	let Timestamp= moment().format('YYYYMMDDHHmmss');
	let ShortCode = process.env.SHORT_CODE;
	let PassKey = process.env.PROCESS_PASSKEY;
	let Password = new Buffer.from(ShortCode+PassKey+Timestamp).toString('base64')
	let bearer = 'Bearer ' + access_token;
	let AccountReference ="SiJothamPS";
	let TransactionDesc="test"
	let request = {
		BusinessShortCode: ShortCode,
		Password,
		Timestamp,
		TransactionType: "CustomerPayBillOnline",
		Amount,
		PartyA: PhoneNumber,
		PartyB:ShortCode,
		PhoneNumber,
		CallBackURL: process.env.CALL_BACK_URL,
		AccountReference,
		TransactionDesc
	  }
	let body = JSON. stringify(request)
	console.log(body)
	fetch(url, {
		method: 'POST',
		headers: {
			'Accept': 'application/json',
			'Authorization': bearer,
			'Content-Type': 'application/json'
		},
		body
	}).then(response => response.json())
	  .then(data => res.json(data))
})




//Web hooks for Mpesa to verify trasaction is successful
app.post('/hooks/mpesa',(req,res)=>{
	let message = {
	  "ResponseCode": "00000000",
	  "ResponseDesc": "success"
	};
	res.json(message)
})

app.listen(port,() =>{
	console.log(`Listening http://localhost:${port}`)
  })
