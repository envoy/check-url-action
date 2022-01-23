const core = require('@actions/core');
const axios = require('axios');

const main = async() => {
    try {
        const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

        const url = core.getInput('url', {required: true});
        const initDelayStr = core.getInput('init-delay', {required: false});
        const retryCountStr = core.getInput('retry-count', {required: false});
        const retryDelayStr = core.getInput('retry-delay', {required: false});
        const codesAllowed = core.getInput('codes-allowed', {required: false});

        let initDelay = initDelayStr ? parseInt(initDelayStr) : 0;
        let retryCount = retryCountStr ? parseInt(retryCountStr) : 0;
        let retryDelay = retryDelayStr ? parseInt(retryDelayStr) : 0;
        const codesAllowedArr = codesAllowed ? codesAllowed.split(',').map(Number) : [200];

        initDelay = initDelay > 30000 ? 30000 : initDelay;
        retryCount = retryCount > 5 ? 5 : retryCount;
        retryDelay = retryDelay > 30000 ? 30000 : retryDelay;

        await sleep(initDelay);
        let success = false;

        do {
            axios.get(url).then(response => {
                console.log(`Response code of url - ${url} : ${response.status}`);
                success = codesAllowedArr.includes(response.status);
            }).catch(function (error) {
                console.log(`error accessing url: ${url} - error: ${error}`);
                success = false;
            });

            await sleep(retryDelay); 
        } while(retryCount-- > 0);

        !success && core.setFailed('Failed to access url');
    } catch (error) {
        core.setFailed(error.message);
    }
}

main();
