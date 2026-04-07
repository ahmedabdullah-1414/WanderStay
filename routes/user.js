const express=require("express");
const router=express.Router();
const wrapAsync=require('../utils/wrapasync.js');
const passport=require("passport")
const {saveUrlInfo}=require("../middleware.js");

const userController=require("../controllers/users.js");


router.route("/signup")
    .get(userController.renderSignUpForm)
    .post(wrapAsync(userController.createUser))

router.route("/login")
    .get(userController.renderLogInForm)
    .post(saveUrlInfo,passport.authenticate('local', { failureRedirect: '/login',failureFlash:true}),
    userController.logIn)

router.get("/logout",userController.logout);

module.exports=router;

// app.get("/demoUser",async(req,res)=>{
//     let fakeUser=new User({
//         email:"sigma-05@gmail.com",
//         username:"sigma-05",
//     });
//     let registeredUser=await User.register(fakeUser,"helloworld");
//     console.log(registeredUser);
//     res.send(registeredUser);

// });