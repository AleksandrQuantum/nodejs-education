const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../src');
const userTest = require('../tests/user.test');

// Configure Chai
chai.use(chaiHttp);
chai.should();

function sendRequest(data) {
    return chai.request(app)
            .get('/login')
            .send(data)
}

describe('Auth /login', () => {
    it('get a auth token, should get 200 status', async () => {
        const [Bob, token] = await userTest.userCreate();
        const data = {
            email: Bob.email,
            password: 'testpassword'
        }

        const res = await sendRequest(data);
        res.should.have.status(200);
        res.headers.auth-token.should.be.to.string(token);
        await userTest.userDelete(Bob.id);
    });

    it('invalid email, should get 400 status', async () => {
        const data = {
            email: 'some invalid email',
            password: 'testpassword'
        }

        const res = await sendRequest(data);
        res.should.have.status(400);
        res.text.should.be.to.string('Email does not exist!');
    });

    it('without email, should get 400 status', async () => {
        const data = { password: 'some valid pass' }

        const res = await sendRequest(data);
        res.should.have.status(400);
        res.text.should.be.to.string('"email" is required');
    });

    it('without pass, should get 400 status', async () => {
        const [Bob] = await userTest.userCreate()
        const data = { email: Bob.email }

        const res = await sendRequest(data);
        res.should.have.status(400);
        res.text.should.be.to.string('"password" is required');
        await userTest.userDelete(Bob.id);
    });

    it('invalid password, should get 400 status', async () => {
        const [Bob] = await userTest.userCreate()
        const data = {
            email: Bob.email,
            password: 'some invalid pass'
        }

        const res = await sendRequest(data);
        res.should.have.status(400);
        res.text.should.include('Incorrect password');
        await userTest.userDelete(Bob.id);
    });
});