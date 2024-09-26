import { localDataManager } from "./local_file";
import { steamAchievementManager as SAM } from "./steam_achievement";
import { nocodbClient } from "./nocodb";
import { notionClient } from "./notion";

const gamesStaticDatabase = {
	async download(
		gameName: string,
		tableName: string,
		databaseType = "nocodb",
	): Promise<void> {
		let latestData: object[] = [];
		if (tableName === "achievements") {
			latestData = await SAM.getAchievements(gameName); // Cache Steam Achievements
		} else {
			switch (databaseType) {
				case "notion": {
					/**
					 * @todo Not implemented
					 */
					break;
				}

				// NocoDB
				default: {
					latestData = await nocodbClient.getTableRecords(gameName, tableName);
					break;
				}
			}
		}
		console.table(latestData);
		localDataManager.saveData(latestData, gameName, tableName);
	},

	async upload(
		gameName: string,
		tableName: string,
		databaseType = "nocodb",
	): Promise<void> {
		let localData: object[] = [];
		if (tableName === "achievements") {
			localData = await SAM.getAchievements(gameName); // Sync Steam Achievements
		} else {
			localData = localDataManager.loadData(gameName, tableName);
		}
		console.table(localData);
		switch (databaseType) {
			case "notion": {
				/**
				 * @todo Not implemented
				 */
				break;
			}

			// NocoDB
			default: {
				await nocodbClient.setTableRecords(gameName, tableName, localData);
				break;
			}
		}
	},

	async test(): Promise<void> {
		// console.log("测试本地静态数据...");
		// localDataManager.test();
		// console.log("测试 NocoDB 云端数据库...");
		// nocodbClient.test();
		console.log("测试读取 Steam 成就...");
		const gameName = "slay-the-spire";
		gamesStaticDatabase.download(gameName, "achievements");
	},
};

function main(debug = false): void {
	if (debug) {
		gamesStaticDatabase.test();
		return;
	}
	const defaultConfig = {
		databaseType: Bun.env.DB_DEFAULT_USE || "nocodb",
		gameName: Bun.env.GAME_NAME || "",
		tableName: Bun.env.GAME_TABLE || "",
	};
	// console.debug(Bun.env.ACTION);
	const [, , firstArgv, ...otherArgs] = Bun.argv;
	let [gameName, tableName, databaseType] = otherArgs;
	gameName = (gameName || defaultConfig.gameName).toLowerCase();
	tableName = (tableName || defaultConfig.tableName).toLowerCase();
	databaseType = (databaseType || defaultConfig.databaseType).toLowerCase();
	switch (firstArgv) {
		case "u":
		case "--upload": {
			gamesStaticDatabase.upload(gameName, tableName, databaseType);
			break;
		}

		case "d":
		case "--download": {
			gamesStaticDatabase.download(gameName, tableName, databaseType);
			break;
		}

		default: {
			console.error("Missing parameters, run mode not specified");
			break;
		}
	}
}

main([undefined, "development"].includes(Bun.env.NODE_ENV));
