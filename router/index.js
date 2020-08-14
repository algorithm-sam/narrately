var express = require('express');
var router = express.Router();
const multer = require('multer');
const mkdirp = require('mkdirp');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = './public/images/uploads';
        mkdirp(dir, err => cb(err, dir))
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname)
    }
});

const upload = multer({ storage })

var authenticateUsers = require('../middlewares/authentication');
var adminOnly = require('../middlewares/admin');
var superAdminOnly = require('../middlewares/super-admin');

const index = require('../controllers/index.js');
const authentication = require('../controllers/authentication.js');
const user = require('../controllers/user.js');
const admin = require('../controllers/admin.js');
const conversion = require('../controllers/conversion.js');
const dashboard = require('../controllers/dashboard.js');


router.get('/', index.index);
router.get('/api/', index.index);

router.get('/api/about', index.about);

router.post('/api/login', authentication.login);
router.post('/api/register', authentication.register);
router.post('/api/oauth', authentication.oauth);
router.get('/api/auth/user', authenticateUsers, authentication.user);
router.get('/api/user/activate/:activationToken', authentication.activate);
router.post('/api/user/activation/resend', authentication.resendActivationToken);
router.post('/api/user/password/reset/', authentication.passwordReset);
router.post('/api/user/password/reset/:passwordResetToken', authentication.passwordResetHandle);

router.get('/api/conversions', authenticateUsers, adminOnly, conversion.index);
router.get('/api/conversions/:id', authenticateUsers, conversion.show);
router.delete('/api/conversions/:id', authenticateUsers, adminOnly, conversion.delete);
router.get('/api/conversions/year/:year', authenticateUsers, adminOnly, conversion.conversionsOfYear);

router.get('/api/users', authenticateUsers, adminOnly, user.index);
router.get('/api/users/:id', authenticateUsers, adminOnly, user.show);
router.delete('/api/users/:id', authenticateUsers, adminOnly, user.delete);
router.post('/api/users/:id', authenticateUsers, adminOnly, user.toggleBan);
router.get('/api/users/year/:year', authenticateUsers, adminOnly, user.usersOfYear);

router.put('/api/admin/add/:id', authenticateUsers, superAdminOnly, admin.add);
router.put('/api/admin/remove/:id', authenticateUsers, superAdminOnly, admin.remove);

router.post('/api/user/update', authenticateUsers, user.update);
router.post('/api/user/avatar', authenticateUsers, upload.single('image'), user.avatar);
router.post('/api/user/password/change', authenticateUsers, user.password);

router.get('/api/dashboard', dashboard.index);
router.get('/api/dashboard/stats', dashboard.stats);
router.post('/api/generate',  authenticateUsers, dashboard.generate);
router.get('/api/auth/user/quota',  authenticateUsers, dashboard.quota);

module.exports = router;
