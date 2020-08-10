'use strict';

require('dotenv').config();
require('https').globalAgent.options.ca = rootCas;
const api = require('../shared/Api.js');
const helper = require('../shared/Helper.js');
const express = require('express');
const { ExpressAdapter } = require('ask-sdk-express-adapter');
const Alexa = require('ask-sdk-core');
var rootCas = require('ssl-root-cas/latest').create();
const restService = express();
var cors = require('cors')

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
    },
    handle(handlerInput) {
        const speechText = 'Welcome to Robin! What would you like to know today?';
        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
    }
};

const GiveRepoNameHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'GiveRepoNameIntent';
    },
    handle(handlerInput) {
        var repo = handlerInput.requestEnvelope.request.intent.slots.repository.value;
        var speechText = `Who is the owner of the repository ${repo}?`;
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        sessionAttributes['repository'] = repo;
        handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
        return handlerInput.responseBuilder 
            .speak(speechText)  
            .reprompt(speechText)
            .getResponse();
    }
};

const GiveOwnerNameHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'GiveOwnerNameIntent';
    },
    handle(handlerInput) {
        var user = handlerInput.requestEnvelope.request.intent.slots.user.value;
        console.log(user);
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        sessionAttributes['user'] = user;
        var repo = sessionAttributes['repository'];
        handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
        console.log(repo);
        var speechText = `Thank you! You can now ask questions about ${repo} by ${user}.`;
        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
    }
};

function getSessionInfo(sessionAttributes) {
    return [
        helper.parseName(sessionAttributes['repository']),
        helper.parseName(sessionAttributes['user'])
    ];
}

const NumIssuesHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'NumIssuesIntent';
    },
    async handle(handlerInput) {
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        var [repo, user] = getSessionInfo(sessionAttributes);
        var response = await api.getNumIssues(user, repo);
        var speechText = helper.parseNumIssuesResponse(response, repo);
        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
    }
};

const NumPrsHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'GetNumPRsIntent';
    },
    async handle(handlerInput) {
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        var [repo, user] = getSessionInfo(sessionAttributes);
        var response = await api.getNumPRs(user, repo);
        var speechText = helper.parseNumPRsResponse(response, repo);
        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
    }
};

const GetPROwnersHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'GetPROwnersIntent';
    },
    async handle(handlerInput) {
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        var [repo, user] = getSessionInfo(sessionAttributes);
        var strategy = handlerInput.requestEnvelope.request.intent.slots.nameOption.value;
        var response = await api.getPROwners(user, repo);
        var names = helper.createNamesList(response);
        for (var i = 0; i < names.length; i++) {
            var login = names[i];
            var currName = await api.getUser(login);    //parsing is done in handler due to async call for name
            if (currName.data.name !== null) {
                currName = currName.data.name;
                login = login.concat('<break time=".1s"/> or ' + currName);
            }
            names[i] = login;
        }   
        var speechText = `There are currently no p. r. authors in the repository ${repo}`
        if (numNames == 0) {
            return handlerInput.responseBuilder
                .speak(speechText)
                .reprompt(speechText)
                .getResponse();
        }
        names = new Set(names);
        names = Array.from(names);
        console.log(names);
        var namesSubset = helper.parsePROwners(names);
        var numNames = namesSubset.length;
        var speechText = helper.createPROwnersSpeech(namesSubset);
        for (var i = 0; i < numNames; i++) {
            names.shift();
        }     
        //Set session attributes for when user asks for more names
        sessionAttributes['owners'] = names;
        sessionAttributes['currIntent'] = 'GetPROwnersIntent';
        handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
        console.log(handlerInput.requestEnvelope.session.attributes.currIntent);
        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
    }
};

const GetPROwnersLoopHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.YesIntent'
            && handlerInput.requestEnvelope.session.attributes.currIntent === 'GetPROwnersIntent';
    },
    handle(handlerInput) {
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        var names = sessionAttributes.owners;
        var namesSubset = helper.parsePROwners(names);
        var numNames = namesSubset.length;
        if (numNames == 0) {
            //Teardown session attributes
            sessionAttributes['owners'] = names;
            sessionAttributes['currIntent'] = '';
            handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
            var speechText = "All pull request authors have been listed. What would you like to know today??"
            return handlerInput.responseBuilder
                .speak(speechText)
                .reprompt(speechText)
                .getResponse();
        }
        var speechText = helper.createPROwnersSpeech(namesSubset);
        for (var i = 0; i < numNames; i++) {
            names.shift();
        }
        //Set session attributes for when user asks for more names
        sessionAttributes['owners'] = names;
        handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
    }
};

const GetLabelsHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'GetLabelsIntent';
    },
    async handle(handlerInput) {
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        var [repo, user] = getSessionInfo(sessionAttributes);
        var response = await api.getLabels(user, repo);
        var speechText = `The available labels in this repository are <break time=".5s"/>`;
        speechText = helper.parseListOfNamesResponse(response, speechText);
        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
    }
};

const GetIssuesWithLabelHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'GetIssuesWithLabelIntent';
    },
    async handle(handlerInput) {
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        var [repo, user] = getSessionInfo(sessionAttributes);
        var label = handlerInput.requestEnvelope.request.intent.slots.label.value;
        label = helper.parseName(label);
        var response = await api.getIssuesWithLabel(user, repo, label);
        console.log(response);
        var speechText = helper.parseIssuesWithLabel(response, label);
        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
    }
};

const GetAssigneeIssuesHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'GetAssigneeIssuesIntent';
    },
    async handle(handlerInput) {
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        var [repo, user] = getSessionInfo(sessionAttributes);
        var assignee = handlerInput.requestEnvelope.request.intent.slots.user.value;
        assignee = helper.parseName(assignee);
        var response = await api.getAssigneeIssues(user, repo, assignee);
        console.log(response);
        var speechText = helper.parseAssigneeIssues(response, assignee);
        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
    }
};

const GetNumAssignedOpenIssuesHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'GetNumAssignedOpenIssuesIntent';
    },
    async handle(handlerInput) {
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        var [repo, user] = getSessionInfo(sessionAttributes);
        var assignee = handlerInput.requestEnvelope.request.intent.slots.user.value;
        assignee = helper.parseName(assignee);
        var response = await api.getAssigneeIssues(user, repo, assignee);
        console.log(response);
        var speechText = helper.parseIssuesWithLabel(response, assignee);
        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
    }
};

const GetIssueAssigneesHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'GetIssueAssigneesIntent';
    },
    async handle(handlerInput) {
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        var [repo, user] = getSessionInfo(sessionAttributes);
        var issueNum = handlerInput.requestEnvelope.request.intent.slots.number.value;
        var response = await api.getIssueAssignees(user, repo, issueNum);
        console.log(response);
        var names = helper.parseIssueAssignees(response, issueNum);
        for (var i = 0; i < names.length; i++) {
            var login = names[i];
            var currName = await api.getUser(login);    //parsing is done in handler due to async call for name
            if (currName.data.name !== null) {
                currName = currName.data.name;
                login = login.concat('<break time=".1s"/> or ' + currName);
            }
            names[i] = login;
        } 
        var speechText = helper.createIssueAssigneesSpeech(names, issueNum);
        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
    }
};

const GetMedianReviewTimeHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'GetMedianReviewTimeIntent';
    },
    async handle(handlerInput) {
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        var [repo, user] = getSessionInfo(sessionAttributes);
        var num = handlerInput.requestEnvelope.request.intent.slots.number.value;
        var time = handlerInput.requestEnvelope.request.intent.slots.time.value;
        var date = handlerInput.requestEnvelope.request.intent.slots.start.value;
        console.log(num);
        console.log(time);
        var pageNum = 1;
        var responses = [];
        var dateParsed = helper.calcDate(num, time, date);
        var result = await api.listPRs(user, repo, dateParsed, pageNum);
        var count = result.data.total_count;
        var speechText = result;
        if (count == 0) {
            speechText = `No pull requests have been closed since <say-as interpret-as="date">${dateParsed}</say-as>`;
        }
        while (count > 0) {
            count -= 100;
            responses.push(result);
            pageNum++;
            result = await api.listPRs(user, repo, dateParsed, pageNum); 
        }
        //console.log(result); 
        if (responses.length > 0) {
            speechText = helper.parsePRList(responses, dateParsed);
        }
        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
    }
};

const MergeBranchHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'MergeBranchIntent';
    },
    async handle(handlerInput) {
        var base = helper.parseName(handlerInput.requestEnvelope.request.intent.slots.base.value);
        var head = helper.parseName(handlerInput.requestEnvelope.request.intent.slots.head.value);
        var message = handlerInput.requestEnvelope.request.intent.slots.message.value;
        console.log(message);
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        var [repo, user] = getSessionInfo(sessionAttributes);
        base = helper.parseName(base);
        head = helper.parseName(head);
        var result = await api.listBranches(user, repo)
        console.log(result);
        base = helper.findBranch(result, base);
        head = helper.findBranch(result, head);
        console.log(base);
        console.log(head);
        result = await api.mergeBranch(user, repo, base, head, message);
        //default 404 error
        var speechText = `There was an error with this merge. Please check if 
                head branch ${head} and base branch ${base} exist`;
        console.log(result);
        if (result.status == 204) {
            speechText = `The base ${base} already contains the head ${head}. There is nothing to merge.`;
        }     
        else if (result.status == 201) {
            speechText = `Merge of head ${head} into base ${base} was successful`;
        }
        else if (result.response.status == 409) {
            speechText = `There are merge conflicts for merging head ${head} into base ${base}. Please
                resolve conflicts and try again`;
        }   
        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
    }
};

const MergePRHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'MergePRIntent';
    },
    async handle(handlerInput) {
        var num = handlerInput.requestEnvelope.request.intent.slots.number.value;
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        var [repo, user] = getSessionInfo(sessionAttributes);
        var message = handlerInput.requestEnvelope.request.intent.slots.message.value;
        console.log(message);
        console.log(num);
        var result = await api.getSha(user, repo, num);
        var sha = result.data.head.sha;
        result = await api.mergePR(user, repo, num, sha, message);
        //default 405 error message
        var speechText = `There was an error with this merge.`;
        if (result.status == 200) {
            var speechText = `Merge of pull request number ${num} was successful`;
        }
        else if (result.response.status == 405) {
            speechText = `Pull request number ${num} is not mergeable. Please
                resolve conflicts, make sure the p r exists, and then try again`;
        }  
        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
    }
};

const ListReposIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'ListReposIntent';
    },
    async handle(handlerInput) {
        var username = handlerInput.requestEnvelope.request.intent.slots.username.value;
        var speechText = `Here are the repositories for ${username} <break time=".5s"/>`;
        username = helper.parseName(username);
        var response = await api.getRepos(username);
        console.log(response);
        var speechText = helper.parseListOfNamesResponse(response, speechText);
        return handlerInput.responseBuilder
                .speak(speechText)   
            .reprompt(speechText) 
            .getResponse();
    }
};

const NoIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.NoIntent';
    },
    handle(handlerInput) {
        //Teardown session attributes
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        sessionAttributes['owners'] = [];
        sessionAttributes['currIntent'] = '';
        handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
        const speechText = 'What would you like to know today?';
        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
    }
};

const HelpIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speechText = 'Ask me about Github repositories!';
        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
    }
};

const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
                || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speechText = 'Goodbye!';
        return handlerInput.responseBuilder
            .speak(speechText)
            .getResponse();
    }
};


const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        //any cleanup logic goes here
        console.log('ended');
        return handlerInput.responseBuilder.getResponse();
    }
};


const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.log(handlerInput);
        console.log(`Error handled: ${error.message}`);
        return handlerInput.responseBuilder
            .speak('Sorry, I can\'t understand the command. Please say again.')
            .reprompt('Sorry, I can\'t understand the command. Please say again.')
            .getResponse();
    },
};

const skillBuilder = Alexa.SkillBuilders.custom()

    .addRequestHandlers(ListReposIntentHandler,
        GetPROwnersLoopHandler,
        NoIntentHandler,
        GetLabelsHandler,
        GetAssigneeIssuesHandler,
        GetIssuesWithLabelHandler,
        GiveOwnerNameHandler,
        GiveRepoNameHandler,
        GetIssueAssigneesHandler,
        GetMedianReviewTimeHandler,
        MergeBranchHandler,
        MergePRHandler,
        NumIssuesHandler,
        NumPrsHandler,
        GetPROwnersHandler,
        GetNumAssignedOpenIssuesHandler,
        LaunchRequestHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler)

    .addErrorHandlers(
        ErrorHandler,
    );

const skill = skillBuilder.create();

const adapter = new ExpressAdapter(skill, true, true);

restService.post("/", adapter.getRequestHandlers());

restService.listen(process.env.PORT || 3000, function () {
    console.log("Server up and listening!");
});

//export for tests
module.exports = restService;
module.exports = {
    GetPROwnersLoopHandler,
    ListReposIntentHandler,
    GetLabelsHandler,
    GetAssigneeIssuesHandler,
    GetIssuesWithLabelHandler,
    GiveOwnerNameHandler,
    GiveRepoNameHandler,
    GetIssueAssigneesHandler,
    GetMedianReviewTimeHandler,
    MergeBranchHandler,
    MergePRHandler,
    NumIssuesHandler,
    NumPrsHandler,
    GetPROwnersHandler,
    GetNumAssignedOpenIssuesHandler,
    LaunchRequestHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler
};