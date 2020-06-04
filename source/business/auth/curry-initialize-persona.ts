
import {InitializePersona} from "../../interfaces.js"
import {SettingsSheriffTopic} from "../settings/interfaces.js"
import {ProfileMagistrateTopic} from "../profile/interfaces.js"

export function curryInitializePersona({
		settingsSheriff,
		profileMagistrate,
		generateRandomNickname,
	}: {
		generateRandomNickname: () => string
		settingsSheriff: SettingsSheriffTopic
		profileMagistrate: ProfileMagistrateTopic
	}): InitializePersona {

	return async function({userId, avatar, accessToken}) {

		//
		// create profile, unless there already is one
		//

		let profile = await profileMagistrate.getProfile({userId})
		if (!profile) {
			profile = {
				userId,
				avatar: null,
				tagline: null,
				joined: Date.now(),
				nickname: generateRandomNickname(),
			}
			await profileMagistrate.setProfile({accessToken, profile})
		}

		//
		// initialize settings
		//

		await settingsSheriff.setAvatar({accessToken, avatar})
		await settingsSheriff.setAvatarPublicity({
			accessToken,
			avatarPublicity: true,
		})
	}
}