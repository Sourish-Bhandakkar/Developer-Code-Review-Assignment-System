import express from 'express';
import { 
  createReviewRequest, 
  getAllReviews, 
  getReviewById, 
  getEligibleReviewersForReview, 
  autoAssignReview, 
  reassignReview, 
  updateReviewStatus,
  getSystemStats,
  getAssignmentHistory
} from '../controllers/reviewController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken, getAllReviews);
router.post('/', authenticateToken, createReviewRequest);
router.get('/stats', authenticateToken, getSystemStats);
router.get('/history', authenticateToken, getAssignmentHistory);
router.get('/:id', authenticateToken, getReviewById);
router.put('/:id/status', authenticateToken, updateReviewStatus);
router.get('/:id/eligible', authenticateToken, requireRole(['Admin']), getEligibleReviewersForReview);
router.post('/:id/assign', authenticateToken, requireRole(['Admin']), autoAssignReview);
router.post('/:id/reassign', authenticateToken, requireRole(['Admin']), reassignReview);

export default router;
