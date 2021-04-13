const shortid = require('shortid');
const config = require('../config');

exports.generateUrl = (teams)=>{
    let url = `${config.BaseFixtureUrl}/search-url/${teams}/${shortid.generate()}${Date.now()}`;
    return url;
}