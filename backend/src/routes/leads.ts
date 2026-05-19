import { Router } from 'express';
import { body, param, query } from 'express-validator';
import {
  createLead,
  getLeads,
  getLeadById,
  updateLead,
  deleteLead,
  exportLeadsCSV,
  getLeadStats,
} from '../controllers/leadController';
import { authenticate, authorize } from '../middlewares/auth';
import { validate } from '../middlewares/validate';

const router = Router();

// All routes require auth
router.use(authenticate);

const leadValidators = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ min: 2, max: 100 }),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('status')
    .optional()
    .isIn(['New', 'Contacted', 'Qualified', 'Lost'])
    .withMessage('Invalid status'),
  body('source')
    .isIn(['Website', 'Instagram', 'Referral'])
    .withMessage('Source must be Website, Instagram, or Referral'),
  body('notes').optional().isLength({ max: 1000 }).withMessage('Notes cannot exceed 1000 characters'),
];

const updateValidators = [
  body('name').optional().trim().notEmpty().isLength({ min: 2, max: 100 }),
  body('email').optional().isEmail().normalizeEmail(),
  body('status').optional().isIn(['New', 'Contacted', 'Qualified', 'Lost']),
  body('source').optional().isIn(['Website', 'Instagram', 'Referral']),
  body('notes').optional().isLength({ max: 1000 }),
];

const queryValidators = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('status').optional().isIn(['New', 'Contacted', 'Qualified', 'Lost']),
  query('source').optional().isIn(['Website', 'Instagram', 'Referral']),
  query('sort').optional().isIn(['latest', 'oldest']),
];

router.get('/stats', getLeadStats);
router.get('/export/csv', exportLeadsCSV);
router.get('/', queryValidators, validate, getLeads);
router.post('/', leadValidators, validate, createLead);

router.get(
  '/:id',
  [param('id').isMongoId().withMessage('Invalid lead ID')],
  validate,
  getLeadById
);

router.put(
  '/:id',
  [param('id').isMongoId().withMessage('Invalid lead ID'), ...updateValidators],
  validate,
  updateLead
);

router.delete(
  '/:id',
  [param('id').isMongoId().withMessage('Invalid lead ID')],
  validate,
  authorize('admin', 'sales'),
  deleteLead
);

export default router;
