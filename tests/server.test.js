const expect = require('chai').expect
const assert = require("chai").assert;
const testAgent = require('./test.client').server;


describe('SERVER TEST', ()=>{

    it('API Home', (done)=>{
        testAgent.get('/api')
            .then((res)=>{
                //expect(res).to.have.cookie('sessionid');
                // The `agent` now has the sessionid cookie saved, and will send it
                // back to the server in the next request:
                expect(res.statusCode).to.equal(200);
                expect(JSON.stringify(res.body)).to.equal(JSON.stringify({
                    'status': 'Api is LIVE',
                    'message': 'Welcome to Premier League API hub. Developed by Diala Emmanuel'
                }));
                done();
            }).catch(err=> done(err));
    })

})