import { useSelector, useDispatch } from 'react-redux';
import { selectUser } from 'src/redux/reducers/user';
import { selectToken } from 'src/redux/reducers/token';

export const useAuth = () => {
  const dispatch = useDispatch();
  const token = useSelector(selectToken);
  const user = useSelector(selectUser);

  return {
    isAuthenticated: (token && user) ? true : false,
    isEmailVerified: user?.email_verified_at ? true : false,
    getId: user?.id,
    getName: `${user?.first_name ?? ''} ${user?.last_name ?? ''}`,
    getFirstName: user?.first_name,
    getLastName: user?.last_name,
    getPhoto: user?.photo,
    getEmail: user?.email,
    getToken: token,
    getCurrentUser: user,
    getStatus: user?.status,
    logout: () => dispatch({ type: 'USER_LOGOUT' }),
  }
}