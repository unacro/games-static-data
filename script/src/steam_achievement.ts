import utils from "./utils";

// @ts-ignore
import SteamAppInfo from "./steam_app_info.toml";

class SteamAchievementManager {
	#steamWebApi = "";
	#achStatsApi = "";
	protected steamUserId: string;
	protected steamWebApiKey: string;
	protected achStatsAccessKey: string;

	protected get steamWebApi(): string {
		return this.#steamWebApi;
	}

	protected set steamWebApi(url: string) {
		this.#steamWebApi = utils.trimRightSlash(url);
	}

	protected get achStatsApi(): string {
		return this.#achStatsApi;
	}

	protected set achStatsApi(url: string) {
		this.#achStatsApi = utils.trimRightSlash(url);
	}

	constructor({ isSteamPartner = false, useShortAchStatsUrl = false } = {}) {
		/**
		 * @description Steam Official Web API
		 * @see https://partner.steamgames.com/doc/webapi/ISteamUserStats#GetPlayerAchievements
		 */
		if (isSteamPartner) {
			this.steamWebApi = "https://partner.steam-api.com/";
		} else {
			this.steamWebApi = "https://api.steampowered.com/";
		}

		/**
		 * @description Achievement Stats API
		 * @see https://www.achievementstats.com/index.php?action=api
		 */
		if (useShortAchStatsUrl) {
			this.achStatsApi = "https://api.achstats.com/";
		} else {
			this.achStatsApi = "https://api.achievementstats.com/";
		}

		const steamUserId = Bun.env.STEAM_USER_ID || "";
		if (typeof steamUserId !== "string" || steamUserId === "") {
			console.warn("Steam User ID not specified");
			this.steamUserId = "";
		} else {
			this.steamUserId = steamUserId;
		}

		/**
		 * @var steamWebApiKey
		 * @description Steamworks Web API 用户验证密钥
		 * @see https://partner.steamgames.com/doc/webapi_overview/auth
		 * @link https://steamcommunity.com/dev/apikey
		 */
		const steamWebApiKey = Bun.env.STEAM_WEB_API_KEY || "";
		if (typeof steamWebApiKey !== "string" || steamWebApiKey === "") {
			console.warn("Steamworks Web API user key not specified");
			this.steamWebApiKey = "";
		} else {
			this.steamWebApiKey = steamWebApiKey;
		}

		const achStatsAccessKey = Bun.env.ACH_STATS_ACCESS_KEY || "";
		if (typeof achStatsAccessKey !== "string" || achStatsAccessKey === "") {
			console.warn("AchStats API access key not specified");
			this.achStatsAccessKey = "";
		} else {
			this.achStatsAccessKey = achStatsAccessKey;
		}
	}

	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	getGameInfo(gameName: string): { [key: string]: any } {
		const queryResult = SteamAppInfo.games
			.filter(
				// biome-ignore lint/suspicious/noExplicitAny: <explanation>
				(game: { [key: string]: any }) =>
					utils.dehumanize(game.name) === utils.dehumanize(gameName),
			)
			.pop();
		return queryResult;
	}

	async getGameAchievements(
		gameName: string,
		dataOrigin = Bun.env.ACHIEVEMENT_DATA_ORIGIN,
	): Promise<object[]> {
		const gameInfo = this.getGameInfo(gameName);
		const gameAppId = gameInfo.appId.toString();
		let gameAchievements: object[] = [];
		switch (dataOrigin) {
			case "ach_stats": {
				console.time("[AchStats API] Query elapsed");
				const response = await fetch(
					[
						`${this.achStatsApi}/games/${gameAppId}/achievements/`,
						`?key=${this.achStatsAccessKey}`,
					].join(""),
				);
				if (response.status !== 200) {
					console.error(`查询 ${gameName} 的成就失败`);
					console.log(await response.text());
					return [];
				}
				console.timeEnd("[AchStats API] Query elapsed");
				gameAchievements = await response.json();
				break;
			}

			/**
			 * @description True Steam Achievements
			 * @see https://truesteamachievements.com/
			 * @todo Not implemented
			 */
			case "tsa": {
				break;
			}

			default: {
				const interfaceUrl = [
					`${this.steamWebApi}/ISteamWebAPIUtil/GetSupportedAPIList/v1/`,
					`?key=${this.steamWebApiKey}`,
				].join("");
				break;
			}
		}
		return gameAchievements;
	}

