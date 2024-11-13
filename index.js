const fetch = require('cross-fetch');
const { Headers } = fetch
const express = require('express');
const app = express();
const { port,
    apiKey_bubble,
    endpoint_bubble,
    endpoint_discord,
    authToken_discord,
    guildId,
    adminRoleId,
    endpoint_stripe,
    apiKey_stripe,
    product_subscription,
    product_renovation
} = require('./config');

//Funcion para actualizar el plan de Stripe (si tiene el plan inicial)
function updateStripePlan() {
    var myHeaders = new Headers();
    myHeaders.append("Authorization", apiKey_stripe);

    var requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow'
    };

    let constraints_stripe = "status=active";

    fetch(`${endpoint_stripe}subscriptions?${constraints_stripe}`, requestOptions)
        .then(res => {
            if (res.status >= 400) {
                throw new Error("Bad response from server");
            }
            return res.json();
        })
        .then(subscritpion => {
            subscritpion.data.forEach(data => {

                // Convert Unix string to a Date variable
                var subEndDate = new Date(parseInt(data.current_period_end) * 1000);

                // Extract the day from the date
                var subEndDay = subEndDate.getDate();

                // Get the current day
                var currentDate = new Date();
                var currentDay = currentDate.getDate();

                if (data.plan.product === product_subscription) {

                    // Compare the Unix day with the current day
                    if (subEndDay === currentDay) {

                        //Update subscription plan
                        var myHeaders = new Headers();
                        myHeaders.append("Authorization", apiKey_stripe);
                        myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

                        var urlencoded = new URLSearchParams();
                        urlencoded.append("plan", product_renovation);

                        var requestOptions = {
                            method: 'POST',
                            headers: myHeaders,
                            body: urlencoded,
                            redirect: 'follow'
                        };

                        fetch(`${endpoint_stripe}subscriptions/${data.id}`, requestOptions)
                            .then(response => response.text())
                            .then(result => console.log("Stripe User Plan Updated: " + result))
                            .catch(error => console.log('Error Updating Stripe User Plan ', error));


                    }

                }
            });
        })
}

//Funcion asincrona que obtiene los usuarios de la BD de bubble individualmente
async function getBubbleUsers(filter) {
    let constraints = [
        {
            "key": "discordUserNick",
            "constraint_type": "equals",
            "value": filter.discord_user_name.toLowerCase()
        },
        {
            "key": "status",
            "constraint_type": "equals",
            "value": "Activo"
        }];

    const response = await fetch(`${endpoint_bubble}obj/User?constraints=${JSON.stringify(constraints)}`)
    const data = await response.json();
    if (data.response.results)
        return data.response.results[0];
}


//Funcion que valida la lista de usuarios de discord comparandola con la de BD de bubble
async function validateDiscordMembers() {
    let lastUser = "";
    let completed = false;
    let filter = { "discord_user_name": "" };

    /* do {

    } while (!completed); */

    var myHeaders = new Headers();
    myHeaders.append("Authorization", authToken_discord);

    var requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow'
    };

    fetch(`${endpoint_discord}guilds/${guildId}/members?limit=1000`, requestOptions)
        .then(response => response.json())
        .then(data =>

            data.forEach(async member => {
                if (!member.user.bot && !member.roles.includes(adminRoleId)) {
                    filter.discord_user_name = member.user.username.toString();

                    let user = await getBubbleUsers(filter);
                    filter.discord_user_name = "";
                    if (!user) {

                        var myHeaders = new Headers();
                        myHeaders.append("Authorization", authToken_discord);

                        var requestOptions = {
                            method: 'DELETE',
                            headers: myHeaders,
                            redirect: 'follow'
                        };

                        fetch(`${endpoint_discord}guilds/${guildId}/members/${member.user.id}`, requestOptions)
                            .then(response => {
                                console.log("Discord user not found: " + member.user.username);
                            }).catch(error => console.log('error', error));
                    }
                    else if (member.user.id !== user.discordUserId) {

                        //         /*Triada CHANGE DISCORD USER ID*/
                        console.log(member.user.username + " : " + member.user.id, "is = " + user.discordUserId + " : " + user.discordUserNick);

                        var myHeaders = new Headers();
                        myHeaders.append("Authorization", apiKey_bubble);
                        myHeaders.append("Content-Type", "application/json");

                        var raw = JSON.stringify({
                            "discordUserId": member.user.id
                        });

                        var requestOptions = {
                            method: 'PATCH',
                            headers: myHeaders,
                            body: raw,
                            redirect: 'follow'
                        };

                        fetch(`${endpoint_bubble}obj/User/${user._id}`, requestOptions)
                            .then(response => response.text())
                            .then(result => console.log("Update Bubble user discUserId " + user))
                            .catch(error => console.log('error', error));

                        //         /*Triada CHANGE DISCORD USER ID*/

                    }
                }

            })
        )
        .catch(error => console.log('error', error));


}

function runServices() {
    console.log(apiKey_bubble);
    
    // updateStripePlan();
    // validateDiscordMembers();
}


//Idiomatic expression in express to route and respond to a client request
app.get('/', (req, res) => {
    runServices();        //get requests to the root ("/") will route here
    res.status(200).send();
    //the .sendFile method needs the absolute path to the file, see: https://expressjs.com/en/4x/api.html#res.sendFile 
});

app.listen(port, () => {            //server starts listening for any attempts from a client to connect at port: {port}
    console.log(`Now listening on port ${port}`);
});
