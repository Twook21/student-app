// types/next-auth.d.ts
import { DefaultSession, DefaultUser } from "next-auth"
import { JWT, DefaultJWT } from "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      roles: string[]
      status: string
      student?: {
        id: string
        nisn: string
        name: string
        totalPoint: number
        classId: string | null
      } | null
      teacher?: {
        id: string
        nip: string
        name: string
        isHomeroom: boolean
        homeroomClassId: string | null
      } | null
      parent?: {
        id: string
        name: string
      } | null
    } & DefaultSession["user"]
  }

  interface User {
    id: string
    email: string
    roles: string[]
    status: string
    student?: {
      id: string
      nisn: string
      name: string
      totalPoint: number
      classId: string | null
    } | null
    teacher?: {
      id: string
      nip: string
      name: string
      isHomeroom: boolean
      homeroomClassId: string | null
    } | null
    parent?: {
      id: string
      name: string
    } | null
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    roles: string[]
    status: string
    student?: {
      id: string
      nisn: string
      name: string
      totalPoint: number
      classId: string | null
    } | null
    teacher?: {
      id: string
      nip: string
      name: string
      isHomeroom: boolean
      homeroomClassId: string | null
    } | null
    parent?: {
      id: string
      name: string
    } | null
  }
}