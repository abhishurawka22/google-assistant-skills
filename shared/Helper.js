'use strict';

const { response } = require("express");
const api = require('./Api.js');

exports.parseName = function (name) {
    name = name.replace(new RegExp("dash ", "g"), "-");
    name = name.replace(new RegExp("dot ", "g"), ".");
    name = name.replace(new RegExp("period ", "g"), ".");
    name = name.replace(new RegExp("colon ", "g"), ": ");
    name = name.replace(new RegExp("underscore ", "g"), "_");
    name = name.replace(new RegExp(" ", "g"), "");

    return name;
}

function getListOfNames(response, info) {
    var names = [];
    if (typeof response.data === "undefined") {
        return response;
    }
    var responseData = response.data;
    for (var i = 0; i < responseData.length; i++) {
        eval(info);
    }
    names = new Set(names);
    names = Array.from(names);
    console.log(names);
    return names;
}

function getAssignees() {
    var names = [];
    if (typeof response.data === "undefined") {
        return response;
    }
    var responseData = response.data;
    for (var i = 0; i < responseData.length; i++) {
        eval(info);
    }
    names = new Set(names);
    names = Array.from(names);
    console.log(names);
    return names;
}

exports.parseListOfNamesResponse = function (response, speechText) {
    var names = getListOfNames(response, 'names.push(responseData[i].name)');
    names = names.slice(0, 10);
    names = names.join(", ");
    return speechText.concat(names);
}

exports.parseNumIssuesResponse = function (response, repo) {
    if (typeof response.data === "undefined") {
        return response;
    }
    return `The number of open issues in ${repo} is ${response.data.total_count}`;
}

exports.parseNumPRsResponse = function (response, repo) {
    if (typeof response.data === "undefined") {
        return response;
    }
    return `The number of open pull requests in ${repo} is ${response.data.total_count}`;
}

exports.parsePROwners = function (names) {
    names = names.slice(0, 5);   //only 5 authors read at a time
    console.log(names);
    return names;
}

exports.createNamesList = function (response) {
    if (typeof response.data === "undefined") {
        return response;
    }
    var names = [];
    var responseData = response.data;
    for (var i = 0; i < responseData.length; i++) {
        names.push(responseData[i].user.login);
    }
    return names;
}

exports.parseIssuesWithLabel = function (response, label) {
    var names = getListOfNames(response, 'names.push(responseData[i].title)');
    var numIssues = names.length;   //Could also give number of issues with label
    names = names.slice(0,5);   //only 5 issues read for now
    names = names.join(", ");
    if (names.length == 0) {
        return 'There are no open issues with the label ' + label;
    }
    var speechText = `Here are the most recent issues with the label
        ${label} <break time=".4s"/>`
    return speechText.concat(names);
}

exports.parseAssigneeIssues = function (response, assignee) {
    var names = getListOfNames(response, 'names.push(responseData[i].title)');
    var numIssues = names.length;
    names = names.slice(0, 5);   //only 5 issues read for now
    names = names.join(", ");
    if (names.length == 0) {
        return 'There are no open issues assigned to ' + assignee;
    }
    var speechText = `Here are the
         most recent issues assigned to ${assignee} <break time=".5s"/>`
    return speechText.concat(names);
}

exports.parseIssueAssignees = function (response) {
    var names = [];
    if (typeof response.data === "undefined") {
        return response;
    }
    var names = [];
    var responseData = response.data.assignees;
    for (var i = 0; i < responseData.length; i++) {
        names.push(responseData[i].login);
    }
    return names;
}

exports.createIssueAssigneesSpeech = function (names, issueNum) {
    if (names.length == 0) {
        return `No one is assigned to issue ${issueNum}`;
    }
    else if (names.length == 1) {
        var speechText = `There is one person assigned to ${issueNum}. They are <break time=".3s"/>`
    }
    else {
        var speechText = `There are ${names.length} people assigned to ${issueNum}.
        They are <break time=".3s"/>`
    }
    names = names.join(", ");
    console.log(names);
    return speechText.concat(names);
}

exports.createPROwnersSpeech = function (namesSubset) {
    namesSubset = namesSubset.join(", ");
    var speechText = `Here are the most recent pull request authors <break time=".5s"/>`;
    speechText = speechText.concat(namesSubset);
    return speechText.concat(". Would you like me to continue?");
}

exports.parsePRList = function (responses, dateParsed) {
    var times = [];
    for (const response of responses) {
        if (typeof response.data === "undefined") {
            return response;
        }
        var responseData = response.data.items;
        for (var i = 0; i < responseData.length; i++) {
            var closed = new Date(responseData[i].closed_at);
            var created = new Date(responseData[i].created_at);
            //console.log(closed.getTime());
            //console.log(created.getTime());
            times.push((closed.getTime() - created.getTime()) / 8.64e+7);   //convert ms to days
            console.log(times[i]);
        }
        //console.log(times.length);
    }
    var speechText = `For pull requests closed since <say-as interpret-as="date">${dateParsed}</say-as>, the median pull request time was 
        ${times[Math.floor(times.length / 2)].toFixed(1)} days, or ${(times[Math.floor(times.length / 2)]*24).toFixed(2)} hours`;
    return speechText;
}

exports.findBranch = function (response, branch) {
    var branchNames = getListOfNames(response, 'names.push(responseData[i].name)')
    for (var i = 0; i < branchNames.length; i++) {
        var nameLower = branchNames[i].toLowerCase();
        if (nameLower.localeCompare(branch) == 0)  {
            return branchNames[i];
        }
    }
    console.log('no branch match found');
    return branch;
}

exports.calcDate = function(num, time, date) {
    var offset = 14;    //offset time unit in days, default two weeks
    var monthOffset = 0;
    if (typeof num !== "undefined" && typeof time !== "undefined") {
        if (time.localeCompare("weeks") == 0) {
            offset = num * 7;
        }
        else if (time.localeCompare("months") == 0) {
            monthOffset = num;
            offset = 0;
        }
        else {
            offset = num;
        }
    }
    else if (typeof date !== "undefined"){
        return date;
    }
    var d = new Date();
    d.setDate(d.getDate() - offset - 1);    //calculate start date
    console.log(d.getDate());
    var month = ('0' + (d.getUTCMonth() + 1 - monthOffset)).slice(-2);
    var day = ('0' + (d.getUTCDate())).slice(-2);
    var year = d.getUTCFullYear();
    var startDate = year + '-' + month + '-' + day;
    return startDate;
}

//module.exports = getListOfNames(response, info);



