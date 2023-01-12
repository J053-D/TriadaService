const fetch = require('cross-fetch');
const express = require('express');
const cron = require('node-cron');
const app = express();
const { port, frequence, masterKey, endpoint } = require('./config');
const currentDate = new Date();

function validateSubscription() {
    let constraints = [
        {
            "key": "status",
            "constraint_type": "equals",
            "value": "Activo"
        }
    ]
    fetch(`${endpoint}obj/User?constraints=${JSON.stringify(constraints)}`)
        .then(res => {
            if (res.status >= 400) {
                throw new Error("Bad response from server");
            }
            return res.json();
        })
        .then(data => {

            data.response.results.forEach(element => {
                if (element.subscription != null)
                    fetch(`${endpoint}obj/Subscription/${element.subscription}`)
                        .then(res => {
                            if (res.status >= 400) {
                                throw new Error("Bad response from server");
                            }
                            return res.json();
                        })
                        .then(res => {
                            var expiryTime = new Date(res.response.nextPay);

                            if (currentDate.getTime() >= expiryTime.getTime()) {

                                if (res.response.subscriptionType != "Renovation" && res.response.subscriptionType != "Trial") {

                                    var myHeaders = new fetch.Headers();
                                    myHeaders.append("Authorization", masterKey);
                                    myHeaders.append("Content-Type", "application/json");

                                    var raw = JSON.stringify({
                                        "_id": element._id
                                    });

                                    var requestOptions = {
                                        method: 'POST',
                                        headers: myHeaders,
                                        body: raw,
                                        redirect: 'follow'
                                    };

                                    fetch(`${endpoint}wf/createTrialSub/`, requestOptions)
                                }
                                else {
                                    var myHeaders = new fetch.Headers();
                                    myHeaders.append("Authorization", masterKey);
                                    myHeaders.append("Content-Type", "application/json");

                                    var raw = JSON.stringify({
                                        "status": "Inactivo"
                                    });

                                    var requestOptions = {
                                        method: 'PATCH',
                                        headers: myHeaders,
                                        body: raw,
                                        redirect: 'follow'
                                    };

                                    fetch(`${endpoint}obj/User/${element._id}`, requestOptions)
                                }

                            }
                        });

            })

        });
}
validateSubscription()
// cron.schedule(`${frequence}`, () => { validateSubscription() });
//Idiomatic expression in express to route and respond to a client request
app.get('/', (req, res) => {        //get requests to the root ("/") will route here
    res.sendFile('index.html', { root: __dirname });      //server responds by sending the index.html file to the client's browser
    //the .sendFile method needs the absolute path to the file, see: https://expressjs.com/en/4x/api.html#res.sendFile 
});

app.listen(port, () => {            //server starts listening for any attempts from a client to connect at port: {port}
    console.log(`Now listening on port ${port}`);
});