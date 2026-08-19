import express from 'express';
import { 
  getAllDevelopers, 
  getDeveloperById, 
  createDeveloper, 
  updateDeveloper, 
  updateAvailability, 
  deleteDeveloper,
  getExpertiseOptions
} from '../controllers/developerController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken, getAllDevelopers);
router.post('/', authenticateToken, requireRole(['Admin']), createDeveloper);
router.get('/options', authenticateToken, getExpertiseOptions);
router.get('/:id', authenticateToken, getDeveloperById);
router.put('/:id', authenticateToken, updateDeveloper);
router.put('/:id/availability', authenticateToken, updateAvailability);
router.delete('/:id', authenticateToken, requireRole(['Admin']), deleteDeveloper);

export default router;
