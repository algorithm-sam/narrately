module.exports = (req, res, next) => {
    console.log(req.decoded)
    if (req.decoded.isAdmin) {
        next();
    } else {
         return res.status(401).send({
            success: false,
            message: 'Administrative privileges needed.',
            status: 'failed'
        });
    }
};
