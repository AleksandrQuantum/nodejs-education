import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { userModel } from '../../user/models/user';
import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';

interface TokenPayload {
    id: string;
}

export async function login(req: Request, res: Response) {
    // VALIDATION SCHEMA
    const loginSchema = Joi.object({
        email: Joi.string().min(6).max(255).required(),
        password: Joi.string().min(6).max(255).required(),
    });
    try {
        const { err } = await loginSchema.validateAsync(req.body);
        if (err) {
            return res.status(400).send(err.details[0].message);
        }
    } catch (err) {
        return res.status(400).send((err as Error).message);
    }
    // CHECKING IF USER EMAIL
    const user = await userModel.findOne({ email: req.body.email });
    if (!user) {
        return res.status(400).send("Email does not exist!");
    }
    // CHECKING IF USER PASS MATCHES
    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword) {
        return res.status(400).send("Incorrect password");
    }
    // VALIDATION OF USER INPUTS
    try {
        const token = jwt.sign({_id: user._id}, process.env.TOKEN_SECRET as string);
        res.header("Auth-Token", token).send(token);
    } catch (err) {
        return res.status(500).send((err as Error).message);
    }
};

export function verify(req: Request, res: Response, next: NextFunction) {
    const token = req.header('Auth-Token');
    if (!token) {
        return res.status(401).send("Access Denied");
    }

    try {
        const user = jwt.verify(token, process.env.TOKEN_SECRET as string) as TokenPayload;
        req.body.userId = user.id;
        next();
    } catch (err) {
        return res.status(400).send("Invalid token");
    }
}