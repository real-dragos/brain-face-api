const secret = 'dG8gYmUgb3Igbm90IHRvIGJl';

const createToken = (id, jwt) => {
    const expirationDate = Math.floor(Date.now() / 1000) + 120; //120 seconds in the future (for testing)
    const token = jwt.sign({ userID: id, exp: expirationDate }, secret);
    return token;
}

const handleRegister = (req, res, db, bcrypt, jwt) => {
    const { name, email, password } = req.body;
    if(!email || !name || !password){
        return res.status(400).json('incorrect form submission');
    }
    bcrypt.hash(password, null, null, function (err, hashPass) {
        db.transaction(trx => {
            trx.insert({
                email: email,
                hash: hashPass
            })
                .into('login')
                .returning('email')
                .then(emails => {
                    const email = emails[0];
                    return trx.insert({
                        name: name,
                        email: email,
                        joined: new Date()
                    })
                        .into('users')
                        .returning('id')
                        .then((ids) => {
                            const id = ids[0];
                            res.status(200).json({
                                token: createToken(id, jwt)
                            });
                        })

                })
                .then(trx.commit)
                .catch(trx.rollback)
        })
            .catch(() => {
                res.status(400).json('unable to register');
            })
    });
}

const handleLogin = (req, res, db, bcrypt, jwt) => {
    const { email, password } = req.body;
    if(!email || !password){
        return res.status(400).json('incorrect form submission');
    }
    db.select('*')
        .from('login')
        .where({
            email: email
        })
        .then(logins => {
            const login = logins[0];
            if (bcrypt.compareSync(password, login.hash)) {
                db.select('*')
                    .from('users')
                    .where({ email: login.email })
                    .then((users) => {
                        const user = users[0];
                        res.status(200).json({
                            token: createToken(user.id, jwt)
                        });
                    })
            }
            else {
                throw err('wrong password');
            }
        })
        .catch(() => {
            res.status(400).json('wrong credentials')
        });

};

module.exports = {
    handleRegister: handleRegister,
    handleLogin: handleLogin,
    secret: secret
}