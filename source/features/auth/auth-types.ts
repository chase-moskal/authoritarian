
import {makeAuthApi} from "./auth-api.js"
import {makeTokenStore} from "./token-store.js"

export * from "redcrypto/dist/types.js"

// api topics
//

export type AuthApi = ReturnType<typeof makeAuthApi>
export type TokenStoreTopic = ReturnType<typeof makeTokenStore>

export type AppsTopic = AuthApi["appsTopic"]
export type AuthTopic = AuthApi["authTopic"]
export type UserTopic = AuthApi["userTopic"]

// auth types
//

export type User = {
	userId: string
	profile: Profile
	tags: string[]
}

export type Claims = Partial<{
	isAdmin: boolean
	ban: {
		until: number
		reason: string
	}
	liveshow: {
		read: boolean
		write: boolean
	}
	profiles: {
		readAll: boolean
		writeAll: boolean
	}
	profilesWriteAll: boolean
	liveshowRead: boolean
	liveshowWrite: boolean
}>

export type Profile = {
	userId: string
	nickname: string
	tagline: string
	avatar: string
}

export type Settings = {
	actAsAdmin: boolean
}

// tokens
//

export type AppToken = string
export type AccessToken = string
export type RefreshToken = string

export interface Scope {
	metalshop?: boolean
}

export interface AppPayload {
	appId: string
	origins: string[]
	root?: boolean
}

export interface AccessPayload {
	user: User
	scope: Scope
}

export interface RefreshPayload {
	userId: string 
}

export interface TokenData<Payload> {
	iat: any
	exp: any
	payload: Payload
}

export type VerifyRefreshToken = (
		refreshToken: RefreshToken
	) => Promise<RefreshPayload>

export type VerifyAccessToken = (
		accessToken: AccessToken
	) => Promise<AccessPayload>

export type Authorizer = (
		accessToken: AccessToken
	) => Promise<User>

// database rows
//

export type AccountRow = {
	userId: string
	created: number
}

export type AccountViaGoogleRow = {
	userId: string
	googleId: string
	googleAvatar: string
}

export type AccountViaPasskeyRow = {
	userId: string
	digest: string
}

export type AccountViaSignatureRow = {
	userId: string
	publicKey: string
}

export type ProfileRow = {
	userId: string
	nickname: string
	tagline: string
	avatar: string
}

export type SettingsRow = {
	actAsAdmin: boolean
}

// roles and permissions
//

export type RoleRow = {
	roleId: string
	label: string
}

export type PrivilegeRow = {
	privilegeId: string
	label: string
}

// user has roles
export type UserRoleRow = {
	userId: string
	roleId: string
}

// role has privileges
export type RolePrivilegeRow = {
	privilegeId: string
	roleId: string
	label: string
}
