
import {QuestionRecord} from "./database.js"

export interface QuestionsActions {
	fetchRecords(board: string): Promise<QuestionRecord[]>

	getRecordById(
		questionId: string
	): Promise<QuestionRecord>

	saveRecord(
		record: QuestionRecord
	): Promise<void>

	likeRecord(options: {
		like: boolean
		userId: string
		questionId: string
	}): Promise<QuestionRecord>

	trashRecord(
		questionId: string
	): Promise<void>
}