
import {Logger} from "./logger/interfaces.js"

/**
 * Don't tolerate any unhandled exceptions or rejections in your node program
 */
export function deathWithDignity({logger = console}: {
	logger?: Logger
} = {}) {

	process.on("SIGINT", () => {
		logger.log("💣 SIGINT")
		process.exit(0)
	})
	
	process.on("SIGTERM", () => {
		logger.log("🗡️ SIGTERM")
		process.exit(0)
	})

	process.on("uncaughtException", error => {
		logger.error("unhandled exception:", error)
		process.exit(1)
	})

	process.on("unhandledRejection", (reason, error) => {
		logger.error("unhandled rejection:", reason, error)
		process.exit(1)
	})
}
