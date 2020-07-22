const mongoose = require('mongoose')
const passportLocalMongoose = require("passport-local-mongoose")


const UserSchema = new mongoose.Schema({
    // need to create an id field for each one of our oauth providers
    googleId: {
        type: String
    },
    discordId: {
        type: String
    },
    displayName: {
        type: String
    },
})

// creating a clone of UserSchema, BEFORE I plugin the passportLocalMongoose addons
const OauthUserSchema = UserSchema.clone()

// plugin a username and password required fields, as well as some special functions provided by passportLocalMongoose
UserSchema.plugin(passportLocalMongoose)


// Creating a method on our OauthUserSchema that will try to find a OauthUser 
// bases on the provider that is given when the function is called
OauthUserSchema.statics.findOrCreate = function findOrCreate(profile, provider, cb){
    // need to create an empty userObj that is an instance of a new OauthSchema
    var userObj = new this();
    // [provider] is not an array, this is how we insert a variable as a key in an object
    // eg is provider is 'googleId' then the object will be => {googleId: profile.id}
    this.findOne({ [provider] : profile.id},function(err,result){ 
        // if no user exists
        if(!result){
            // we set the provider and the id
            // eg if provider is 'discordId' then the userObj = {discordId: profile.id}
            userObj[provider] = profile.id
            // set the display name so we can render something on the front end
            userObj.displayName = profile.displayName
            // save the userObj in the database as an instance of a new OauthUserSchema
            userObj.save(cb);
        }else{
            // if we find a user, we call the callback, pass an error(which should be null) and the result of this.findOne
            cb(err,result);
        }
    });
};

// UserSchema plugin adding {
    // username: {
        // type: String,
        // required: true,
        // unique: true
    // },
    // password: {
        // type: String,
        // required: true
    // }
// }

module.exports = {
    User: mongoose.model('users', UserSchema),
    OauthUser: mongoose.model('OauthUsers', OauthUserSchema)
}