
import {CSSResult, CSSResultArray} from "lit-element"

export * from "../types.js"

import {
	User,
	Question,
	CardClues,
	MetalUser,
	AuthTokens,
	AccessToken,
	MetalGenerics,
	MetalSettings,
	ScheduleEvent,
	QuestionDraft,
	TokenStoreTopic,
	UserUmbrellaTopic,
	ScheduleSentryTopic,
	QuestionQuarryTopic,
	SettingsSheriffTopic,
	PremiumPachydermTopic,
} from "../types.js"

import {LiveshowModel} from "../features/liveshow/liveshow-model.js"
import {LiveshowTopic} from "../features/liveshow/liveshow-types.js"
import {AuthModel} from "./models/auth-model.js"
import {PaywallModel} from "./models/paywall-model.js"
import {PersonalModel} from "./models/personal-model.js"
import {ScheduleModel} from "./models/schedule-model.js"
import {QuestionsModel} from "./models/questions-model.js"

import * as loading from "./toolbox/loading.js"
import {Logger} from "../toolbox/logger/interfaces.js"

////////////////////////

export interface Personal {
	user: MetalUser
	settings: MetalSettings
}

export interface MetalConfig {
	["auth-server"]: string
	["liveshow-server"]: string
	["paywall-server"]: string
	["questions-server"]: string
	["schedule-server"]: string
	["settings-server"]: string
}

export type CSS = CSSResult | CSSResultArray
export type ConstructorFor<T extends {} = {}> = new(...args: any[]) => T

export interface MetalOptions<G extends MetalGenerics = MetalGenerics> {
	logger: Logger
	tokenStore: TokenStoreTopic
	liveshowTopic: LiveshowTopic
	scheduleSentry: ScheduleSentryTopic
	questionQuarry: QuestionQuarryTopic
	premiumPachyderm: PremiumPachydermTopic
	userUmbrella: UserUmbrellaTopic<G["user"]>
	settingsSheriff: SettingsSheriffTopic<G["settings"]>
	//—
	checkoutPopupUrl: string
	decodeAccessToken: DecodeAccessToken<G["user"]>
	triggerAccountPopup: TriggerAccountPopup
	triggerCheckoutPopup: TriggerCheckoutPopup
}

export interface AuthContext<U extends User> {
	user: U
	exp: number
	accessToken: AccessToken
}

export type GetAuthContext<U extends User> = () => Promise<AuthContext<U>>
export type DecodeAccessToken<U extends User> = (accessToken: AccessToken) => AuthContext<U>

export type TriggerAccountPopup = () => Promise<AuthTokens>
export type TriggerCheckoutPopup = (o: {stripeSessionId: string}) => Promise<void>

export interface LoginWithAccessToken {
	(accessToken: AccessToken): Promise<void>
}

export interface AuthPayload<U extends User> {
	user: U
	getAuthContext: GetAuthContext<U>
}

export interface PremiumInfo {
	cardClues: CardClues
}

export interface QuestionValidation {
	angry: boolean
	message: string
	postable: boolean
}

export interface QuestionQuarryUi {
	fetchQuestions(o: {
			board: string
		}): Promise<Question[]>
	postQuestion(o: {
			draft: QuestionDraft
		}): Promise<Question>
	archiveQuestion(o: {
			questionId: string
		}): Promise<void>
	likeQuestion(o: {
			like: boolean
			questionId: string
		}): Promise<Question>
	archiveBoard(o: {
			board: string
		}): Promise<void>
}

export interface MockQuestion {
	tagline: string
	content: string
	likes: number
	ban?: {
		days: number
		reason: string
	}
}

export interface VideoPayload {
	vimeoId: string
}

export type PrepareHandleLikeClick = (o: {
	like: boolean
	questionId: string
}) => (event: MouseEvent) => void

//
// supermodel
//

export interface Supermodel {
	auth: AuthModel<MetalUser>
	paywall: PaywallModel
	personal: PersonalModel
	liveshow: LiveshowModel
	schedule: ScheduleModel
	questions: QuestionsModel
	// seeker: SeekerModel
}

export enum ProfileMode {
	Error,
	Loading,
	Loaded,
	None,
}

export enum BillingPremiumSubscription {
	Unsubscribed,
	Subscribed,
}

export enum PremiumStatus {
	NotPremium,
	Premium,
}

//
// component shares
//

export * from "../features/liveshow/liveshow-types.js"

export interface SettingsPremiumSubscription {
	card: CardClues
}

export interface AccountShare {
	login: () => Promise<void>
	logout: () => Promise<void>
	authLoad: loading.Load<AuthPayload<MetalUser>>
}

export interface MyAvatarShare {
	personalLoad: loading.Load<Personal>
}

export interface ButtonPremiumShare {
	personalLoad: loading.Load<Personal>
	premium: boolean
	premiumUntil: number
	premiumInfoLoad: loading.Load<PremiumInfo>
	login(): Promise<void>
	checkoutPremium(): Promise<void>
}

export interface AdminModeShare {
	personalLoad: loading.Load<Personal>
	setAdminMode(adminMode: boolean): Promise<void>
}

export interface AdminOnlyShare {
	personalLoad: loading.Load<Personal>
}

export interface PersonalShare {
	personal: Personal
	personalLoad: loading.Load<Personal>
	saveProfile(profile: Personal["user"]["profile"]): Promise<void>
	setAdminMode(adminMode: boolean): Promise<void>
	// setAvatarPublicity(avatarPublicity: boolean): Promise<void>
}

export interface PaywallShare {
	personalLoad: loading.Load<Personal>
	premium: boolean
	premiumUntil: number
	premiumInfoLoad: loading.Load<PremiumInfo>
	checkoutPremium(): Promise<void>
	updatePremium(): Promise<void>
	cancelPremium(): Promise<void>
}

export interface QuestionsShare {
	user: MetalUser
	uiBureau: QuestionQuarryUi
	fetchCachedQuestions(board: string): Question[]
}

export interface CountdownShare {
	events: ScheduleEvent[]
	authLoad: loading.Load<AuthPayload<User>>
	loadEvent: (label: string) => Promise<ScheduleEvent>
	saveEvent: (event: ScheduleEvent) => Promise<void>
}

// export interface SeekerShare {
// 	resultsLoad: loading.Load<Persona[]>
// 	query: (needle: string) => Promise<void>
// }

export interface AppInfo {
	appId: string
	userId: string
	label: string
	created: number
	tokens: {
		token: string
		label: string
		origins: string
	}[]
}

export interface AppListShare {
	appsLoad: loading.Load<AppInfo[]>
}
