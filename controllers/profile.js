const getPublicData = (user) => {
    return {
        name: user.name,
        entries: user.entries,
        email: user.email
    }
}


const handleProfile = (req, res, jwt, database) => {
    const { authorization } = req.headers;
    const payload = jwt.decode(authorization.split(' ')[1]);

    id = Number(payload.userID);
    const userPromise = database.getUserById(id);
    userPromise.then(user => {
        if (user) {
            res.status(200).json(getPublicData(user));
        }
        else {
            res.status(404).json('Can\'t retrieve data');
        }
    })
}

module.exports = {
    handleProfile: handleProfile
}