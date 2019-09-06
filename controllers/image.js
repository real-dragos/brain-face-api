const Clarifai = require('clarifai');

const clarifaiApp = new Clarifai.App({
    apiKey: 'b15e7f6b24424655ba2c509cf8f8a7aa'
});

const handleImageEntry = (req, res, jwt, database) => {
    const { authorization } = req.headers;
    const { image } = req.body;
    const payload = jwt.decode(authorization.split(' ')[1]);
    id = Number(payload.userID);
    const userPromise = database.getUserById(id);
    userPromise.then((user) => {
        clarifaiApp.models.initModel({ id: Clarifai.FACE_DETECT_MODEL, version: "34ce21a40cc24b6b96ffee54aabff139" })
            .then((faceDetection) => {
                return faceDetection.predict(image);
            })
            .then(output => {
                database.incrementEntries(user)
                    .then(entries => {
                        return res.status(200).json({
                            entries: entries,
                            output: output
                        });
                    }).catch(() => {
                        return res.status(404).json('error loading data');
                    })
            })
            .catch((err) => {
                return res.status(400).json(err);
            })
    });
}

module.exports = {
    handleImageEntry: handleImageEntry
}