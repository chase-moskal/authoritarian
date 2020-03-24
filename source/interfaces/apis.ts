
import {Api as CrosscallApi} from "crosscall/dist/interfaces.js"
import {Topic, Api as RenrakuApi} from "renraku/dist/interfaces.js"

export {Topic, RenrakuApi, CrosscallApi}

import {
	AccountPopupTopic,
	ClaimsDealerTopic,
	TokenStorageTopic,
	AuthExchangerTopic,
	ClaimsVanguardTopic,
	PaywallGuardianTopic,
	LiveshowGovernorTopic,
} from "../interfaces.js"

import {QuestionsBureauTopic} from "../business/questions-bureau/interfaces.js"
import {ProfileMagistrateTopic} from "../business/profile-magistrate/interfaces.js"

//
// renraku api's
//

export interface AuthApi extends RenrakuApi<AuthApi> {
	claimsDealer: ClaimsDealerTopic
	authExchanger: AuthExchangerTopic
	claimsVanguard: ClaimsVanguardTopic
}

export interface ProfileApi extends RenrakuApi<ProfileApi> {
	profileMagistrate: ProfileMagistrateTopic
}

export interface PaywallApi extends RenrakuApi<PaywallApi> {
	paywallGuardian: PaywallGuardianTopic
}

export interface LiveshowApi extends RenrakuApi<LiveshowApi> {
	liveshowGovernor: LiveshowGovernorTopic
}

export interface QuestionsApi extends RenrakuApi<QuestionsApi> {
	questionsBureau: QuestionsBureauTopic
}

//
// crosscall api's
//

export interface TokenStorageApi extends CrosscallApi<TokenStorageApi> {
	tokenStorage: TokenStorageTopic
}

export interface AccountPopupApi extends CrosscallApi<AccountPopupApi> {
	accountPopup: AccountPopupTopic
}