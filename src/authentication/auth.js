/*
 * Entrypoint to Authentication Block
 * 5/24/2020
 * 
 */

const express = require("express");
const router = express.Router();

const auth_config_json = null;
/*
 * Let's create a JSON file that stores
 * all the paths that need privaledges
 * and all the ones that do not.
 * 
 * Each one that has privaleges needs to
 * express where the id is that it can compare
 * against the token. This can be done with three fields
 * 
 * PARAM : true|false should match param id
 * if PARAM == false then make SQL query with
 * ENTITY : entity type that id refers to (see ERD)
 * FIELD : fieldname for entity type
 * 
 */

// No authentication needed -- public
const whitelist = [] //auth_config_json.whitelist

// authentication needed -- private
const blacklist = [] //auth_config_json.blacklist

for(let i = 0; i < whitelist.length; i ++){
    // router.all might need to be replaced
    router.all(whitelist[i], (req, res, next) => {
        req.is_authenticated = true;
        next();
    });
}

async function check_for_ownership(req, res, next){
    // if req.is_authenticated === undefined or false:
        // dehash token
        // check if owner
        // if req has ownership req.is_authenticated = true
        // else req.is_authenticated = false
    next();
}

async function check_for_admin(req, res, next){
    // if req.is_authenticated === undefined or false
        // dehash token
        // check if admin
        // if req has admin priv req.is_authenticated = true
        // else req.is_authenticated = false
}

async function require_privaledge(req, res, next){
    // Is this secure?
    // Can the request object be changed within Express within HTTP request?
    if(req.is_authenticated !== undefined && req.is_authenticated === true){
        next()
    }else{
        res.status(401).send({
            error: "Authentication Failed Or Was Not Provided!"
        });
    }
}

for(let i = 0; i < blacklist.length; i ++){
    // router.all might need to be replaced
    router.all(blacklist[i], check_for_ownership, check_for_admin, require_privaledge);
}