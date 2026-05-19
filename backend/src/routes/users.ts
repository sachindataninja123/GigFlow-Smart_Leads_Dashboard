import { Router } from 'express';
import { User } from '../models/User';
import { authenticate, authorize } from '../middlewares/auth';
import { sendSuccess, sendError } from '../utils/response';

const router = Router();

router.use(authenticate);

// Admin: list all users
router.get('/', authorize('admin'), async (_req, res, next) => {
  try {
    const users = await User.find().select('-password').lean();
    sendSuccess(res, 'Users fetched successfully.', users);
  } catch (error) {
    next(error);
  }
});

// Admin: delete user
router.delete('/:id', authorize('admin'), async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      sendError(res, 'User not found.', 404);
      return;
    }
    sendSuccess(res, 'User deleted successfully.');
  } catch (error) {
    next(error);
  }
});

export default router;
