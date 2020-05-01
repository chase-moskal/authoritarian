
import {CardClues, PaymentDetails, SubscriptionDetails} from "../../interfaces.js"
import {Stripe} from "../../commonjs/stripe.js"

export const getStripeId = (x: string | {id: string}) => {
	return x && (
		typeof x === "string"
			? x
			: x.id
	)
}

export interface MinimalCard extends Partial<Stripe.PaymentMethod.Card> {
	brand: string,
	last4: string,
	country: string,
	exp_year: number,
	exp_month: number,
}

export const toCardClues = ({card}: {card?: MinimalCard}): CardClues => (
	card && {
		brand: card.brand,
		last4: card.last4,
		country: card.country,
		expireYear: card.exp_year,
		expireMonth: card.exp_month,
	}
)

export const toPaymentDetails = (method: {
		id: string
		card?: MinimalCard
	}): PaymentDetails => ({
	card: toCardClues(method),
	stripePaymentMethodId: method.id,
})

export const toSubscriptionDetails = (subscription: {
	current_period_end: number
	status: Stripe.Subscription.Status
}): SubscriptionDetails => ({
	status: subscription.status,
	expires: subscription.current_period_end,
})
