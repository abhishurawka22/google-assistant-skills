const listReposResponse = {
    data: [
        {name: 'srp-facade-lab',},
        {name: 'SustainRMVP',},
        {name: 'tddAsgn',}
    ]
};

const getNumIssuesResponse = {
    data: {
        total_count: 459,
    }
};

const getNumPRsResponse =  {
    data: {
        total_count: 100,
    }
}
//7 entries to test loop, duplicate names
const getPROwnersResponse = {
    data: [
        {
            user:  {login: 'bvaughn',}
        },
        {
            user: {login: 'gaearon',}
        },
        {
            user: {login: 'bvaughn',}
        },
        {
            user: {login: 'b',}
        },
        {
            user: {login: 'a',}
        },
        {
            user: {login: 'testname',}
        },
        {
            user: {login: 'c',}
        },
         
    ]
}

//6 entries to test loop
const getLabelsResponse = {
    data: [
        {name: 'bug',},
        {name: 'API',},
        {name: 'DOM',},
        {name: 'Component',},
        {name: 'Hooks',},
        {name: 'Flight',},
    ]
}
//6 entries to test loop
const getIssuesWithLabelResponse = {
    data: [
        { title: 'bug report', },
        { title: 'bug fixed', },
        { title: 'bug changed', },
        { title: 'Component added', },
        { title: 'bug fix', },
        { title: 'Flight added', },
    ]
}

const getAssigneeIssuesResponse = {
    data: [
        { title: 'bug report', },
        { title: 'API fixed', },
        { title: 'DOM added', },
        { title: 'Component added', },
        { title: 'Hooks changed', },
        { title: 'Flight added', },
    ]
}

const getIssueAssigneesResponse = {
    data: {
        assignees: [
            { name: 'srp-facade-lab', },
            { name: 'SustainRMVP', },
            { name: 'tddAsgn', }
        ]
    }
}

module.exports = {
    listReposResponse, 
    getNumIssuesResponse,
    getNumPRsResponse,
    getPROwnersResponse,
    getLabelsResponse,
    getIssuesWithLabelResponse,
    getAssigneeIssuesResponse,
    getIssueAssigneesResponse,
};