module.exports = (req, res, next) => {
    console.log(req.decoded)
    if (req.decoded.isSuperAdmin) {
        next();
    } else {
         return res.status(401).send({
            success: false,
            message: 'Super Administrative privileges needed.',
            status: 'failed'
        });
    }
};
