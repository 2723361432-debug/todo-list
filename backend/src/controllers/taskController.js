import * as taskService from '../services/taskService.js';

/**
 * GET /api/tasks
 */
export async function listTasks(req, res, next) {
  try {
    const tasks = await taskService.getAll();
    res.json(tasks);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/tasks
 */
export async function createTask(req, res, next) {
  try {
    const task = await taskService.create(req.body);
    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/tasks/:id
 */
export async function updateTask(req, res, next) {
  try {
    const task = await taskService.update(req.params.id, req.body);
    res.json(task);
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/tasks/:id
 */
export async function deleteTask(req, res, next) {
  try {
    await taskService.remove(req.params.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}
