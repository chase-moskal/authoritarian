
import {MetalUser} from "../../../types.js"
import {LitElement, html, css} from "lit-element"
import {generateId} from "../../../toolbox/generate-id.js"
import {mixinStyles} from "../../framework/mixin-styles.js"

const day = 1000 * 60 * 60 * 24

const styles = css`

.complex {
	display: flex;
	flex-direction: row;
	background: rgba(255,255,255, 0.1);
	padding: 0.5em;
}

cobalt-card {
	padding-left: 1em;
}

`

 @mixinStyles(styles)
export class DemoCobalt extends LitElement {
	render() {
		const user: MetalUser = {
			userId: generateId(),
			claims: {
				admin: true,
				staff: true,
				banReason: "spam",
				banUntil: Date.now() + (day * 7),
				joined: Date.now() - (day * 30),
				premiumUntil: Date.now() + (day * 24),
			},
			profile: {
				nickname: "Method Man",
				tagline: "wu-tang style",
				avatar: "https://i.imgur.com/CEqYyCy.jpg",
			},
		}
		return html`
			<div class="complex">
				<cobalt-avatar .user=${user}></cobalt-avatar>
				<cobalt-card .user=${user}></cobalt-card>
			</div>
		`
	}
}
