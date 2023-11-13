import chai, { expect } from 'chai';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import chaiHttp from 'chai-http';
import { app } from '../src';
import { userModel, User } from '../src/user/models/user';

// Configure Chai
chai.use(chaiHttp);
chai.should();

// Create user
async function userCreate(): Promise<{ Bob: User; token: string; }> {
    const hash = bcrypt.hashSync('testpassword', 10);
    const Bob = new userModel({
        _id: new mongoose.Types.ObjectId().toHexString(),
        fname: 'Bob',
        lname: 'Robinson',
        email: 'bobRobinson@gmail.com',
        password: hash
    });
    await Bob.save();
    const token = jwt.sign({_id: Bob._id}, process.env.TOKEN_SECRET as string);
    return new Promise(function(resolve, reject) {
        resolve({ Bob, token });
    });
}

// Delete user
async function userDelete(userId: string) {
    await userModel.findByIdAndDelete(userId);
}

function sendRequestUserCreate(data: { [key:string]: string }) {
    return chai.request(app)
            .post('/users/create')
            .send(data)
}

function sendRequestUserGet(userId: string, token: string) {
    return chai.request(app)
            .get(`/users/get/${userId}`)
            .set('Auth-Token', token)
}

describe('User /users', () => {
    describe('User /get/:userId', () => {
        it('without token, should get 401 status', async () => {
            const { Bob } = await userCreate();

            const res = await sendRequestUserGet(Bob.id, '');
            res.should.have.status(401);
            res.text.should.be.to.string('Access Denied');
            await userDelete(Bob.id);
        });

        it('invalid userId, should get 400 status', async() => {
            const { Bob, token } = await userCreate();

            const res = await sendRequestUserGet("1", token);
            res.should.have.status(400);
            res.text.should.be.to.string("Invalid userId");
            await userDelete(Bob.id);
        });

        it('valid, should get 200 status', async () => {
            const { Bob, token } = await userCreate();

            const res = await sendRequestUserGet(Bob.id, token);
            res.should.have.status(200);
            res.body.fname.should.be.to.string(Bob.fname);
            res.body.lname.should.be.to.string(Bob.lname);
            res.body.email.should.be.to.string(Bob.email);
            res.body.password.should.be.to.string(Bob.password);
            await userDelete(Bob.id);
        });

        it('valid but another userId, should get 404 status', async () => {
            const { Bob, token } = await userCreate();

            const res = await sendRequestUserGet(new mongoose.Types.ObjectId().toHexString(), token);
            res.should.have.status(404);
            res.text.should.be.to.string('User not found');
            await userDelete(Bob.id);
        });
    });

    describe('User /create', () => {
        it('create user, should get 200 status', async() => {
            const data = {
                "lname": "Robinson",
                "fname": "Bob",
                "email": "test@gmail.com",
                "password": "testPASS",
                "role": "CUSTOMER",
                "customerId":  new mongoose.Types.ObjectId().toHexString(),
            }

            const res = await sendRequestUserCreate(data);
            res.should.have.status(200);
            res.text.should.be.to.string('User created successfully');
            // Find user in the database and validate its data
            const user = await userModel.findOne({ email: data['email'] });
            expect(user).to.not.be.null;
            const compared = await bcrypt.compare(data['password'], (user as User).password);
            (user as User).fname.should.equal(data['fname']);
            (user as User).lname.should.equal(data['lname']);
            (user as User).email.should.equal(data['email']);
            (user as User).role.should.equal(data['role']);
            expect((user as User).customerId.toString()).to.equal(data['customerId']);
            expect((user as User).supplierId).to.be.undefined;
            compared.should.equal(true);
            await userDelete((user as User).id);
        });

        it('user already exists, should get 400 status', async() => {
            const { Bob } = await userCreate();
            const data = {
                "lname": "Robinson",
                "fname": "Bob",
                "email": "bobRobinson@gmail.com",
                "password": "testPASS",
                "role": "CUSTOMER",
                "customerId":  new mongoose.Types.ObjectId().toHexString(),
            }

            const res = await sendRequestUserCreate(data);
            res.should.have.status(400);
            res.text.should.be.to.string('Email already exists');
            await userDelete(Bob.id);
        });

        it('without required field, should get 500 status', async () => {
            const data = {
                "lname": "Robinson",
                //"fname": "Bob",
                "email": "test@gmail.com",
                "password": "testPASS",
                "role": "CUSTOMER",
                "customerId":  new mongoose.Types.ObjectId().toHexString(),
            }

            const res = await sendRequestUserCreate(data);
            res.should.have.status(500);
        });
    });
});

export { userCreate, userDelete };