/**
 * Admin Jobs Routes
 *
 * Routes for managing scheduled jobs.
 */

import { Router, Response } from 'express';
import { AuthenticatedRequest } from '../../middleware/authenticate.js';
import { runJob, getJobStatus, getJobHistory, getJobStats, getTrackedJobs } from '../../jobs/index.js';

const router = Router();

// GET /api/admin/jobs - Job status
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const jobs = getJobStatus();
    res.json({ jobs });
  } catch (err) {
    console.error('GET /api/admin/jobs error:', err);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

// POST /api/admin/jobs/:name/run - Trigger job manually
router.post('/:name/run', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const jobName = req.params.name;
    const result = await runJob(jobName);
    res.json({ job: jobName, result });
  } catch (err) {
    console.error('POST /api/admin/jobs/:name/run error:', err);
    const message = err instanceof Error ? err.message : 'Failed to run job';
    res.status(500).json({ error: message });
  }
});

// GET /api/admin/jobs/history - Get job execution history
router.get('/history', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { limit = 100, jobName } = req.query;

    // Get execution history
    const history = getJobHistory(
      Number(limit),
      jobName ? String(jobName) : undefined
    );

    // Get statistics for all tracked jobs
    const trackedJobs = getTrackedJobs();
    const stats = trackedJobs.map((name) => ({
      jobName: name,
      ...getJobStats(name),
    }));

    res.json({
      history,
      stats,
      totalExecutions: history.length,
    });
  } catch (err) {
    console.error('GET /api/admin/jobs/history error:', err);
    res.status(500).json({ error: 'Failed to fetch job history' });
  }
});

export default router;
