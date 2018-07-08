Jenkins Agent
================
## Certbot

### Générate cetificats
```
docker run -it --rm --name certbot \
  -v "$(pwd)/log/certbot:/var/log/letsencrypt" \
  -v "$(pwd)/data/certs:/etc/letsencrypt" \
  -v "$(pwd)/data/letsencrypt:/var/lib/letsencrypt" \
  -p 80:80 \
   certbot/certbot certonly --agree-tos --standalone \
  -m jmorille+certbot@gmail.com -d put92-4-82-231-50-171.fbx.proxad.net
```
 
## Nginx

### Check modules
```
docker run -t nginx:latest nginx -V 
```
            
## Dialg flow
https://console.dialogflow.com

### Doc
https://dialogflow.com/docs/actions-and-parameters

#### WebHook
https://dialogflow.com/docs/reference/v2-comparison

* Message format: https://dialogflow.com/docs/reference/api-v2/rest/v2beta1/projects.agent.intents#Message
* Google payload: https://developers.google.com/actions/assistant/responses#carousel
* User info: https://developers.google.com/actions/assistant/helpers#user_information
** https://developers.google.com/actions/dialogflow/webhook
** https://developers.google.com/actions/assistant/helpers#user_information
** https://developers.google.com/actions/reference/rest/intents

## Google assistant deploy
https://console.actions.google.com/project/jenkinsagent-25566/overview/details