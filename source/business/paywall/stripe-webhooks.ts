
import {Stripe} from "../../commonjs/stripe.js"
import {SimpleConsole} from "../../toolbox/logger.js"
import {BillingDatalayer, PaywallOverlordTopic, StripeWebhooks} from "../../interfaces.js"

export function makeStripeWebhooks({stripe, logger, billing, paywallOverlord}: {
		stripe: Stripe
		logger: SimpleConsole
		billing: BillingDatalayer
		paywallOverlord: PaywallOverlordTopic
	}): StripeWebhooks {

	const internal = {
		logEvent(event: Stripe.Event) {
			logger.debug("stripe webhook", event.type)
		},
		getId(object: string | {id: string}) {
			return object && (
				typeof object == "string"
					? object
					: object.id
			)
		},
	}

	return {

		/**
		 * customer saved a payment source and maybe purchased something
		 * - happens when a user links a card, for the sake of future payments
		 * - also happens when a user purchases a subscription or product
		 */
		async ["checkout.session.completed"](event: Stripe.Event): Promise<void> {
			internal.logEvent(event)
			const session = <Stripe.Checkout.Session>event.data.object
			const userId = session.client_reference_id
			const stripeSubscriptionId = internal.getId(session.subscription)
			const intentId = internal.getId(session.setup_intent)
			const intent = await stripe.setupIntents.retrieve(intentId)
			const paymentMethodId = internal.getId(intent.payment_method)

			// link a card
			if (session.mode === "setup") {
				logger.debug(" - checkout in 'setup' mode")
				const record = await billing.getRecord(userId)

				// update our record's payment method
				record.stripePaymentMethodId = paymentMethodId

				// update payment method on stripe subscription
				if (record.premiumSubscription) {
					const {stripeSubscriptionId} = record.premiumSubscription
					await stripe.subscriptions.update(stripeSubscriptionId, {
						default_payment_method: paymentMethodId
					})
				}

				// save billing record and update our user's billing claim
				await billing.saveRecord(record)
				await paywallOverlord.setUserBillingClaim({
					linked: true,
					userId: record.userId,
				})

				logger.debug(` - user '${userId}' linked to stripe `
					+ `customer '${record.stripeCustomerId}'`)
			}

			// customer purchased a subscription
			else if (session.mode === "subscription") {
				logger.debug(" - checkout in 'subscription' mode")
				const subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId)
				const planActive = !!subscription.plan?.active
				if (!planActive) throw new Error("new plan isn't active")

				// update the billing record
				const record = await billing.getRecord(userId)
				record.stripePaymentMethodId = paymentMethodId
				record.premiumSubscription = {stripeSubscriptionId, autoRenew: true}
				await billing.saveRecord(record)

				// update our user's billing claim
				await paywallOverlord.setUserBillingClaim({
					linked: true,
					userId: record.userId,
				})

				// update our user's premium claim
				await paywallOverlord.setUserPremiumClaim({
					userId,
					expires: subscription.current_period_end,
				})

				logger.debug(` - user '${userId}' linked to stripe `
					+ `customer '${record.stripeCustomerId}'`)
			}

			// handle error
			else throw new Error("unknown session mode for stripe webhook "
				+ "'checkout.session.completed'")
		},

		/**
		 * subscription details have changed
		 * - perhaps payments failed and stripe ended the subscription
		 * - or maybe a subscription was reactived after successful payments
		 */
		async ["customer.subscription.updated"](
				event: Stripe.Event
			): Promise<void> {
			internal.logEvent(event)
			const subscription = <Stripe.Subscription>event.data.object
			const stripeSubscriptionId = subscription.id
			const stripeCustomerId = internal.getId(subscription.customer)
			const active: boolean = !!subscription.plan?.active
			const record = await billing.getRecordByStripeCustomerId(stripeCustomerId)

			record.premiumSubscription = active
				? record.premiumSubscription || {
					autoRenew: true,
					stripeSubscriptionId,
				}
				: null

			await billing.saveRecord(record)
			await paywallOverlord.setUserPremiumClaim({
				userId: record.userId,
				expires: subscription.current_period_end,
			})
		},
	}
}
