let speakMock = jest.fn(() => handlerInput.responseBuilder);
let getResponseMock = jest.fn(() => handlerInput.responseBuilder);

const responseBuilder = {       //same for all intents so far
        speak: speakMock,
        reprompt: speakMock,
        getResponse: getResponseMock,
}

const handlerInput = {
    responseBuilder,
    requestEnvelope: {
        request: {
            type: 'IntentRequest',
            intent: {
                name: 'ListReposIntent',
                confirmationStatus: "NONE",
                slots: {
                    username: {
                        value: 'default',
                    },
                }
            }
        }
    }
};

exports.listReposInput = function(username) {
    handlerInput.requestEnvelope.request.intent.slots.username.value = username;
    return handlerInput;
};