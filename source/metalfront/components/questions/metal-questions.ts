
import {QuestionDraft, MetalUser} from "../../../types.js"
import {QuestionsShare, PrepareHandleLikeClick} from "../../types.js"

import * as loading from "../../toolbox/loading.js"
import {styles} from "../styles/metal-questions-styles.js"
import {mixinStyles} from "../../framework/mixin-styles.js"
import {isPremium} from "../../../business/auth/user-evaluators.js"
import {MetalshopComponent, property, html, PropertyValues} from "../../framework/metalshop-component.js"

import {sortQuestions} from "./helpers.js"
import {renderQuestion} from "./render-question.js"
import {renderQuestionEditor} from "./render-question-editor.js"

 @mixinStyles(styles)
export class MetalQuestions extends MetalshopComponent<QuestionsShare> {
	private lastBoard: string = null

	 @property({type: String, reflect: true})
	["board"]: string

	 @property({type: String})
	draftText: string = ""

	 @property({type: Boolean})
	adminMode: boolean = false

	 @property({type: Number})
	minCharacterLimit: number = 10

	 @property({type: Number})
	maxCharacterLimit: number = 240

	 @property({type: Object})
	private load: loading.Load<null>

	firstUpdated(props) {
		super.firstUpdated(props)
		this.downloadQuestions()
	}

	updated(changedProperties: PropertyValues) {
		if (changedProperties.has("board")) {
			this.downloadQuestions()
		}
	}

	render() {
		const {
			load,
			board,
			draftText,
			handlePostClick,
			handlePurgeClick,
			maxCharacterLimit,
			handleTextAreaChange,
			prepareHandleLikeClick,
			prepareHandleDeleteClick,
		} = this

		const questions = this.share.fetchCachedQuestions(board)
		const {user} = this.share
		const validation = this.validatePost(user)
		const expand = draftText.length > 0

		return html`
			<iron-loading .load=${load}>

				${questions.length > 0
					? html`
						<metal-is-staff fancy class="coolbuttonarea">
							<button @click=${handlePurgeClick}>Purge all questions</button>
						</metal-is-staff>
					`
					: null}

				<div class="posting-area">
					<slot name="post">
						<h2>Post your own question</h2>
					</slot>
					${renderQuestionEditor({
						expand,
						draftText,
						author: user,
						validation,
						handlePostClick,
						maxCharacterLimit,
						handleTextAreaChange,
					})}
				</div>

				<div class="questions-area">
					<slot name="rate">
						<h2>Rate questions</h2>
					</slot>
					<ol class="questions">
						${sortQuestions(user, questions).map(question => html`
							<li>
								${renderQuestion({
									me: user,
									question,
									prepareHandleLikeClick,
									prepareHandleDeleteClick,
								})}
							</li>
						`)}
					</ol>
				</div>
			</iron-loading>
		`
	}

	private async downloadQuestions() {
		try {
			const {uiBureau} = this.share
			const {board, lastBoard} = this
			this.load = loading.loading()
			if (!board)
				throw new Error(`questions-board requires attribute [board]`)
			if (board !== lastBoard) {
				this.lastBoard = board
				await uiBureau.fetchQuestions({board})
			}
			this.load = loading.ready()
		}
		catch (error) {
			this.load = loading.error("failed to download questions")
			console.error(error)
		}
	}

	private getQuestionDraft(): QuestionDraft {
		const {board, draftText: content} = this
		const valid = !!content
		return valid
			? {board, content}
			: null
	}

	private handleTextAreaChange = (event: Event) => {
		const target = <HTMLTextAreaElement>event.target
		this.draftText = target.value
	}

	private warnUnauthenticatedUser = (): boolean => {
		const {user} = this.share
		let warned = false
		if (!user) {
			alert("you must be logged in to complete that action")
			warned = true
		}
		return warned
	}

	private handlePostClick = async(event: MouseEvent) => {
		if (this.warnUnauthenticatedUser()) return
		const draft = this.getQuestionDraft()
		try {
			this.load = loading.loading()
			await this.share.uiBureau.postQuestion({draft})
			this.draftText = ""
			this.load = loading.ready()
		}
		catch (error) {
			this.load = loading.error("error posting question")
			console.error(error)
		}
	}

	private prepareHandleDeleteClick = (questionId: string) => async() => {
		if (this.warnUnauthenticatedUser())
			return
		if (confirm(`Really delete question ${questionId}?`)) {
			try {
				this.load = loading.loading()
				await this.share.uiBureau.archiveQuestion({questionId})
				this.load = loading.ready()
			}
			catch (error) {
				this.load = loading.error("error deleting question")
				console.error(error)
			}
		}
	}

	private prepareHandleLikeClick: PrepareHandleLikeClick = ({like, questionId}: {
		like: boolean
		questionId: string
	}) => async(event: MouseEvent) => {
		if (this.warnUnauthenticatedUser()) return
		await this.share.uiBureau.likeQuestion({
			like,
			questionId,
		})
		const active = <HTMLElement>document.activeElement
		if (active) active.blur()
	}

	private validatePost(author: MetalUser): {
			angry: boolean
			message: string
			postable: boolean
		} {
		const {
			draftText,
			minCharacterLimit: min,
			maxCharacterLimit: max
		} = this
		const {length} = draftText
		const tooLittle = length < min
		const tooBig = length > max

		const premium = isPremium(author)

		if (!author) return {
			postable: false,
			message: "You must be logged in as a premium user to post",
			angry: false,
		}

		if (!premium) return {
			postable: false,
			message: "You must become a premium user to post",
			angry: false,
		}

		if (length <= 0) return {
			postable: false,
			message: "Nothing to post",
			angry: false,
		}

		if (tooLittle) return {
			postable: false,
			message: `${min - length} more characters needed...`,
			angry: true,
		}

		if (tooBig) return {
			postable: false,
			message: `${max - length} characters too many`,
			angry: true,
		}

		return {
			postable: true,
			message: null,
			angry: false,
		}
	}

	private handlePurgeClick = async() => {
		const {board} = this
		if (confirm("Really purge ALL questions from the board?"))
			await this.share.uiBureau.archiveBoard({board})
	}
}
