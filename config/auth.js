//External OAuth Configuration
//expose our config directly to our application using module.exports
module.exports = {
    facebookAuth: {
        clientID: "275609236154781", // your App ID
        clientSecret: "d21fe9bce211f0a9017276a9a5ec7e2f", // your App Secret
        callbackURL: "http://mgiep.unesco.org/auth/facebook/callback",
    },
    twitterAuth: {
        consumerKey: "PLWSxRv3cRFFxkW4xOpuRv66h",
        consumerSecret: "xOjqRYrzmyXSInhleAmVcQLOMILsHW8ejz1qNrUZJTyX7EaJZ7",
        callbackURL: "http://mgiep.unesco.org/auth/twitter/callback",
    },
    googleAuth: {
        clientID:
            "657304246782-pj2nspp4b4ieseognmdjs1s2h3hqchbe.apps.googleusercontent.com",
        clientSecret: "a_00B25W89Mge_npnXuiQOrv",
        callbackURL: "http://mgiep.unesco.org/auth/google/callback",
    },
};
