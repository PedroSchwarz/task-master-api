import { ChecklistItemDto } from "./create_task.dto";

type UpdateTaskDto = {
    title: string;
    description?: string;
    priority: string;
    status: string;
    dueDate: Date;
    completed: boolean,
    assignedTo: string[];
    checklist?: ChecklistItemDto[];
    recurring: boolean;
    recurrencePattern?: string;
    recurrenceEndDate?: Date;
};

export default UpdateTaskDto;