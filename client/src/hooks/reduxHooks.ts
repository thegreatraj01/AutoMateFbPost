import type { AppDispatch, RootState } from "../types/redux";
import { useSelector, TypedUseSelectorHook ,useDispatch } from 'react-redux';



export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;