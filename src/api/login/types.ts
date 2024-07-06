export type UserLoginType = {
  username: string
  password: string
}

export type UserType = {
  username: string
  password: string
  userId: string
  roleId: string
  permissions: string | string[]
}
