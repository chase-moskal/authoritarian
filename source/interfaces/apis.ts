
import {Api as CrosscallApi} from "crosscall/dist/interfaces.js"
import {Topic, Api as RenrakuApi} from "renraku/dist/interfaces.js"

export {Topic, RenrakuApi, CrosscallApi}

import {
	AuthDealerTopic,
	TokenStoreTopic,
	AccountPopupTopic,
	AuthVanguardTopic,
	AuthExchangerTopic,
	PaywallLiaisonTopic,
	ScheduleSentryTopic,
	SettingsSheriffTopic,
	QuestionsBureauTopic,
	LiveshowGovernorTopic,
	ProfileMagistrateTopic,
} from "../interfaces.js"

//
// renraku api's
//

export interface AuthApi extends RenrakuApi<AuthApi> {
	authDealer: AuthDealerTopic
	authVanguard: AuthVanguardTopic
	authExchanger: AuthExchangerTopic
}

export interface SettingsApi extends RenrakuApi<SettingsApi> {
	settingsSheriff: SettingsSheriffTopic
}

export interface ProfileApi extends RenrakuApi<ProfileApi> {
	profileMagistrate: ProfileMagistrateTopic
}

export interface PaywallApi extends RenrakuApi<PaywallApi> {
	paywallLiaison: PaywallLiaisonTopic
}

export interface LiveshowApi extends RenrakuApi<LiveshowApi> {
	liveshowGovernor: LiveshowGovernorTopic
}

export interface QuestionsApi extends RenrakuApi<QuestionsApi> {
	questionsBureau: QuestionsBureauTopic
}

export interface ScheduleApi extends RenrakuApi<ScheduleApi> {
	scheduleSentry: ScheduleSentryTopic
}

//
// crosscall api's
//

export interface VaultApi extends CrosscallApi<VaultApi> {
	tokenStore: TokenStoreTopic
}

export interface AccountPopupApi extends CrosscallApi<AccountPopupApi> {
	accountPopup: AccountPopupTopic
}
