type UpdateTaskDto = {
    title: string;
    description?: string;
    priority: string;
    status: string;
    dueDate: Date;
    completed: boolean,
    assignedTo: string[];
};

export default UpdateTaskDto;