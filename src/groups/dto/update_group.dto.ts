type UpdateGroupDto = {
    name: string;
    description?: string;
    bannerImage?: string;
    members: string[];
};

export default UpdateGroupDto;