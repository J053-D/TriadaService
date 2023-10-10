const dotenv = require('dotenv');
dotenv.config();
module.exports = {
    ////////////////////////////////BUBBLE////////////////////////////////
    endpoint_bubble: process.env.API_URL_BUBBLE,
    apiKey_bubble: process.env.API_KEY_BUBBLE,

    ////////////////////////////////DISCORD////////////////////////////////    
    endpoint_discord: process.env.API_URL_DISCORD,
    authToken_discord: process.env.AUTHENTICATION_TOKEN,

    guildId: process.env.GUILD_ID,
    bannedRoleId: process.env.BANNED_ROLE_ID,
    adminRoleId: process.env.ADMIN_ROLE_ID,

    ////////////////////////////////STRIPE////////////////////////////////
    endpoint_stripe: process.env.API_URL_STRIPE,
    apiKey_stripe: process.env.API_KEY_STRIPE,
    product_subscription: process.env.PRODUCT_SUB_STRIPE,
    product_renovation: process.env.PRODUCT_RENOV_STRIPE,

    ////////////////////////////////SERVER CONFIG//////////////////////////////
    port: process.env.PORT,
    frequence: process.env.FREQUENCE,
    userTest: process.env.USER_TEST,


};