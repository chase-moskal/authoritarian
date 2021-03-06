
import {MetalUser} from "../../types.js"
import {MetalConfig, MetalOptions} from "../types.js"

import {openVaultIframe} from "../../business/auth/vault-popup/open-vault-iframe.js"
import {openAccountPopup} from "../../business/auth/account-popup/open-account-popup.js"
import {openCheckoutPopup} from "../../business/paywall/checkout-popup/open-checkout-popup.js"

import {makeAuthClients} from "../../business/auth/auth-clients.js"
import {makePaywallClients} from "../../business/paywall/paywall-clients.js"
import {makeLiveshowClients} from "../../features/liveshow/liveshow-clients.js"
import {makeScheduleClients} from "../../business/schedule/schedule-clients.js"
import {makeSettingsClients} from "../../business/settings/settings-clients.js"
import {makeQuestionsClients} from "../../business/questions/questions-clients.js"

import {concurrent} from "../../toolbox/concurrent.js"
import {makeLogger} from "../../toolbox/logger/make-logger.js"
import {decodeAccessToken} from "../system/decode-access-token.js"

export async function initialize(config: MetalConfig): Promise<MetalOptions> {
	const logger = makeLogger()

	const checkoutPopupUrl = `${config["paywall-server"]}/checkout`

	async function triggerAccountPopup() {
		const {promisedPayload} = openAccountPopup({
			authServerOrigin: config["auth-server"]
		})
		return promisedPayload
	}

	async function triggerCheckoutPopup({stripeSessionId}: {stripeSessionId: string}) {
		openCheckoutPopup({
			stripeSessionId,
			paywallServerOrigin: config["paywall-server"],
		})
	}

	try {
		const {
			tokenStore,
			userUmbrella,
			liveshowTopic,
			questionQuarry,
			scheduleSentry,
			settingsSheriff,
			premiumPachyderm,
		} = await concurrent({
			tokenStore: (async function() {
				const {tokenStore} = await openVaultIframe({
					authServerOrigin: config["auth-server"],
				})
				return tokenStore
			})(),
			userUmbrella: (async function() {
				const {userUmbrella} = await makeAuthClients<MetalUser>({
					authServerOrigin: config["auth-server"],
				})
				return userUmbrella
			})(),
			liveshowTopic: (async function() {
				const {liveshowTopic} = await makeLiveshowClients(config["liveshow-server"])
				return liveshowTopic
			})(),
			questionQuarry: (async function() {
				const {questionQuarry} = await makeQuestionsClients({
					questionsServerOrigin: config["questions-server"],
				})
				return questionQuarry
			})(),
			scheduleSentry: (async function() {
				const {scheduleSentry} = await makeScheduleClients({
					scheduleServerOrigin: config["schedule-server"],
				})
				return scheduleSentry
			})(),
			settingsSheriff: (async function() {
				const {settingsSheriff} = await makeSettingsClients({
					settingsServerOrigin: config["settings-server"],
				})
				return settingsSheriff
			})(),
			premiumPachyderm: (async function() {
				const {premiumPachyderm} = await makePaywallClients({
					paywallServerOrigin: config["paywall-server"],
				})
				return premiumPachyderm
			})(),
		})
		return {
			logger,
			tokenStore,
			userUmbrella,
			liveshowTopic,
			questionQuarry,
			scheduleSentry,
			settingsSheriff,
			premiumPachyderm,
			checkoutPopupUrl,
			decodeAccessToken,
			triggerAccountPopup,
			triggerCheckoutPopup,
		}
	}
	catch (error) {
		error.name = "MetalshopStartupError"
		error.message = `initialization error: ${error.message}`
		throw error
	}
}
