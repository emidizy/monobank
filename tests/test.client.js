const server = require('../../nodejs-league-api/server');
const chai = require('chai');
chai.use(require('chai-http'));

const sessionAgent = chai.request.agent(server);

//Listen for server ready before initiating Mocha test
before((done)=>{
    server.on('appReady', done);
});

module.exports = {
    server: sessionAgent
};
