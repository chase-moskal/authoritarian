
import {NicknameStructure} from "../../types.js"
import {randomSample} from "../../toolbox/random9.js"
import * as dictionaries from "../../toolbox/nickname-dictionaries.js"

const pick = (names: string[]) => randomSample(names)

export function curryGenerateNickname({nicknameStructure, delimiter}: {
		delimiter: string,
		nicknameStructure: NicknameStructure,
	}) {
	const nicknameData = nicknameStructure.map(
		dictionarySet => dictionarySet.reduce(
			(previous, dictionaryName) => [
				...previous,
				...dictionaries[dictionaryName],
			],
			<string[]>[]
		)
	)
	return () => nicknameData.map(pick).join(delimiter)
}