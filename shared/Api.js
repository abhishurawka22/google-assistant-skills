'use strict';

require('dotenv').config();
const axios = require("axios");
require('axios-debug-log');
const token = process.env.GITHUB_API_KEY;
axios.defaults.headers.common['Authorization'] = `token ${token}`;
axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';

const API = 'https://api.github.com/';

exports.getRepos = async (username) => {
    try {
        return await axios.get(`${API}users/${username}/repos`);
    } catch (error) {
        console.error("ERROR OCCURED: " + error);
        return 'I cannot get the repositories for ' + username;
    }
}

exports.getNumIssues = async (owner, repo) => {
    try {
        return await axios.get(`${API}search/issues?q=repo:${owner}/${repo}+type:issue+state:open&per_page=1`);
    } catch (error) {
        console.error("ERROR OCCURED: " + error);
        return 'I cannot get the number of open issues for this repository';
    }
}

exports.getNumPRs = async (owner, repo) => {
    try {
        return await axios.get(`${API}search/issues?q=repo:${owner}/${repo}+type:pr+state:open&per_page=1`);
    } catch (error) {
        console.error("ERROR OCCURED: " + error);
        return 'I cannot get the number of open pull requests for this repository';
    }
}

exports.getPROwners = async (owner, repo) => {
    try {
        return await axios.get(`${API}repos/${owner}/${repo}/pulls?state=open`);
    } catch (error) {
        console.error("ERROR OCCURED: " + error);
        return 'I cannot get the pull request owners for this repository';
    }
}

exports.getLabels = async (owner, repo) => {
    try {
        return await axios.get(`${API}repos/${owner}/${repo}/labels`);
    } catch (error) {
        console.error("ERROR OCCURED: " + error);
        return 'I cannot get the labels for this repository';     
    }
}

exports.getIssuesWithLabel = async (owner, repo, label) => {
    try {
        return await axios.get(`${API}repos/${owner}/${repo}/issues?labels=${encodeURIComponent(label)}`);
    } catch (error) {
        console.error("ERROR OCCURED: " + error);
        return 'I cannot get open issues with the label ' + label; 
    }
}

exports.getAssigneeIssues = async (owner, repo, assignee) => {
    try {
        return await axios.get(`${API}repos/${owner}/${repo}/issues?assignee=${assignee}`);
    } catch (error) {
        console.error("ERROR OCCURED: " + error);
        return `I cannot get issues assigned to ${assignee}`;
    }
}

exports.getIssueAssignees = async (owner, repo, issue_num) => {
    try {
        return await axios.get(`${API}repos/${owner}/${repo}/issues/${issue_num}`);
    } catch (error) {
        console.error("ERROR OCCURED: " + error);
        return 'I cannot get the assignees of the issue number ' + issue_num;
    }
}

exports.getSha = async (owner, repo, pullNum) => {
    try {
        return await axios.get(`${API}repos/${owner}/${repo}/pulls/${pullNum}`);
    } catch (error) {
        console.error("ERROR OCCURED: " + error);
        return 'I cannot get the sha of p. r. number ' + pullNum;
    }
}

exports.mergePR = async (owner, repo, pullNum, sha, message) => {
    try {
        if (typeof message === undefined) {
            return await axios.put(`${API}repos/${owner}/${repo}/pulls/${pullNum}/merge`,
                {
                    sha: sha,
                },
            );
        }
        return await axios.put(`${API}repos/${owner}/${repo}/pulls/${pullNum}/merge`,
        {   sha: sha, 
            commit_message: message,
        },
        );
    } catch (error) {
        console.error("ERROR OCCURED: " + error);
        return error;
    }
}

exports.mergeBranch = async (owner, repo, base, head, message) => {
    try {
        if (typeof message === undefined) {
            return await axios.post(`${API}repos/${owner}/${repo}/merges`,
                {
                    base: base,
                    head: head,
                },
            );
        }
        return await axios.post(`${API}repos/${owner}/${repo}/merges`,
            {   base: base, 
                head: head, 
                commit_message: message,
            },
            );
    } catch (error) {
        console.error("ERROR OCCURED: " + error);
        return error;
    }
}

exports.listPRs = async (owner, repo, date, pageNum) => {
    try {
        return await axios.get(`${API}search/issues?q=repo:${owner}/${repo}+type:pr+state:closed+closed:>=${date}&page=${pageNum}&per_page=100`);
    } catch (error) {
        console.error("ERROR OCCURED: " + error);
        return 'I cannot get the pull requests for this repository';
    }
}

exports.getUser = async (user) => {
    try {
        return await axios.get(`${API}users/${user}`);
    } catch (error) {
        console.error("ERROR OCCURED: " + error);
    }
}

exports.listBranches = async (owner, repo) => {
    try {
        return await axios.get(`${API}repos/${owner}/${repo}/branches`);
    } catch (error) {
        console.error("ERROR OCCURED: " + error);
        return null;
    }
}



