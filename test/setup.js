const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const proxyquire = require('proxyquire');

chai.use(sinonChai);

global.expect = chai.expect;
global.sinon = sinon;
global.proxyquire = proxyquire;

exports.mochaHooks = {
    afterEach() {
        sinon.restore();
    },
};
