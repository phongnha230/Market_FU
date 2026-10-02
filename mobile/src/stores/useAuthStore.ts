import { useUserStore } from './userStore';

export * from './userStore';
export const useAuthStore = useUserStore;
export default useUserStore;
