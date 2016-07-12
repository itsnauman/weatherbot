# Weather Bot
A bot for fetching weather conditions and forecasts using a natural language interface.

### Install LUIS Model
The sample is coded to use a version of the LUIS models deployed to my LUIS account. If you would like to deploy your own copy of the model, I have included it in the models folder.

Import the model as an Appliction into your LUIS account (http://luis.ai) and assign the models service url to an environment variable called model.

    set LUIS_MODEL="MODEL_URL"

### Usage
Install dependencies using `npm install` and to run the bot from a console window execute "npm run start".

### BotConnectorBot Usage
To run the bot using the Bot Framework Emulator open a console window and execute:

    set appId=YourAppId
    set appSecret=YourAppSecret
    node botConnectorBot.js

Then launch the Bot Framework Emulator, connect to http://localhost:8080/v1/messages, and say "How's the weather in new york?".

To publish the bot to the Bot Connector Service follow the steps outlined in the article below.

    http://docs.botframework.com/builder/node/bots/BotConnectorBot/#publishing
