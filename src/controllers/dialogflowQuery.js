const fetch = require('node-fetch');

exports.query = async (ctx) => {
    // BUSINESS LOGIC
    const data = {
        "app": "HDF",

    };
    const sessionId = "1521582415689";
   // const sessionId = "projects/jenkinsagent-25566/agent/sessions/1521578292994";
    await queryDialogV1(sessionId, "app-compile", data).then(res => {
        ctx.body = res;
    })

    //ctx.res.ok(data, 'Hello, API!');
};

function queryDialogV1(sessionId, event, data) {
    const body =  {
        event: {
            name: event, data
        },
        "fulfillment": {
            "speech": "Coucou mon zozo",
            "type": 0
        },
        "lang": "fr", sessionId
    }
    const opt = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer 07b993d378df483bbd4241fb2513e673"
        },
        body: JSON.stringify(body)

    }
    return fetch("https://api.dialogflow.com/v1/query?v=20170712", opt).then(res => res.json());
//    return fetch("https://dialogflow.googleapis.com/query", opt).then(res.json());
}

function queryDialogV2(sessionId, event, data) {
    const body = {
        "queryInput": {
            "event": {
                "name": "toto",
                "parameters": { "app": "HDF", "$app": "HDF" },
                "languageCode": "fr"
            }
        }
    };
    const opt = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer ya29.c.El-EBXOP1Xv0HAIigoXZTVu_5i6fEJYVL_uEv8zkP2sdXC6nydhbz-11Jfbd7P33PB2HWgRKTnHX21KnYwqgXZ8xoe5U26XlKxpn23TD-AfFBnsjCQU3UYlqhIid58fieQ"
        },
        body: JSON.stringify(body)
    }
    console.log("fetch ", `https://dialogflow.googleapis.com/v2beta1/${sessionId}:detectIntent`);
    return fetch(`https://dialogflow.googleapis.com/v2beta1/${sessionId}:detectIntent`, opt).then(res => res.json());
}