	async getPlayerAchievements(
		gameName: string,
		dataOrigin = Bun.env.ACHIEVEMENT_DATA_ORIGIN,
	): Promise<object[]> {
		const gameInfo = this.getGameInfo(gameName);
		const gameAppId = gameInfo.appId.toString();
		let playerAchievements: object[] = [];
		switch (dataOrigin) {
			case "ach_stats": {
				const updateResponse = await fetch(
					`${this.achStatsApi}/profiles/${this.steamUserId}/update/?key=${this.achStatsAccessKey}`,
					{ method: "POST" },
				);
				if (updateResponse.status === 202) {
					console.log(
						`[AchStats API] Triggered update of profile ${this.steamUserId}`,
					);
				} else {
					console.warn(
						`[AchStats API] Trigger update of profile ${this.steamUserId} failed`,
					);
					console.log(await updateResponse.text());
				}

				const response = await fetch(
					[
						`${this.achStatsApi}/profiles/${this.steamUserId}/achievements/`,
						`?key=${this.achStatsAccessKey}&appIds=[${gameAppId}]`,
					].join(""),
				);
				if (response.status !== 200) {
					console.error(
						`[AchStats API] Query achievements of "${gameName}" failed`,
					);
					console.log(await response.text());
					return [];
				}
				playerAchievements = await response.json();
				break;
			}

			default: {
				const ApiUrl = `${this.steamWebApi}/ISteamUserStats/GetPlayerAchievements/v1/`;
				const requestParams = new URLSearchParams();
				requestParams.append("key", this.steamWebApiKey);
				requestParams.append("steamid", this.steamUserId); // 64 位 Steam ID 只能用字符串存 (否则会损失精度导致出错)
				requestParams.append("appid", gameAppId);
				requestParams.append("l", "schinese"); // english / schinese

				// const response = await fetch(ApiUrl, {
				// 	method: "POST",
				// 	headers: {
				// 		"Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
				// 	},
				// 	body: requestParams.toString(),
				// });
				// error: This API must be called with a HTTP GET request

				console.time("[Steam Web API] Query elapsed");
				console.log(`${ApiUrl}?${requestParams.toString()}`);

				const response = await fetch(`${ApiUrl}?${requestParams.toString()}`);
				if (response.status !== 200) {
					console.error(
						`[Steam Web API] Query achievement stats of "${gameName}" failed`,
					);
					console.log(await response.text());
					console.warn(
						[
							"Manually verify by accessing ",
							`https://steamcommunity.com/profiles/${this.steamUserId}`,
							`/stats/${gameAppId}/achievements/`,
						].join(""),
					);
					return [];
				}
				const queryResponse = await response.json();
				console.timeEnd("[Steam Web API] Query elapsed");
				console.log(
					`[Steam Web API] Queried achievement stats of "${gameName}"`,
				);
				playerAchievements = queryResponse.playerstats.achievements;
			}
		}
		return playerAchievements;
	}

	async getAchievements(
		gameName: string,
		enableLockStats = false,
	): Promise<object[]> {
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		const [steamData, achStatsData]: { [key: string]: any }[] =
			await Promise.all([
				this.getPlayerAchievements(gameName, "steam"),
				this.getGameAchievements(gameName, "ach_stats"),
			]);
		if (steamData.length === 0 || achStatsData.length === 0) {
			throw new Error(
				`The result counts of the two queries are inconsistent: Steam(${steamData.length}), AchStats(${achStatsData.length})`,
			);
		}
		const combinedResult: object[] = [];
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		steamData.map((steamAchievement: { [key: string]: any }, index: number) => {
			// biome-ignore lint/suspicious/noExplicitAny: <explanation>
			const achievement: { [key: string]: any } = {
				Name: steamAchievement.name,
				Description: steamAchievement.description,
				IconLocked: achStatsData[index].iconLocked,
				IconUnlocked: achStatsData[index].iconUnlocked,
				ApiName: steamAchievement.apiname,
				AddTime: Number(achStatsData[index].added),
			};
			if (enableLockStats) {
				achievement.Achieved = steamAchievement.achieved === 1;
				achievement.UnlockTime = steamAchievement.unlocktime;
			}
			combinedResult.push(achievement);
		});
		return combinedResult;
	}
}

export const steamAchievementManager = new SteamAchievementManager();
