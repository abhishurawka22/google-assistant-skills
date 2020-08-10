const axios = require("axios");
const token = process.env.GITHUB_API_KEY;
require('axios-debug-log');
require("regenerator-runtime/runtime");
const api = require('../shared/Api.js');
const mocks = require('./mocks.js');
const API = 'https://api.github.com/';
jest.mock('axios');


afterEach(done => {
  jest.clearAllMocks();
  done();
});

describe('get repositories calls', () => {

  test('get repositories success', async () => {
    expect.assertions(2);
    var username = 'hebertca18';
    axios.get.mockResolvedValue(mocks.listReposResponse);
    const response = await api.getRepos(username);
    expect(axios.get).toHaveBeenCalledWith(
      `${API}users/${username}/repos`);
    expect(response).toEqual(mocks.listReposResponse);
  });

  test('get repositories error', async () => {
    expect.assertions(1);
    var username = 'hebertca18';
    var error = 'I cannot get the repositories for ' + username;
    axios.get.mockRejectedValue(error);
    await api.getRepos(username).catch(err =>
      expect(err).toEqual(error));
    expect(axios.get).toHaveBeenCalledWith(
      `${API}users/${username}/repos`);
  });
});

describe('get number of issues calls', () => {

  test('get number of issues success', async () => {
    expect.assertions(2);
    var owner = 'facebook';
    var repo = 'react';
    axios.get.mockResolvedValue(mocks.getNumIssuesResponse);
    const response = await api.getNumIssues(owner, repo);
    expect(axios.get).toHaveBeenCalledWith(
      `${API}search/issues?q=repo:${owner}/${repo}+type:issue+state:open&per_page=1`);
    expect(response).toEqual(mocks.getNumIssuesResponse);
  });

  test('get number of issues error', async () => {
    expect.assertions(1);
    var owner = 'facebook';
    var repo = 'react';
    var error = 'I cannot get the number of open issues for this repository';
    axios.get.mockRejectedValue(error);
    await api.getNumIssues(owner, repo).catch(err =>
      expect(err).toEqual(error));
    expect(axios.get).toHaveBeenCalledWith(
      `${API}search/issues?q=repo:${owner}/${repo}+type:issue+state:open&per_page=1`);
  });
});

describe('get number of PRs calls', () => {

  test('get number of PRs success', async () => {
    expect.assertions(2);
    var owner = 'facebook';
    var repo = 'react';
    axios.get.mockResolvedValue(mocks.getNumPRsResponse);
    const response = await api.getNumPRs(owner, repo);
    expect(axios.get).toHaveBeenCalledWith(
      `${API}search/issues?q=repo:${owner}/${repo}+type:pr+state:open&per_page=1`);
    expect(response).toEqual(mocks.getNumPRsResponse);
  });

  test('get number of PRs error', async () => {
    expect.assertions(1);
    var owner = 'facebook';
    var repo = 'react';
    var error = 'I cannot get the number of open pull requests for this repository';
    axios.get.mockRejectedValue(error);
    await api.getNumPRs(owner, repo).catch(err =>
      expect(err).toEqual(error));
    expect(axios.get).toHaveBeenCalledWith(
      `${API}search/issues?q=repo:${owner}/${repo}+type:issue+pr:open&per_page=1`);
  });
});

