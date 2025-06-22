type UpdateGroupDto = {
    name: string;
    description?: string;
    color?: number;
    members: string[];
};

export default UpdateGroupDto;