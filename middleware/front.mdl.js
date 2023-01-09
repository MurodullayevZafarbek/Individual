const isAuth = async (req, res, next) => {
    if (req.session.auth) {
        next()
    } else {
        return res.render('./components/auth/404.ejs', { layout: "./layouts/auth.ejs", title: "404" })
    }
}
const roles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.session.role)) {
            return res.render('./components/auth/404.ejs', { layout: "./layouts/auth.ejs", title: "404" })
        }
        next();
    };
}


module.exports = { isAuth, roles }