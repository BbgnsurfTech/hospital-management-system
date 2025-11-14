import pool from '../config/database';
import redisClient from '../config/redis';
import { PatientStatus, QueueItem } from '../types';
import { emitToRole } from './socketService';

interface AddToQueueParams {
  visitId: string;
  patientId: string;
  patientName: string;
  department: string;
  status: PatientStatus;
  priority?: 'normal' | 'urgent' | 'emergency';
}

export const addToQueue = async (params: AddToQueueParams) => {
  const { visitId, patientId, patientName, department, status, priority = 'normal' } = params;

  // Get next queue number for the department
  const queueCountResult = await pool.query(
    "SELECT COUNT(*) FROM queue WHERE department = $1 AND DATE(created_at) = CURRENT_DATE AND status IN ('waiting', 'in_progress')",
    [department]
  );

  const queueNumber = parseInt(queueCountResult.rows[0].count) + 1;

  // Insert into queue
  const result = await pool.query(
    `INSERT INTO queue (visit_id, patient_id, queue_number, department, priority, status)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [visitId, patientId, queueNumber, department, priority, status]
  );

  const queueItem = result.rows[0];

  // Cache in Redis for quick access
  await redisClient.hSet(
    `queue:${department}`,
    visitId,
    JSON.stringify({
      ...queueItem,
      patientName,
    })
  );

  // Calculate estimated wait time based on queue position
  const estimatedWaitTime = queueNumber * 15; // Assume 15 minutes per patient

  // Emit queue update to relevant staff
  emitToRole(department, 'queue-updated', {
    department,
    queueItem: {
      ...queueItem,
      patientName,
      estimatedWaitTime,
    },
  });

  return { ...queueItem, estimatedWaitTime };
};

export const getQueue = async (department: string) => {
  const result = await pool.query(
    `SELECT q.*, p.first_name || ' ' || p.last_name as patient_name
     FROM queue q
     JOIN patients p ON q.patient_id = p.id
     WHERE q.department = $1
     AND DATE(q.created_at) = CURRENT_DATE
     AND q.status IN ('waiting', 'in_progress')
     ORDER BY
       CASE priority
         WHEN 'emergency' THEN 1
         WHEN 'urgent' THEN 2
         ELSE 3
       END,
       q.joined_at ASC`,
    [department]
  );

  return result.rows;
};

export const updateQueueStatus = async (
  visitId: string,
  status: PatientStatus,
  department: string
) => {
  const result = await pool.query(
    'UPDATE queue SET status = $1, called_at = CASE WHEN $1 = $3 THEN CURRENT_TIMESTAMP ELSE called_at END WHERE visit_id = $2 RETURNING *',
    [status, visitId, 'in_progress']
  );

  if (result.rows.length > 0) {
    // Update Redis cache
    const queueItem = result.rows[0];
    await redisClient.hSet(
      `queue:${department}`,
      visitId,
      JSON.stringify(queueItem)
    );

    // Emit update
    emitToRole(department, 'queue-status-changed', {
      visitId,
      status,
      department,
    });
  }

  return result.rows[0];
};

export const removeFromQueue = async (visitId: string, department: string) => {
  await pool.query(
    'UPDATE queue SET status = $1, completed_at = CURRENT_TIMESTAMP WHERE visit_id = $2',
    ['completed', visitId]
  );

  // Remove from Redis
  await redisClient.hDel(`queue:${department}`, visitId);

  // Emit update
  emitToRole(department, 'queue-updated', {
    department,
    action: 'removed',
    visitId,
  });
};

export const getQueuePosition = async (visitId: string, department: string) => {
  const result = await pool.query(
    `SELECT COUNT(*) as position
     FROM queue
     WHERE department = $1
     AND DATE(created_at) = CURRENT_DATE
     AND status = 'waiting'
     AND joined_at < (SELECT joined_at FROM queue WHERE visit_id = $2)`,
    [department, visitId]
  );

  return parseInt(result.rows[0].position) + 1;
};
