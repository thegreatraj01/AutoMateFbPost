import store from '@/store';

// for login user
export interface User {
    _id: string,
    fullName: string,
    email: string,
    userName: string,
    accessToken?: string,
    createdAt?: string,
    updatedAt?: string
    authProvider?:string,
    isEmailVerified?:bolean
}



// Types
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;