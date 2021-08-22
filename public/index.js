document.querySelector("form").addEventListener("submit", (event) => {
  event.preventDefault();
});

const PhoneContainer = document.getElementById("Phone");
const emoji = document.getElementById("emoji1");

//Not used but if you know what is required 
async function gettoken() {
  const response = await fetch("/token");
  const data = await response.json();
  return data;
}

async function sendPaymentRequest() {
  let PhoneNumber = await parseNumber(PhoneContainer.value);
  let data = { PhoneNumber };
  let response = await fetch("/lipa", {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  let responseData = await response.json()
  if (responseData["ResponseDescription"] = "Success. Request accepted for processing") {
    emoji.innerHTML = "😊Thang U😊";
  }
  console.log(responseData);
}

async function parseNumber(number) {
  return "254" + Number(number).toString();
}