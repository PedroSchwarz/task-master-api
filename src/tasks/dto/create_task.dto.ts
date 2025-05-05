type CreateTaskDto = {
    title: string;
    description?: string;
    priority?: string;
    status?: string;
    dueDate: Date;
    group: string;
    assignedTo?: string[];
};

export default CreateTaskDto;