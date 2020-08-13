
import {Stripe} from "../../../commonjs/stripe.js"

import {generateId} from "../../../toolbox/generate-id.js"
import {randomSequence, numbers} from "../../../toolbox/random8.js"

import {toPaymentDetails, toSubscriptionDetails} from "../helpers.js"
import {StripeLiaison, StripeWebhooks, UpdateFlow} from "../types.js"

import {MockStripeTables, MockCustomer, MockSetupIntent, MockSubscription, MockPaymentMethod} from "./mock-stripe-types.js"

const days = (n: number) => n * (1000 * 60 * 60 * 24)

export function mockStripeLiaison({
		tables,
		webhooks,
	}: {
		tables: MockStripeTables
		webhooks: StripeWebhooks
	}): StripeLiaison {

	//
	// functions for low level data interaction with the tables
	//

	async function insertCustomer(customer: MockCustomer) {
		await tables.customers.create(customer)
	}

	async function insertSetupIntent(setupIntent: MockSetupIntent) {
		await tables.setupIntents.create(setupIntent)
	}

	async function insertSubscription(subscription: MockSubscription) {
		await tables.subscriptions.create(subscription)
	}

	async function insertPaymentMethod(paymentMethod: MockPaymentMethod) {
		await tables.paymentMethods.create(paymentMethod)
	}

	async function fetchCustomer(id: string) {
		return tables.customers.one({conditions: {equal: {id}}})
	}

	async function fetchSubscription(id: string) {
		return tables.subscriptions.one({conditions: {equal: {id}}})
	}

	async function fetchPaymentMethod(id: string) {
		return tables.paymentMethods.one({conditions: {equal: {id}}})
	}

	async function fetchSetupIntent(id: string) {
		return tables.setupIntents.one({conditions: {equal: {id}}})
	}

	//
	// functions to create mock stripe objects
	//

	function mockSessionForSubscriptionPurchase({
			userId,
			customer,
			subscription,
		}: {
			userId: string
			customer: MockCustomer
			subscription: MockSubscription
		}): Partial<Stripe.Checkout.Session> {
		return {
			id: generateId(),
			mode: "subscription",
			customer: customer.id,
			client_reference_id: userId,
			subscription: subscription.id,
		}
	}

	function mockSessionForSubscriptionUpdate({
			flow,
			userId,
			customer,
			setupIntent,
		}: {
			userId: string
			flow: UpdateFlow
			customer: MockCustomer
			setupIntent: MockSetupIntent
		}): Partial<Stripe.Checkout.Session> {
		return {
			id: generateId(),
			mode: "setup",
			metadata: {flow},
			customer: customer.id,
			client_reference_id: userId,
			setup_intent: setupIntent.id,
		}
	}

	async function mockCustomer(): Promise<MockCustomer> {
		const customer = {
			id: generateId()
		}
		await insertCustomer(customer)
		return customer
	}

	async function mockPaymentMethod(): Promise<MockPaymentMethod> {
		const paymentMethod = {
			id: generateId(),
			card: {
				brand: "FAKEVISA",
				country: "US",
				exp_year: 2020,
				exp_month: 10,
				last4: randomSequence(4, numbers),
				description: "description",
				funding: "credit",
				checks: null,
				wallet: null,
				networks: null,
				three_d_secure_usage: null,
			},
		}
		await insertPaymentMethod(paymentMethod)
		return paymentMethod
	}

	async function mockSetupIntent({customer, subscription, paymentMethod}: {
			customer: MockCustomer
			subscription: MockSubscription
			paymentMethod: MockPaymentMethod
		}): Promise<MockSetupIntent> {
		const setupIntent: MockSetupIntent = {
			id: generateId(),
			customer: customer.id,
			payment_method: paymentMethod.id,
			metadata: {
				subscription_id: subscription.id
			},
		}
		await insertSetupIntent(setupIntent)
		return setupIntent
	}

	async function mockSubscription({planId, customer, paymentMethod}: {
			planId: string
			customer: MockCustomer
			paymentMethod: MockPaymentMethod
		}): Promise<MockSubscription> {
		const subscription: MockSubscription = {
			id: generateId(),
			status: "active",
			plan: {id: planId},
			customer: customer.id,
			cancel_at_period_end: false,
			current_period_end: Date.now() + days(30),
			default_payment_method: paymentMethod.id,
		}
		await insertSubscription(subscription)
		return subscription
	}

	//
	// return stripe liaison object
	//

	return {

		async createCustomer() {
			const customer = await mockCustomer()
			return {stripeCustomerId: customer.id}
		},

		async checkoutSubscriptionPurchase({
				userId,
				popupUrl,
				stripePlanId,
				stripeCustomerId,
			}) {
			const customer = await fetchCustomer(stripeCustomerId)
			const paymentMethod = await mockPaymentMethod()
			const subscription = await mockSubscription({
				customer,
				paymentMethod,
				planId: stripePlanId,
			})
			const session = mockSessionForSubscriptionPurchase({
				userId,
				customer,
				subscription,
			})

			await webhooks["checkout.session.completed"](<any>{
				id: generateId(),
				data: {object: session},
			})

			return {stripeSessionId: session.id}
		},

		async checkoutSubscriptionUpdate({
				flow,
				userId,
				stripeCustomerId,
				stripeSubscriptionId,
			}) {

			const customer = await fetchCustomer(stripeCustomerId)
			const subscription = await fetchSubscription(stripeSubscriptionId)

			const paymentMethod = await mockPaymentMethod()
			const setupIntent = await mockSetupIntent({
				customer,
				subscription,
				paymentMethod,
			})
			const session = mockSessionForSubscriptionUpdate({
				flow,
				userId,
				customer,
				setupIntent,
			})

			await webhooks["checkout.session.completed"](<any>{
				id: generateId(),
				data: {object: session},
			})

			return {stripeSessionId: session.id}
		},

		async updateSubscriptionPaymentMethod({
				stripeSubscriptionId,
				stripePaymentMethodId,
			}) {
			const subscription = await fetchSubscription(stripeSubscriptionId)
			subscription.default_payment_method = stripePaymentMethodId
			await webhooks["customer.subscription.updated"](<any>{
				id: generateId(),
				data: {object: subscription}
			})
		},

		async scheduleSubscriptionCancellation({
				stripeSubscriptionId,
			}) {
			const subscription = await fetchSubscription(stripeSubscriptionId)
			subscription.cancel_at_period_end = true
			subscription.status = "canceled"
			await webhooks["customer.subscription.updated"](<any>{
				id: generateId(),
				data: {object: subscription}
			})
		},

		async fetchSubscriptionDetails(subscriptionId) {
			const subscription = await fetchSubscription(subscriptionId)
			return toSubscriptionDetails(subscription)
		},

		async fetchPaymentDetails(paymentMethodId) {
			const paymentMethod = await fetchPaymentMethod(paymentMethodId)
			return toPaymentDetails(paymentMethod)
		},

		async fetchPaymentDetailsByIntentId(setupIntentId) {
			const setupIntent = await fetchSetupIntent(setupIntentId)
			const paymentMethod = await fetchPaymentMethod(setupIntent.payment_method)
			return toPaymentDetails(paymentMethod)
		},

		async fetchPaymentDetailsBySubscriptionId(subscriptionId) {
			const subscription = await fetchSubscription(subscriptionId)
			const paymentMethod = await fetchPaymentMethod(subscription.default_payment_method)
			return toPaymentDetails(paymentMethod)
		},
	}
}
