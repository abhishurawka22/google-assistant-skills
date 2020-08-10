const mocks = require('./mocks.js');
const helper = require('../shared/Helper.js');

test('get list of names', () => {  
    var username = 'hebertca18';
    var speechBefore = `Here are the repositories for ${username} <break time=\".5s\"/>`;
    var speechAfter = `Here are the repositories for ${username} <break time=\".5s\"/>srp-facade-lab, SustainRMVP, tddAsgn`;
    expect(helper.parseListOfNamesResponse(mocks.listReposResponse, speechBefore))
        .toEqual(speechAfter);
});
