/*
 * Tristan Hilbert
 * Actual JWT and bcrypt Stuffs
 * 
 * Logins/Signups/Verifications
 * 
 */

const fs = require("fs")
const jwt = require("jsonwebtoken");
const crypto = require("crypto")
const bcrypt = require("bcryptjs");

const { readUserByEmail } = require("../models/users");

/*
 *   --------------- CREATE / LOAD Certificate
 */
let certificate = "";

// Check for cert.txt file and create it
// if it does not exist
console.log("== Checking Certificate");
if(fs.existsSync(".cert.txt")){
    let f = fs.openSync(".cert.txt");
    let buf = Buffer.alloc(256);
    fs.readSync(f, buf, 0, 256, null);
    certificate = buf.toString('utf8');
}else{
    console.log("== Writing Certificate");
    let f = fs.openSync(".cert.txt", "w", 0o666);
    let buf = crypto.randomBytes(256);
    fs.writeSync(f, buf);
    certificate = buf.toString('utf8');
}
console.log("== Got Certificate -- DONE");


// -- Helpers
// Hess Lecture notes let's go!
async function hashPassword(pass){
    const res = await bcrypt.hash(pass, 10);
    return res;
}


async function isPassword(pass, hash){
    const res = await bcrypt.compare(pass, hash);
    return res;
}

// ------------- PUBLIC FUNCTIONS -------------- //

function idFromToken(token){
    try{
        if(token){
            let payload = jwt.verify(token, certificate);
            if(payload.user !== undefined){
                return payload.user;
            }
        }
    }catch(err){
        console.error(err);
        console.error("== May be hackers");
    }

    return null;
}

module.exports.idFromToken = idFromToken;


// Login Middleware

async function loginUser(req, res, next){
    try{
        if(req.body && req.body.email && req.body.password){
            const result = await readUserByEmail(req.body.email);
            if(result && result.password && isPassword(req.body.password, result.password)){
                res.status(200).send({
                    token: jwt.sign({user: result.id}, certificate, {expiresIn: '30m'}),
                });
            }else{
                res.status(401).send({
                    error: "The specified credentials were invalid."
                });
            }
        }else{
            res.status(400).send({
                error: "The request body was either not present or did not contain all of the required fields."
            });
        }
    }catch(err){
        next(err);
    }
}

module.exports.loginUser = loginUser;


async function hashUserPassword(req, res, next){
    if(req.body && req.body.password){
        req.body.password = await hashPassword(req.body.password);
    }
    next();
}

module.exports.hashUserPassword = hashUserPassword;