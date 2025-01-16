module.exports = {
    USER_SECRET:process.env.USER_SECRET,
    APP_SECRET:process.env.APP_SECRET,
    ACOOUNT_ACTIVATION_SECRET:process.env.ACOOUNT_ACTIVATION_SECRET,
    PASSWORD_RESET_SECRET:process.env.PASSWORD_RESET_SECRET,
    adminEmails:process.env.adminEmails,
    mailPass:process.env.pass,
    mailEmail:process.env.email,
    mailPort:process.env.port,
    mailHost:process.env.host,
    DOMAINS:(process.env.NODE_ENV==='production'?[process.env.CLIENT_PROD_URL,process.env.API_PROD_URI]:
    [process.env.CLIENT_DEV_URL,process.env.API_DEV_URI]),
    CLIENT_URL:process.env.NODE_ENV==='production'?process.env.CLIENT_PROD_URL:process.env.CLIENT_DEV_URL,
    API_URL:process.env.NODE_ENV==='production'?process.env.API_PROD_URI:process.env.API_DEV_URI,
    DB:process.env.NODE_ENV==='production'?process.env.remoteDB:process.env.localDB
}