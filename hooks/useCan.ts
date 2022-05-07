import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { validadeUserPermission } from '../utils/validadeUserPermissions';

type UseCanParams = {
    permissions?: string[];
    roles?: string[];
};

export function useCan({ roles, permissions }: UseCanParams) {
    const { user, isAuthenticated } = useContext(AuthContext);

    if (!isAuthenticated) {
        return false;
    }

    const userHasValidPermission = validadeUserPermission({
        user,
        permissions,
        roles,
    });

    return userHasValidPermission;
}
