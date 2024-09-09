import { localDataManager } from "./local_static_data";
import { nocodbClient } from "./nocodb";
import { notionClient } from "./notion";
import utils from "./utils";

const gamesStaticDatabase = {
	test(): void {
		console.log("测试本地静态数据...");
		localDataManager.test();
		console.log("测试 NocoDB 云端数据库...");
		nocodbClient.test();
	},

	async upload(
		gameName: string,
		tableName: string,
		databaseType = "nocodb",
	): Promise<void> {
		const localGameData = localDataManager.loadData(gameName, tableName);
		switch (databaseType) {
			case "notion": {
				/**
				 * @todo not implemented
				 */
				break;
			}

			// nocodb
			default: {
				await nocodbClient.setTableRecords(gameName, tableName, localGameData);
				break;
			}
		}
	},

	async download(
		gameName: string,
		tableName: string,
		databaseType = "nocodb",
	): Promise<void> {
		let latestGameData: object[] = [];
		switch (databaseType) {
			case "notion": {
				/**
				 * @todo not implemented
				 */
				break;
			}

			// nocodb
			default: {
				latestGameData = await nocodbClient.getTableRecords(
					gameName,
					tableName,
				);
				break;
			}
		}
		localDataManager.saveData(latestGameData, gameName, tableName);
	},
};

function main(debug = false): void {
	if (debug) {
		gamesStaticDatabase.test();
		return;
	}
	const [databaseType, gameName, tableName]: string[] = [
		Bun.env.GAME_DATABASE || "nocodb",
		Bun.env.GAME_NAME || "",
		(Bun.env.GAME_TABLE || "").toLowerCase(),
	];
	if ([gameName, tableName].includes("")) {
		console.error("未指定游戏名或表名");
		return;
	}
	switch (Bun.env.ACTION) {
		case "upload": {
			gamesStaticDatabase.upload(gameName, tableName, databaseType);
			break;
		}

		case "download": {
			gamesStaticDatabase.download(gameName, tableName, databaseType);
			break;
		}

		default: {
			console.warn("未指定运行模式");
			break;
		}
	}
}

main([undefined, "development"].includes(Bun.env.NODE_ENV));
