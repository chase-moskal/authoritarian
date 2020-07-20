
import {User} from "../types.js"

export interface CardClues {
	brand: string
	last4: string
	country: string
	expireYear: number
	expireMonth: number
}

export interface PremiumInfo {
	cardClues: CardClues
}

export interface QuestionDraft {
	board: string
	content: string
}

export interface Question extends QuestionDraft {
	questionId: string
	author: User
	liked: boolean
	likes: number
	reports: number
	reported: boolean
	timePosted: number
}

export interface ScheduleEvent {
	label: string
	time: number
}
