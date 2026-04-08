const User=require("../models/user.js");

module.exports.renderSignUpForm=(req,res)=>{
    res.render("users/signup.ejs");
};

module.exports.createUser=async(req,res,next)=>{
    try{
        let{username,email,password}=req.body;
        let newUser=new User({email,username});
        let registeredUser=await User.register(newUser,password);
        req.login(registeredUser,(err)=>{
            if(err) return next(err);
            req.flash("success","Welcome to Wanderstay!");
            res.redirect("/listings");
        });
    }catch(e){
        req.flash("error", e.message || "A user with that name already exists.");
        res.redirect("/signup");
    }
};

module.exports.renderLogInForm=(req,res)=>{
    res.render("users/login.ejs");
};

module.exports.logIn = async (req, res) => {
    req.flash("success", "Welcome back!");
    if (req.user.role === "admin") {
        return res.redirect("/admin");
    }
    let redirectUrl = res.locals.redirectUrl || "/listings";
    // don't redirect to POST-only routes like wishlist toggle
    if (redirectUrl.includes("/toggle") || redirectUrl.includes("/bookings/") ) {
        redirectUrl = "/listings";
    }
    res.redirect(redirectUrl);
};



module.exports.logout=(req,res,next)=>{
    req.logout((err)=>{
        if(err) return next(err);
        req.flash("success","You are logged out");
        res.redirect("/listings");
    });
};