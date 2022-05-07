type User = {
    permissions: string[];
    roles: string[];
};

type ValidadeUserPermissionParams = {
    user: User | undefined | unknown;
    permissions?: string[];
    roles?: string[];
};

export function validadeUserPermission({
    user,
    permissions,
    roles,
}: ValidadeUserPermissionParams) {
    // @ts-ignore
    if (permissions?.length > 0) {
        const hasAllPermission = permissions?.every((permission) => {
            // @ts-ignore
            return user?.permissions.includes(permission);
        });

        if (!hasAllPermission) {
            return false;
        }
    }
    // @ts-ignore
    if (roles?.length > 0) {
        const hasAllRoles = roles?.some((role) => {
            // @ts-ignore
            return user?.roles.includes(role);
        });

        if (!hasAllRoles) {
            return false;
        }
    }
    return true;
}
