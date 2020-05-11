const express = require('express');
const fetch =require('node-fetch');

const app = express();
require('dotenv').config();
const port = process.env.PORT;
//Allows our express server to be able to handle JSON data 
app.use(express.json());
//Hosts my Static HTML and CSS files
app.use('/', express.static('public'))



//Authantication End Point 
app.get('/token',(req,res)=>{
	
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


app.listen(port,() =>{
	console.log(`Listening http://localhost:${port}`)
  })
