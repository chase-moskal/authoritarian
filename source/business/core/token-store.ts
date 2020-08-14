
import {tokenDecode} from "redcrypto/dist/token-decode.js"
import {SimpleStorage} from "../../toolbox/json-storage.js"
import {TokenStoreTopic, AuthAardvarkTopic} from "../../types.js"

const expiryGraceTime = 10 * 1000

const tokenIsValid = (token: string) => {
	let valid = false
	if (token) {
		const decoded = tokenDecode<any>(token)
		const expiry = decoded.exp * 1000
		const expired = Date.now() > (expiry - expiryGraceTime)
		valid = !expired
	}
	return valid
}

export function makeTokenStore({
		storage,
		authAardvark,
	}: {
		storage: SimpleStorage
		authAardvark: AuthAardvarkTopic
	}): TokenStoreTopic {

	function saveTokens({accessToken, refreshToken}) {
		storage.setItem("accessToken", accessToken || "")
		storage.setItem("refreshToken", refreshToken || "")
	}

	return {

		async writeTokens({accessToken, refreshToken}) {
			saveTokens({accessToken, refreshToken})
		},

		async writeAccessToken(accessToken) {
			storage.setItem("accessToken", accessToken || "")
		},

		async clearTokens() {
			storage.removeItem("accessToken")
			storage.removeItem("refreshToken")
		},

		async passiveCheck() {
			let accessToken = storage.getItem("accessToken")
			let refreshToken = storage.getItem("refreshToken")

			const accessValid = tokenIsValid(accessToken)
			const refreshValid = tokenIsValid(refreshToken)

			if (refreshValid) {
				if (!accessValid) {

					// access token missing or expired -- perform a refresh
					accessToken = await authAardvark.authorize({
						refreshToken,
						scope: {core: true},
					})

					saveTokens({accessToken, refreshToken})
				}
			}
			else {

				// refresh token missing or expired -- no login
				accessToken = null
				refreshToken = null
				saveTokens({refreshToken, accessToken})
			}

			return accessToken
		},
	}
}
