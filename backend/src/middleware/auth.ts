import { Strategy, ExtractJwt } from "passport-jwt";
import User from "../helpers/user";
import config from "../config";

const options = { 
    jwtFromRequest:  ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: config.secretKey
}

export default new Strategy(options, (user, done) => {
    User.read({id: user.id})
    .then(user => {
        done(null, user ? user : false);
    }).catch(err => done(err, false))
})  