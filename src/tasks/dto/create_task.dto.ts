type CreateTaskDto = {
    title: string;
    description?: string;
    priority?: string;
    status?: string;
    dueDate: Date;
    group: string;
    assignedTo?: string[];
    checklist?: ChecklistItemDto[];
};

type ChecklistItemDto = {
    title: string;
    status?: string;
    order: number;
}

export default CreateTaskDto;
export { ChecklistItemDto };