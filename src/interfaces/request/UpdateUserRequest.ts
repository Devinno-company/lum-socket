import UpdateLocationUser from "./UpdateLocationUserRequest";

interface UpdateUserRequest {
    name_to?: string,
    surname_to?: string,
    biography_to?: string,
    label_to?: string,
    profission_to?: string,
    company_to?: string,
    website_to?: string,
    location_to?: UpdateLocationUser
}

export default UpdateUserRequest;