const axios = require("axios");
require("regenerator-runtime/runtime");
//axios.defaults.adapter = require('axios/lib/adapters/https')
const handlers = require('../alexa/index.js');
const mocks = require('./mocks.js');
const inputs = require('./inputs.js');
//const nock = require('nock')
//const API = 'https://api.github.com/';
//var MockAdapter = require("axios-mock-adapter");
jest.mock('axios');

describe('Alexa unit tests', () => {

    beforeAll(() => {

    });

    afterAll(done => {
        jest.clearAllMocks();
        done();
    });

    test('get repositories', async () => {
        //expect.assertions(1);
        var username = 'hebertca18';
        var speech = `Here are the repositories for ${username} <break time=\".5s\"/>srp-facade-lab, SustainRMVP, tddAsgn`;
        axios.get.mockResolvedValue(mocks.listReposResponse);
        const handlerInput = inputs.listReposInput(username);
        expect(handlers.ListReposIntentHandler.canHandle(handlerInput)).toEqual(true);
        await handlers.ListReposIntentHandler.handle(handlerInput);
        expect(handlerInput.responseBuilder.speak).toHaveBeenCalledWith(speech);
    });
});
