import { EntityRepository, Repository } from 'typeorm';
import { Task } from './task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { TaskStatus } from './task-status.enum';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';

@EntityRepository(Task)
export class TaskRepository extends Repository<Task> {
  async getTasks(filterDto: GetTasksFilterDto): Promise<Task[]> {
    const { search, status } = filterDto;

    const query = this.createQueryBuilder('task');

    if (status) {
      // andWhere allows us to search and status without both
      // values overriding each other  and return multiple queries
      // :status = variable status
      query.andWhere('task.taskStatus = :status', { status });
    }

    if (search) {
      //LIKE is same = but allows partial match, more forgiving if
      // it found white space before serach , same for using %%
      query.andWhere(
        'task.title LIKE :search OR task.description LIKE :search',
        { search: `%${search}%` },
      );
    }

    const tasks = await query.getMany();

    return tasks;
  }

  async createTask(createTaskDto: CreateTaskDto): Promise<Task> {
    const { title, description } = createTaskDto;

    const task = new Task();

    task.title = title;
    task.description = description;
    task.taskStatus = TaskStatus.OPEN;

    await task.save();

    return task;
  }
}
