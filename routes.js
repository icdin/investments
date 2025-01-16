const express = require('express')
const userRoute = express.Router()
const {register, login, getUser,getUsers,editUser,getAdmin,getAdmins,editAdmin, createAccount,
     accountActivation, deleteAccount, passwordReset, checkUserName, checkEmail, newPassword, myCommissions,
     createBankAccount, updateProfilePicture, lastVisited, getReferrers} = require('./controllers/userController')
const {userAuth} = require('./middleware/userAuth')
const appAdmin = require('./middleware/appAdmin')
const { addAboutApp, editAboutApp } = require('./controllers/aboutAppController')
const { newContact, contacts, contactResponse } = require('./controllers/contactController')
const { newFeedback, feedbackFixing, feedbacks } = require('./controllers/feedbackController')
const { getSupports, newSupport, supportComment, updateSupport } = require('./controllers/supportController')
const { makePayment, withdraw, payments, save, confirmWithdrawal, salaryWithdrawal,confirmPersonalTopUp, confirmGrooveTopUp, salaryApproval, makeManualPayment, reConfirmManualPayment, withdrawals,personalManaulWithdrawal, confirmPersonalManualWithdrawal, removePayment } = require('./controllers/paymentController')
const { createAppSetting, deleteAppUsers, getAppSetting, newsletterSubscription, newNewsletterToSubscribers, updateApp, joinStaffs, createCashier, cashierApplication } = require('./controllers/AppController')
 const { investors, createGroove, grooves, myGrooves, joinGroove, deleteGroove, 
     penaliseUser, pardonUser, upgradegrooveOrbit,updateGrooveProfilePicture,confirmCreateGroove, confirmGrooveUpgrade, confirmJoinGroove } = require('./controllers/investmentAccountController')

//Investment Account 
userRoute.post('/create-groove',userAuth,createGroove)
userRoute.put('/join-groove/:grooveId',userAuth,joinGroove)
userRoute.post('/upgrade-orbit',userAuth,upgradegrooveOrbit)
userRoute.get('/grooves',grooves)
userRoute.get('/my-grooves',userAuth,myGrooves)
userRoute.delete('/delete-groove/:grooveId',userAuth,deleteGroove)
userRoute.put('/penalize-user/:userId',userAuth,penaliseUser);
userRoute.put('/pardon-user/:userId',userAuth,pardonUser);
userRoute.get('/investors',investors);
userRoute.post('/update-groove-profile-picture',userAuth,updateGrooveProfilePicture);
userRoute.post('/join-staffs',userAuth,joinStaffs);

//payments
userRoute.post('/make-payment',userAuth,makePayment);
userRoute.get('/payments',userAuth,payments);
userRoute.post('/confirm-personal-top-up',userAuth,confirmPersonalTopUp)
userRoute.post('/confirm-groove-top-up',userAuth,confirmGrooveTopUp)
userRoute.post('/confirm-create-groove/:grooveId',userAuth,confirmCreateGroove)
userRoute.post('/confirm-join-groove',userAuth,confirmJoinGroove)
userRoute.post('/confirm-upgrade-orbit',userAuth,confirmGrooveUpgrade)
userRoute.post('/save',userAuth,save);
userRoute.delete('/:id/remove-payment',userAuth,removePayment);

//withdrawals
userRoute.post('/withdraw',userAuth,withdraw);
userRoute.post('/confirm-withdraw',userAuth,confirmWithdrawal);
userRoute.post('/salary-withdrawal',userAuth,salaryWithdrawal);
userRoute.post('/salary-approval',userAuth,salaryApproval);
userRoute.post('/make-manual-payment',userAuth,makeManualPayment);

//Manual Withdrawals
userRoute.post('/:id/re-confirm-manual',userAuth,reConfirmManualPayment);
userRoute.get('/withdrawals',userAuth,withdrawals);
userRoute.post('/personal-manual-withdrawal',userAuth,personalManaulWithdrawal);
userRoute.post('/confirm-personal-manual-withdrawal',userAuth,confirmPersonalManualWithdrawal);

//USER ROUTES
userRoute.post('/check-username',checkUserName)
userRoute.post('/update-profile-picture',userAuth,updateProfilePicture)
userRoute.post('/check-email',checkEmail)
userRoute.post('/register',register)
userRoute.post('/login',login)
userRoute.get('/profile',userAuth,getUser)
userRoute.put('/create-bank-account',userAuth, createBankAccount)
userRoute.get('/users',getUsers)
userRoute.put('/update-user-detail',userAuth, editUser)
userRoute.put('/account-activation', accountActivation)
userRoute.post('/create-account', createAccount)
userRoute.post('/password-reset', passwordReset)
userRoute.put('/create-new-password', newPassword)
userRoute.put('/last-visited',userAuth,lastVisited)

//Referrers
userRoute.get('/referrers',userAuth, getReferrers)
//Contacts
userRoute.post('/new-contact',newContact)
userRoute.put('/:contactId/reply-contact',appAdmin,contactResponse)
userRoute.get('/contacts',appAdmin,contacts)

//Feedback
userRoute.post('/new-feedback', newFeedback)
userRoute.put('/:feedbackId/fix-feedback',appAdmin,feedbackFixing)
userRoute.get('/feedbacks',appAdmin,feedbacks)

//Support
userRoute.get('/supports',getSupports)
userRoute.post('/new-support',userAuth,newSupport)
userRoute.put('/comment-support/:supportId',supportComment)
userRoute.put('/update-support/:supportId',userAuth,updateSupport)

//App Admin
userRoute.get('/admin/profile',appAdmin,getUser)
userRoute.get('/admins', appAdmin,getAdmins)
userRoute.get('/admin', appAdmin,getAdmin)
userRoute.patch('/:adminId/edit-profile',appAdmin,editAdmin)
userRoute.post('/add-about-app',(appAdmin),addAboutApp)
userRoute.put('/edit-about-app',(appAdmin),editAboutApp)

//App
userRoute.post('/create-app-setting',userAuth,createAppSetting)
userRoute.delete('/delete-app-users',userAuth,deleteAppUsers)
userRoute.get('/app-setting',getAppSetting)
userRoute.post('/update-app',userAuth,updateApp)
userRoute.put('/delete-account', userAuth, deleteAccount)
userRoute.post('/newsletter-subsrciption',newsletterSubscription)
userRoute.post('/newsletter',userAuth,newNewsletterToSubscribers)
userRoute.post('/cashier-application',userAuth,cashierApplication)
userRoute.post('/create-cashier',userAuth,createCashier)

module.exports = userRoute