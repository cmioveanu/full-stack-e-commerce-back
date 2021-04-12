const checkAuthentication = (req, res, next) => {
    if (req.isAuthenticated()) {
        next();
    } else {
        //res.redirect("/login");
        res.status(401).send("Please log in first.");
    }
}

module.exports = checkAuthentication;